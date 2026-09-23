import redis from "../../shared/redis/redis.js"; // shared ফোল্ডার থেকে রিইউজেবল ioredis ইনস্ট্যান্সটি ইমপোর্ট করা হলো

const protect = async (req, res, next) => {
  try {
    // ১. ফ্রন্টএন্ড থেকে আসা রিকোয়েস্টের কুকি (Cookie) থেকে সেশন আইডিটি নেওয়া হচ্ছে
    const sessionId = req.cookies?.session;
    
    // যদি রিকোয়েস্টে কোনো সেশন আইডি না পাওয়া যায়, তবে সরাসরি ৪০০ ব্যাড রিকোয়েস্ট (Unauthorized) রিটার্ন করবে
    if (!sessionId) {
      return res.status(400).json({ message: "unauthorized user" });
    }

    // ২. কুকির সেশন আইডি দিয়ে রেডিস (Redis) মেমোরি ক্যাশ থেকে ইউজারের ডাটা খোঁজা হচ্ছে
    const session = await redis.get(`session-${sessionId}`);
    
    // যদি রেডিসে এই সেশন আইডির বিপরীতে কোনো ডাটা না থাকে (অথবা এক্সপায়ার হয়ে যায়), তবে সেশন এক্সপায়ার্ড এরর দেবে
    if (!session) {
      return res.status(400).json({ message: "session expired" });
    }

    // ৩. রেডিস থেকে পাওয়া স্ট্রিং ডাটাটিকে JSON অবজেক্টে রূপান্তর (Parse) করে 'req.user'-এ অ্যাসাইন করা হচ্ছে
    // এর ফলে পরবর্তী মিডলওয়্যার বা প্রক্সি ফাংশনগুলো সহজেই req.user.userId বা req.user.email অ্যাক্সেস করতে পারবে
    req.user = JSON.parse(session);
    
    // সবকিছু ঠিক থাকলে রিকোয়েস্টটিকে পরের ধাপ বা প্রক্সি রাউটের দিকে পাঠিয়ে দেওয়া হচ্ছে
    next();
  } catch (error) {
    // যদি ট্রাই ব্লকের ভেতরে কোনো টেকনিক্যাল এরর হয়, তবে সার্ভার ক্র্যাশ না করে ৫০০ ইন্টারনাল সার্ভার এরর রেসপন্স পাঠাবে
    return res.status(500).json({ message: `protect error ${error}` });
  }
};

export default protect;
