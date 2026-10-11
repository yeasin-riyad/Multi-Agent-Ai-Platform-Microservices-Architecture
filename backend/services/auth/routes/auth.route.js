import express from 'express';
import { login, logout, updateUserPayment } from '../controllers/auth.controller.js';
import { internalAuth } from '../config/middleware/internalAuth.js';

const router=express.Router();

router.post("/login",login);
router.get("/logout",logout);


// 🔒 শুধু billing service access করতে পারবে
router.post(
  "/update-payment",
  internalAuth,
  updateUserPayment,
);

export default router;