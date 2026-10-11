import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

/* -------------------------------------------------------------------------- */
/*  LOGIN                                                                     */
/* -------------------------------------------------------------------------- */

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Firebase token missing" });
    }

    const decoded = await getAuth(app).verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
        avatar: decoded.picture || "",
        // credits & totalCredits default 100 ধরে নেবে model থেকে
      });
    }

    const jwtPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `login error ${error.message}` });
  }
};

/* -------------------------------------------------------------------------- */
/*  LOGOUT                                                                    */
/* -------------------------------------------------------------------------- */

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `logout error ${error.message}` });
  }
};

/* -------------------------------------------------------------------------- */
/*  UPDATE USER PAYMENT                                                       */
/*  Billing service → এই endpoint-এ POST করে payment successful হলে             */
/* -------------------------------------------------------------------------- */

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId, orderId } = req.body;

    // ─── 1. Input validation ─────────────────────────────────────────
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!plan || typeof plan !== "string") {
      return res.status(400).json({ message: "plan is required" });
    }
    if (typeof credits !== "number" || credits <= 0) {
      return res
        .status(400)
        .json({ message: "credits must be a positive number" });
    }
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // ─── 2. User খুঁজে বের করো ────────────────────────────────────────
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ─── 3. Idempotency guard ────────────────────────────────────────
    // success_url এবং ipn_url দুটোই আসতে পারে → একই order দুইবার process হবে না
    if (user.lastProcessedOrderId === orderId) {
      console.log(`⚠️ Order ${orderId} already processed for user ${userId}`);
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        message: "Order already processed",
        user,
      });
    }

    // Plan upgrade হলেই replace, same plan renew হলে add
if (user.plan === plan) {
  user.credits = (user.credits || 0) + credits;
} else {
  user.credits = credits;
}
user.totalCredits = (user.totalCredits || 0) + credits;

    user.planActivatedAt = new Date();
    user.planExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 দিন

    user.lastProcessedOrderId = orderId;

    await user.save();

    console.log(
      `✅ User ${user.email} → plan: ${plan}, credits: ${user.credits}, totalCredits: ${user.totalCredits}`,
    );

    return res.status(200).json({
      success: true,
      message: "User payment updated successfully",
      user,
    });
  } catch (error) {
    console.error("updateUserPayment error:", error);
    return res.status(500).json({
      message: `updateUserPayment error ${error.message}`,
    });
  }
};