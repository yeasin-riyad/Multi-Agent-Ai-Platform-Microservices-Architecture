import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";

import jwt from "jsonwebtoken";
import redis from "../../../shared/redis/redis.js";
import mongoose from "mongoose";
import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/* LOGIN                                                                      */
/* -------------------------------------------------------------------------- */

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Firebase token missing",
      });
    }

    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
        avatar: decoded.picture || "",
      });
    }

    /* ─── Create Redis Session ─────────────────────────────── */

    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
      planExpiresAt: user.planExpiresAt,
    };

    await redis.set(
      `user-session-${user._id}`,
      sessionId,
      "EX",
      7 * 24 * 60 * 60,
    );

    await redis.set(
      `session-${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      7 * 24 * 60 * 60,
    );

    /* ─── JWT ──────────────────────────────────────────────── */

    const jwtPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      credits: user.credits,
      plan: user.plan,
    };

    const jwtToken = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    /* ─── Response ─────────────────────────────────────────── */

    return res.status(200).json(user);
  } catch (error) {
    console.error("login error:", error);

    return res.status(500).json({
      message: `login error ${error.message}`,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* LOGOUT                                                                     */
/* -------------------------------------------------------------------------- */

export const logout = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.userId || req.user?._id;

    if (userId) {
      const sessionId = await redis.get(
        `user-session-${userId}`,
      );

      if (sessionId) {
        await redis.del(`session-${sessionId}`);
      }

      await redis.del(`user-session-${userId}`);
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (error) {
    console.error("logout error:", error);

    return res.status(500).json({
      message: `logout error ${error.message}`,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE USER PAYMENT                                                        */
/* -------------------------------------------------------------------------- */

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId, orderId } = req.body;

    /* ─── Input Validation ────────────────────────────────── */

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    if (!plan || typeof plan !== "string") {
      return res.status(400).json({
        message: "plan is required",
      });
    }

    if (typeof credits !== "number" || credits <= 0) {
      return res.status(400).json({
        message: "credits must be a positive number",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        message: "orderId is required",
      });
    }

    /* ─── Find User ────────────────────────────────────────── */

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ─── Idempotency Guard ───────────────────────────────── */

    if (user.lastProcessedOrderId === orderId) {
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        message: "Order already processed",
        user,
      });
    }

    /* ─── Update Credits ──────────────────────────────────── */

    if (user.plan === plan) {
      user.credits = (user.credits || 0) + credits;
    } else {
      user.credits = credits;
    }

    user.totalCredits = (user.totalCredits || 0) + credits;

    user.planActivatedAt = new Date();

    user.planExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    user.lastProcessedOrderId = orderId;
    user.plan = plan;

    await user.save();

    /* ─── Update Redis Session ────────────────────────────── */

    const sessionId = await redis.get(
      `user-session-${user._id}`,
    );

    if (sessionId) {
      await redis.set(
        `session-${sessionId}`,
        JSON.stringify({
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpiresAt: user.planExpiresAt,
        }),
        "EX",
        7 * 24 * 60 * 60,
      );
    }

    /* ─── Response ─────────────────────────────────────────── */

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

/* -------------------------------------------------------------------------- */
/* AGENT COST MAPPING                                                         */
/* -------------------------------------------------------------------------- */

const AGENT_COST = {
  chat: 1,
  search: 5,
  coding: 10,
  pdf: 10,
  ppt: 10,
  vision: 10,
  pdfRag: 15,
  imageAnalyzer: 10,
};

/* -------------------------------------------------------------------------- */
/* DEDUCT CREDITS                                                             */
/* -------------------------------------------------------------------------- */

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    /* ─── Input Validation ─────────────────────────────────── */

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    if (!agent) {
      return res.status(400).json({
        message: "agent is required",
      });
    }

    const cost = AGENT_COST[agent];

    if (typeof cost !== "number") {
      return res.status(400).json({
        message: `Unknown agent: "${agent}"`,
        validAgents: Object.keys(AGENT_COST),
      });
    }

    /* ─── Validate ObjectId ────────────────────────────────── */

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ─── Plan Expiry Check ────────────────────────────────── */

    if (
      user.planExpiresAt &&
      user.planExpiresAt < new Date()
    ) {
      return res.status(403).json({
        message: "Your plan has expired. Please renew to continue.",
        code: "PLAN_EXPIRED",
        planExpiresAt: user.planExpiresAt,
      });
    }

    /* ─── Sufficient Credits Check ─────────────────────────── */

    if ((user.credits || 0) < cost) {
      return res.status(402).json({
        message: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: cost,
        available: user.credits || 0,
      });
    }

    /* ─── Atomic Credit Deduction ──────────────────────────── */

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        credits: { $gte: cost },
      },
      {
        $inc: { credits: -cost },
      },
      {
        new: true,
        select: "credits totalCredits plan planExpiresAt",
      },
    );

    if (!updatedUser) {
      return res.status(402).json({
        message: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        required: cost,
      });
    }

    /* ─── Update Redis Session Credits ─────────────────────── */

    const sessionId = await redis.get(
      `user-session-${userId}`,
    );

    if (sessionId) {
      const sessionKey = `session-${sessionId}`;
      const rawSession = await redis.get(sessionKey);

      if (rawSession) {
        const session = JSON.parse(rawSession);

        session.credits = updatedUser.credits;
        session.totalCredits = updatedUser.totalCredits;
        session.plan = updatedUser.plan;
        session.planExpiresAt = updatedUser.planExpiresAt;

        await redis.set(
          sessionKey,
          JSON.stringify(session),
          "EX",
          7 * 24 * 60 * 60,
        );
      }
    }

    /* ─── Success Response ─────────────────────────────────── */

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

/* -------------------------------------------------------------------------- */
/* GET CURRENT USER                                                           */
/* -------------------------------------------------------------------------- */

export const getMe = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ─── Plan Expiry Check ────────────────────────────────── */

    const planExpired = Boolean(
      user.planExpiresAt &&
      user.planExpiresAt < new Date() &&
      user.plan !== "free",
    );

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
      planExpired,
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