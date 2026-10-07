// import { getAuth } from "firebase-admin/auth";
// import { app } from "../config/firebase.js";
// import User from "../models/user.model.js";
// import redis from "../../../shared/redis/redis.js";
// export const login = async (req, res) => {
//   try {
//     const { token } = req.body;
//     const decoded = await getAuth(app).verifyIdToken(token);
//     let user = await User.findOne({ firebaseUid: decoded.uid });

//     if (!user) {
//       user = await User.create({
//         firebaseUid: decoded.uid,
//         name: decoded.name,
//         email: decoded.email,
//         avatar: decoded.picture,
//       });
//     }

//     const sessionId = crypto.randomUUID();
//     await redis.set(
//       `session-${sessionId}`,
//       JSON.stringify({
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       }),
//       "EX",
//       7 * 24 * 60 * 60, // 7 days in seconds
//     );
//     res.cookie("session", sessionId, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
//     });

//     return res.status(200).json(user);
//   } catch (error) {
//     return res.status(500).json({ message: `login error ${error}` });
//   }
// };


// export const logout=async(req,res)=>{
//     try {
//         const sessionId=req.cookies?.session;
//         await redis.del(`session-${sessionId}`);
//         res.clearCookie("session");
//         return res.status(200).json({message:"Logout Successfully"});
//     } catch (error) {
//             return res.status(500).json({ message: `logout error ${error}` });

//     }
// }


import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"; // ioredis ও redis-এর পরিবর্তে এটি যুক্ত করা হলো
import crypto from "crypto";     // crypto.randomUUID() ব্যবহারের জন্য এটি প্রয়োজন

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    
    // ১. ফায়ারবেস টোকেন ভেরিফাই করা হচ্ছে
    const decoded = await getAuth(app).verifyIdToken(token);
    let user = await User.findOne({ firebaseUid: decoded.uid });

    // যদি ইউজার ডাটাবেজে না থাকে, তবে নতুন ইউজার তৈরি করা হচ্ছে
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
        avatar: decoded.picture || "",
      });
    }

    // ২. JWT টোকেন জেনারেট করা হচ্ছে (Payload-এ প্রক্সি গেটওয়ের প্রয়োজনীয় সব ডেটা দেওয়া হলো)
    const jwtPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "7d", // ৭ দিনের জন্য টোকেনটি ভ্যালিড থাকবে
    });

    // ৩. টোকেনটি কুকিতে 'token' নামে সেট করা হচ্ছে
    // (আপনার প্রক্সি গেটওয়ের protect মিডলওয়্যার এই 'token' কুকিটিই রিড করবে)
    res.cookie("token", jwtToken, {
      httpOnly: true, // সিকিউরিটির জন্য (জাভাস্ক্রিপ্ট এটি রিড করতে পারবে না)
      secure: process.env.NODE_ENV === "production", // প্রোডাকশনে ট্রু (Vercel-এ ট্রু হতে হবে)
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // মিলি-সেকেন্ডে ৭ দিন
    });

    // ইউজারের ডাটা রেসপন্স হিসেবে পাঠানো হচ্ছে
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `login error ${error.message}` });
  }
};

export const logout = async (req, res) => {
  try {
    // কুকি থেকে 'token' রিমুভ বা ক্লিয়ার করে দেওয়া হচ্ছে
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
