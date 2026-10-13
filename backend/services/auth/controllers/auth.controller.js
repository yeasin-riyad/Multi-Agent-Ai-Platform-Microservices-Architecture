import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";

import jwt from "jsonwebtoken";
import redis from "../../../shared/redis/redis.js";
import mongoose from "mongoose";

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

    // const sessionId = crypto.randomUUID();
    // await redis.set(`user-session-${user?._id}`,sessionId,"EX",7*24*60*60)
    // await redis.set(
    //   `session-${sessionId}`,
    //   JSON.stringify({
    //     userId: user._id,
    //     name: user.name,
    //     email: user.email,
    //     avatar: user.avatar,
    //   }),
    //   "EX",
    //   7 * 24 * 60 * 60,
    // );

    // res.cookie("session", sessionId, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    const jwtPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      credits:user.credits,
      plan:user.plan
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
        //  const sessionId= await redis.get(`user-session-${user?._id}`)
    // await redis.del(`session-${sessionId}`);
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
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 দিন

    user.lastProcessedOrderId = orderId;
    user.plan=plan;

    await user.save();

    //  const sessionId= await redis.get(`user-session-${user?._id}`)
    // await redis.set(
    //   `session-${sessionId}`,
    //   JSON.stringify({
    //     userId: user._id,
    //     name: user.name,
    //     email: user.email,
    //     avatar: user.avatar,
    //     plan:user.plan,
    //     credits:user.credits,
    //     totalCredits:user.totalCredits,
    //     planExpiresAt:user.planExpiresAt
    //   }),
    //   "EX",
    //   7 * 24 * 60 * 60,
    // );


   
    // console.log(user,"User....")

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



/* ──────────────────────────────────────────────────────────────── */
/*  Agent cost mapping                                            */
/* ──────────────────────────────────────────────────────────────── */

const AGENT_COST = {
  chat: 1,
  search: 5,
  coding: 10,
  pdf: 10,
  ppt: 10,
  vision: 10,
  // ভবিষ্যতে আরো agent যোগ করা যাবে
};

/* ──────────────────────────────────────────────────────────────── */
/*  DEDUCT CREDITS                                                */
/*  Chat / Agent service → এই endpoint-এ POST করে                 */
/* ──────────────────────────────────────────────────────────────── */

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    // ─── 1. Input validation ────────────────────────────────────
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!agent) {
      return res.status(400).json({ message: "agent is required" });
    }

    const cost = AGENT_COST[agent];
    if (typeof cost !== "number") {
      return res.status(400).json({
        message: `Unknown agent: "${agent}"`,
        validAgents: Object.keys(AGENT_COST),
      });
    }

    // ─── 2. User existence check ─────────────────────────────────
    // ⚠️ ObjectId validation আগে করো, নাহলে mongoose CastError throw করে
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ─── 3. Plan expiry check (optional কিন্তু recommended) ──────
    // Plan expire হয়ে গেলে credit ব্যবহার করতে পারবে না
    if (user.planExpiresAt && user.planExpiresAt < new Date()) {
      return res.status(403).json({
        message: "Your plan has expired. Please renew to continue.",
        code: "PLAN_EXPIRED",
        planExpiresAt: user.planExpiresAt,
      });
    }

    // ─── 4. Sufficient credits check ─────────────────────────────
    if ((user.credits || 0) < cost) {
      return res.status(402).json({  // 402 = Payment Required
        message: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: cost,
        available: user.credits || 0,
      });
    }

    // ─── 5. Atomic deduction ─────────────────────────────────────
    // ⚠️ findOneAndUpdate with $inc → race condition safe
    // দুইটা concurrent request এলে double-deduct হবে না
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        credits: { $gte: cost }, // ⚠️ Guard: যেন negative না হয়
      },
      {
        $inc: { credits: -cost },
      },
      {
        new: true, // updated document return করো
        select: "credits totalCredits plan planExpiresAt",
      },
    );

    // ─── 6. Guard fail হলে (concurrent deduct) ───────────────────
    if (!updatedUser) {
      // মানে এতক্ষণে অন্য request credits কমিয়ে দিয়েছে → এখন insufficient
      return res.status(402).json({
        message: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: cost,
      });
    }

    // ─── 7. Success response ─────────────────────────────────────
    console.log(
      `💳 [${agent}] -${cost} credits from user ${userId} (balance: ${updatedUser.credits})`,
    );

    return res.status(200).json({
      success: true,
      message: `${cost} credit${cost > 1 ? "s" : ""} deducted`,
      agent,
      cost,
      remaining: updatedUser.credits,
      plan: updatedUser.plan,
    });
  } catch (error) {
    console.error("deductCredits error:", error);
    return res.status(500).json({
      message: `deductCredits error: ${error.message}`,
    });
  }
};



export const getMe = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];  // Gateway inject করেছে

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ─── Auto-expire check ───────────────────────────────────────
    // Plan expire হয়ে গেলে credits 0 করে দাও (optional business logic)
    let planExpired = false;
    if (
      user.planExpiresAt &&
      user.planExpiresAt < new Date() &&
      user.plan !== "free"
    ) {
      planExpired = true;
    }

    return res.status(200).json({
      _id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
      planActivatedAt: user.planActivatedAt,
      planExpiresAt: user.planExpiresAt,
      planExpired, // frontend এটা দেখে "Renew" button দেখাতে পারে
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({
      message: `getMe error: ${error.message}`,
    });
  }
};

