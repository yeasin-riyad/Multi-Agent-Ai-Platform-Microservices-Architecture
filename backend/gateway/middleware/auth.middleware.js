// import redis from "../../shared/redis/redis.js"; // shared ফোল্ডার থেকে রিইউজেবল ioredis ইনস্ট্যান্সটি ইমপোর্ট করা হলো

// const protect = async (req, res, next) => {
//   try {
//     // ১. ফ্রন্টএন্ড থেকে আসা রিকোয়েস্টের কুকি (Cookie) থেকে সেশন আইডিটি নেওয়া হচ্ছে
//     const sessionId = req.cookies?.session;
    
//     // যদি রিকোয়েস্টে কোনো সেশন আইডি না পাওয়া যায়, তবে সরাসরি ৪০০ ব্যাড রিকোয়েস্ট (Unauthorized) রিটার্ন করবে
//     if (!sessionId) {
//       return res.status(400).json({ message: "unauthorized user" });
//     }

//     // ২. কুকির সেশন আইডি দিয়ে রেডিস (Redis) মেমোরি ক্যাশ থেকে ইউজারের ডাটা খোঁজা হচ্ছে
//     const session = await redis.get(`session-${sessionId}`);
    
//     // যদি রেডিসে এই সেশন আইডির বিপরীতে কোনো ডাটা না থাকে (অথবা এক্সপায়ার হয়ে যায়), তবে সেশন এক্সপায়ার্ড এরর দেবে
//     if (!session) {
//       return res.status(400).json({ message: "session expired" });
//     }

//     // ৩. রেডিস থেকে পাওয়া স্ট্রিং ডাটাটিকে JSON অবজেক্টে রূপান্তর (Parse) করে 'req.user'-এ অ্যাসাইন করা হচ্ছে
//     // এর ফলে পরবর্তী মিডলওয়্যার বা প্রক্সি ফাংশনগুলো সহজেই req.user.userId বা req.user.email অ্যাক্সেস করতে পারবে
//     req.user = JSON.parse(session);
    
//     // সবকিছু ঠিক থাকলে রিকোয়েস্টটিকে পরের ধাপ বা প্রক্সি রাউটের দিকে পাঠিয়ে দেওয়া হচ্ছে
//     next();
//   } catch (error) {
//     // যদি ট্রাই ব্লকের ভেতরে কোনো টেকনিক্যাল এরর হয়, তবে সার্ভার ক্র্যাশ না করে ৫০০ ইন্টারনাল সার্ভার এরর রেসপন্স পাঠাবে
//     return res.status(500).json({ message: `protect error ${error}` });
//   }
// };

// export default protect;



import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  try {
    // ১. ফ্রন্টএন্ড থেকে আসা রিকোয়েস্টের কুকি (Cookie) থেকে টোকেনটি নেওয়া হচ্ছে
    // (লগইন করার সময় আপনার auth-service অবশ্যই টোকেনটি 'token' নামে কুকিতে সেভ করবে)
    const token = req.cookies?.token;
    
    // যদি রিকোয়েস্টে কোনো টোকেন না পাওয়া যায়, তবে সরাসরি ৪০১ (Unauthorized) রিটার্ন করবে
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // ২. JWT সিক্রেট কি (Secret Key) দিয়ে টোকেনটি আসল কিনা তা ভেরিফাই করা হচ্ছে
    // যদি টোকেনটি নকল বা এক্সপায়ারড হয়, তবে এটি সরাসরি ক্যাচ (catch) ব্লকে এরর থ্রো করবে
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ৩. টোকেন থেকে ডিক্রিপ্ট হওয়া ইউজারের ডাটা (যেমন: userId, role) 'req.user'-এ অ্যাসাইন করা হচ্ছে
    // এর ফলে আপনার গেটওয়ের পরবর্তী প্রক্সি রাউট বা কন্ট্রোলারগুলো সহজেই ইউজারের তথ্য অ্যাক্সেস করতে পারবে
    req.user = decoded;
    
    // সবকিছু ঠিক থাকলে রিকোয়েস্টটিকে পরের ধাপ বা প্রক্সি রাউটের দিকে পাঠিয়ে দেওয়া হচ্ছে
    next();
  } catch (error) {
    // টোকেন ইনভ্যালিড বা এক্সপায়ার হলে এখানে চলে আসবে
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    
    // অন্য কোনো টেকনিক্যাল এরর হলে ৫০০ ইন্টারনাল সার্ভার এরর রেসপন্স পাঠাবে
    return res.status(500).json({ message: `Protect error: ${error.message}` });
  }
};

export default protect;
