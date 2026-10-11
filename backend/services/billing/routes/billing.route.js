import express from "express";
import {
  createOrder,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} from "../controllers/billing.controllers.js";

const router = express.Router();

// Client → create order
router.post("/create-order", createOrder);

router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIPN);

export default router;