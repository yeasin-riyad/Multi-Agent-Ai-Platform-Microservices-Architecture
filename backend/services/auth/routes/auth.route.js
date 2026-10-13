import express from 'express';
import { deductCredits, getMe, login, logout, updateUserPayment } from '../controllers/auth.controller.js';
import { internalAuth } from '../config/middleware/internalAuth.js';

const router=express.Router();

router.post("/login",login);
router.get("/logout",logout);
router.get("/get-me", getMe);




// 🔒 শুধু billing service access করতে পারবে
router.post(
  "/update-payment",
  internalAuth,
  updateUserPayment,
);

// 🔒 Internal — শুধু chat/agent service call করে
router.post(
  "/deduct-credits",
  internalAuth,
  deductCredits,
);

export default router;