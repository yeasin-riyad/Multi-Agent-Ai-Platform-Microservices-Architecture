// import { cert, initializeApp } from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json" with {type:"json"};

// export const app=initializeApp({
//   credential:cert(serviceAccount)
// });



import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

let serviceAccount;

try {
  // ১. প্রথমে চেক করবে Vercel ড্যাশবোর্ডে এনভায়রনমেন্ট ভেরিয়েবল আছে কিনা (সবচেয়ে নিরাপদ)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // ২. না থাকলে লোকাল ডেভেলপমেন্টের জন্য ফাইল থেকে রিড করবে (সার্ভারলেস সেফ মেথড)
    const jsonPath = join(process.cwd(), "serviceAccountKey.json");
    serviceAccount = JSON.parse(readFileSync(jsonPath, "utf8"));
  }
} catch (error) {
  console.error("Firebase Service Account Load Error:", error.message);
}

// ৩. সঠিক এনভায়রনমেন্ট সেফ ইনিশিয়ালাইজেশন
export const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
