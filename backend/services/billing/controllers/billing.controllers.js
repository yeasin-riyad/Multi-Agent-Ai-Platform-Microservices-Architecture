import dotenv from 'dotenv'
import crypto from "crypto";
import axios from "axios";
import SSLCommerzPayment from "sslcommerz-lts";

import Payment from "../models/payment.model.js";
import { PLANS } from "../config/Plan.js";

const store_id = process.env.STORE_ID || "sass6ac8fdadd0e0b";
const store_passwd = process.env.STORE_PASSWD || "0fNLyc2MfBLK";
const is_live = process.env.IS_LIVE || false;
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const VALIDATION_API = is_live
  ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
  : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

/* -------------------------------------------------------------------------- */
/*  CREATE ORDER                                                              */
/* -------------------------------------------------------------------------- */

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers["x-user-id"];

    // 1. Validation
    if (!userId) {
      return res.status(401).json({ message: "User ID missing" });
    }

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Free plan → সরাসরি credit দিয়ে দাও, gateway লাগবে না
    if (selectedPlan.amount === 0) {
      const payment = await Payment.create({
        userId,
        orderId: `FREE_${Date.now()}`,
        amount: 0,
        credits: selectedPlan.credits,
        plan: selectedPlan.id,
        status: "paid",
        paidAt: new Date(),
      });

      // 👉 এখানে user service-এ credit যোগ করার call দাও
      // await axios.post(`${USER_SERVICE}/credits/add`, { userId, credits: selectedPlan.credits });

      return res.status(200).json({
        success: true,
        message: "Free plan activated",
        data: payment,
      });
    }

    // 2. Unique transaction ID
    const tran_id = `TXN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // 3. Payment record আগে save করো
    const payment = await Payment.create({
      userId,
      orderId: tran_id,
      amount: selectedPlan.amount,
      currency: "BDT",
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      status: "created",
    });

    // 4. SSLCommerz payload
    const data = {
      total_amount: selectedPlan.amount,
      currency: "BDT",
      tran_id,

      success_url: `${BASE_URL}/api/billing/success`,
      fail_url: `${BASE_URL}/api/billing/fail`,
      cancel_url: `${BASE_URL}/api/billing/cancel`,
      ipn_url: `${BASE_URL}/api/billing/ipn`,

      shipping_method: "No",
      product_name: selectedPlan.name,
      product_category: "Subscription",
      product_profile: "non-physical-goods",

      cus_name: req.body.name || "Customer",
      cus_email: req.body.email || "customer@example.com",
      cus_add1: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: req.body.phone || "01711111111",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);
    console.log("🔍 SSLCommerz response:", JSON.stringify(apiResponse, null, 2));


    if (!apiResponse?.GatewayPageURL) {
      payment.status = "failed";
      await payment.save();
      return res.status(502).json({ message: "Gateway init failed" });
    }

    // 5. Session key সেভ করো (optional)
    payment.paymentId = apiResponse.sessionkey;
    await payment.save();

    return res.status(200).json({
      success: true,
      url: apiResponse.GatewayPageURL,
      orderId: tran_id,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*  VALIDATION HELPER                                                         */
/* -------------------------------------------------------------------------- */

async function validateWithSSLCommerz(val_id) {
  const { data } = await axios.get(VALIDATION_API, {
    params: {
      val_id,
      store_id,
      store_passwd,
      format: "json",
    },
  });
  return data;
}

/**
 * Order কে paid mark করে — idempotent
 */
async function fulfillOrder({ val_id, tran_id }) {
  const payment = await Payment.findOne({ orderId: tran_id });

  if (!payment) {
    return { ok: false, reason: "ORDER_NOT_FOUND" };
  }

  // Idempotency guard
  if (payment.status === "paid") {
    return { ok: true, payment, alreadyPaid: true };
  }

  // SSLCommerz থেকে verify করো
  const validation = await validateWithSSLCommerz(val_id);

  const validStatuses = ["VALID", "VALIDATED"];
  if (!validStatuses.includes(validation.status)) {
    payment.status = "failed";
    payment.rawResponse = validation;
    await payment.save();
    return { ok: false, reason: validation.status };
  }

  // Amount এবং currency check
  if (Number(validation.amount) < Number(payment.amount)) {
    payment.status = "failed";
    payment.rawResponse = validation;
    await payment.save();
    return { ok: false, reason: "AMOUNT_MISMATCH" };
  }

  if (validation.currency !== "BDT") {
    payment.status = "failed";
    payment.rawResponse = validation;
    await payment.save();
    return { ok: false, reason: "CURRENCY_MISMATCH" };
  }

  // ✅ সব ঠিক → paid mark
  payment.status = "paid";
  payment.valId = validation.val_id;
  payment.bankTranId = validation.bank_tran_id;
  payment.paidAt = new Date();
  payment.rawResponse = validation;
  await payment.save();
  console.log(process.env.AUTH_SERVICE_URL,"HI")

  try {
  await axios.post(
    `${process.env.AUTH_SERVICE_URL}/api/auth/update-payment`,
    {
      userId: payment.userId,
      plan: payment.plan,
      credits: payment.credits,
      orderId: payment.orderId, // 🔑 idempotency-র জন্য জরুরি
    },
    {
      headers: {
        "x-internal-secret":process.env.INTERNAL_SECRET,
      },
      timeout: 5000,
    },
  );
} catch (err) {
  console.error("❌ Failed to update user:", err.message);
  // ⚠️ Throw করো না — payment already paid
  // Retry queue / cron job দিয়ে পরে আবার চেষ্টা করো
}

  console.log(`✅ Payment fulfilled: ${tran_id} (${payment.credits} credits)`);

  return { ok: true, payment };
}

/* -------------------------------------------------------------------------- */
/*  SUCCESS / FAIL / CANCEL / IPN                                             */
/* -------------------------------------------------------------------------- */

export const paymentSuccess = async (req, res) => {
  try {
    const { val_id, tran_id } = req.body;

    const result = await fulfillOrder({ val_id, tran_id });

    if (result.ok) {
      return res.redirect(
        `${CLIENT_URL}/payment/success?tran_id=${tran_id}`,
      );
    }
    return res.redirect(
      `${CLIENT_URL}/payment/failed?tran_id=${tran_id}&reason=${result.reason}`,
    );
  } catch (error) {
    console.error("paymentSuccess error:", error);
    return res.redirect(`${CLIENT_URL}/payment/failed`);
  }
};

export const paymentIPN = async (req, res) => {
  try {
    const { val_id, tran_id, status } = req.body;

    if (status !== "VALID" && status !== "VALIDATED") {
      return res.status(200).send("Ignored");
    }

    await fulfillOrder({ val_id, tran_id });
    return res.status(200).send("OK");
  } catch (error) {
    console.error("paymentIPN error:", error);
    return res.status(200).send("Error logged");
  }
};

export const paymentFail = async (req, res) => {
  try {
    const { tran_id } = req.body;
    await Payment.findOneAndUpdate(
      { orderId: tran_id },
      { status: "failed", rawResponse: req.body },
    );
    return res.redirect(`${CLIENT_URL}/payment/failed?tran_id=${tran_id}`);
  } catch (error) {
    console.error("paymentFail error:", error);
    return res.redirect(`${CLIENT_URL}/payment/failed`);
  }
};

export const paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;
    await Payment.findOneAndUpdate(
      { orderId: tran_id },
      { status: "cancelled", rawResponse: req.body },
    );
    return res.redirect(`${CLIENT_URL}/payment/cancelled?tran_id=${tran_id}`);
  } catch (error) {
    console.error("paymentCancel error:", error);
    return res.redirect(`${CLIENT_URL}/payment/cancelled`);
  }
};