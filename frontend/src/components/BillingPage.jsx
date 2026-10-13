// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // Next.js: next/navigation
// import {
//   Coins,
//   Check,
//   Loader2,
//   Crown,
//   Zap,
//   Sparkles,
//   ArrowLeft,
//   Receipt,
//   Calendar,
//   TrendingUp,
// } from "lucide-react";
// import { toast } from "sonner";

// import { createOrder, getMyPayments, PLANS } from "../services/billing.api";

// /* ─────────────────────────────────────────────────────────────── */
// /*  Billing Page                                                  */
// /* ─────────────────────────────────────────────────────────────── */

// export default function BillingPage() {
//   const navigate = useNavigate();

//   // 👉 তোমার auth context / store থেকে user নাও
//   // উদাহরণ: const { userData } = useAuth();
//   const [userData, setUserData] = useState(null);
//   const [payments, setPayments] = useState([]);
//   const [loadingPlanId, setLoadingPlanId] = useState(null);
//   const [loadingHistory, setLoadingHistory] = useState(true);

//   /* ── User load (তোমার auth store থেকে বদলাও) ─────────────────── */
//   useEffect(() => {
//     const stored = localStorage.getItem("userData");
//     if (stored) setUserData(JSON.parse(stored));
//   }, []);

//   /* ── Payment history load ─────────────────────────────────────── */
//   useEffect(() => {
//     async function load() {
//       if (!userData?._id) return;
//       try {
//         setLoadingHistory(true);
//         const res = await getMyPayments(userData._id);
//         setPayments(res.data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoadingHistory(false);
//       }
//     }
//     load();
//   }, [userData?._id]);

//   /* ── Buy plan handler ─────────────────────────────────────────── */
//   async function handleBuy(planId) {
//     if (!userData) {
//       toast.error("Please login first");
//       return;
//     }

//     try {
//       setLoadingPlanId(planId);
//       const res = await createOrder({ plan: planId, user: userData });

//       if (res?.url) {
//         toast.success("Redirecting to payment gateway...");
//         window.location.href = res.url; // SSLCommerz gateway-এ যাও
//       } else {
//         toast.error("Could not start payment");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(
//         err?.response?.data?.message || "Payment initiation failed",
//       );
//     } finally {
//       setLoadingPlanId(null);
//     }
//   }

//   /* ── Icons for plan tiers ─────────────────────────────────────── */
//   const planIcon = (id) => {
//     if (id === "starter") return <Zap size={20} />;
//     if (id === "pro") return <Crown size={20} />;
//     return <Sparkles size={20} />;
//   };

//   /* ─────────────────────────────────────────────────────────────── */
//   /*  Render                                                        */
//   /* ─────────────────────────────────────────────────────────────── */

//   return (
//     <div className="min-h-screen bg-[#0a0b0f] text-slate-100">
//       {/* Background glow */}
//       <div className="pointer-events-none fixed inset-0 overflow-hidden">
//         <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
//         <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
//       </div>

//       <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
//         {/* ── Back button ─────────────────────────────────────────── */}
//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
//         >
//           <ArrowLeft size={16} />
//           Back
//         </button>

//         {/* ── Header ──────────────────────────────────────────────── */}
//         <div className="mb-10 text-center sm:mb-14">
//           <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
//             <Coins size={14} />
//             Credits & Billing
//           </div>
//           <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
//             Supercharge your AI workflow
//           </h1>
//           <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
//             Top up your credits and unlock premium agents, faster responses,
//             and advanced capabilities.
//           </p>
//         </div>

//         {/* ── Current balance card ────────────────────────────────── */}
//         {userData && (
//           <div className="mb-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-500/10 via-purple-500/[0.05] to-transparent p-6 sm:p-8">
//             <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
//                   Current Balance
//                 </p>
//                 <div className="mt-2 flex items-baseline gap-2">
//                   <Coins size={28} className="text-amber-400" />
//                   <span className="text-4xl font-bold text-slate-50 sm:text-5xl">
//                     {userData.credits?.toLocaleString() ?? 0}
//                   </span>
//                   <span className="text-sm text-slate-400">credits</span>
//                 </div>
//                 <p className="mt-2 text-xs text-slate-500">
//                   Plan:{" "}
//                   <span className="font-medium capitalize text-slate-300">
//                     {userData.plan || "free"}
//                   </span>
//                   {userData.planExpiresAt && (
//                     <>
//                       {" · Expires "}
//                       {new Date(userData.planExpiresAt).toLocaleDateString(
//                         undefined,
//                         { month: "short", day: "numeric", year: "numeric" },
//                       )}
//                     </>
//                   )}
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-3 sm:gap-4">
//                 <StatMini
//                   icon={<TrendingUp size={16} />}
//                   label="Total Credits"
//                   value={userData.totalCredits?.toLocaleString() ?? 0}
//                 />
//                 <StatMini
//                   icon={<Receipt size={16} />}
//                   label="Purchases"
//                   value={payments.length}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Plans grid ──────────────────────────────────────────── */}
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-lg font-semibold text-slate-100">
//             Choose a plan
//           </h2>
//           <span className="text-xs text-slate-500">
//             All plans valid for 30 days
//           </span>
//         </div>

//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           {PLANS.map((plan) => {
//             const isLoading = loadingPlanId === plan.id;
//             const isPopular = plan.popular;

//             return (
//               <div
//                 key={plan.id}
//                 className={`
//                   relative flex flex-col overflow-hidden rounded-2xl
//                   border p-6 transition-all duration-200
//                   ${
//                     isPopular
//                       ? "border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.08] to-transparent shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
//                       : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
//                   }
//                 `}
//               >
//                 {isPopular && (
//                   <div className="absolute right-4 top-4 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
//                     Popular
//                   </div>
//                 )}

//                 {/* Icon + name */}
//                 <div className="mb-4 flex items-center gap-3">
//                   <div
//                     className={`
//                       flex h-10 w-10 items-center justify-center rounded-xl
//                       ${
//                         isPopular
//                           ? "bg-indigo-500/20 text-indigo-300"
//                           : "bg-white/[0.06] text-slate-300"
//                       }
//                     `}
//                   >
//                     {planIcon(plan.id)}
//                   </div>
//                   <div>
//                     <h3 className="text-base font-semibold text-slate-100">
//                       {plan.name}
//                     </h3>
//                     <p className="text-xs text-slate-500">
//                       {plan.description}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Price */}
//                 <div className="mb-5">
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-3xl font-bold text-slate-50">
//                       ৳{plan.amount}
//                     </span>
//                     <span className="text-sm text-slate-500">
//                       /{plan.validity} days
//                     </span>
//                   </div>
//                   <p className="mt-1 text-xs text-amber-400/80">
//                     {plan.credits.toLocaleString()} credits included
//                   </p>
//                 </div>

//                 {/* Features */}
//                 <ul className="mb-6 flex-1 space-y-2.5">
//                   {plan.features.map((feature) => (
//                     <li
//                       key={feature}
//                       className="flex items-start gap-2 text-sm text-slate-400"
//                     >
//                       <Check
//                         size={16}
//                         className="mt-0.5 shrink-0 text-emerald-400"
//                       />
//                       <span>{feature}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 {/* CTA */}
//                 <button
//                   type="button"
//                   onClick={() => handleBuy(plan.id)}
//                   disabled={isLoading || !!loadingPlanId}
//                   className={`
//                     flex w-full items-center justify-center gap-2
//                     rounded-xl px-4 py-3 text-sm font-semibold
//                     transition-all duration-150
//                     disabled:cursor-not-allowed disabled:opacity-60
//                     ${
//                       isPopular
//                         ? "bg-indigo-500 text-white hover:bg-indigo-400"
//                         : "border border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
//                     }
//                   `}
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 size={16} className="animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <Coins size={16} />
//                       Buy {plan.name}
//                     </>
//                   )}
//                 </button>
//               </div>
//             );
//           })}
//         </div>

//         {/* ── Payment history ─────────────────────────────────────── */}
//         <div className="mt-12">
//           <div className="mb-5 flex items-center gap-2">
//             <Receipt size={18} className="text-slate-400" />
//             <h2 className="text-lg font-semibold text-slate-100">
//               Payment History
//             </h2>
//           </div>

//           {loadingHistory ? (
//             <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
//               <Loader2
//                 size={20}
//                 className="mx-auto animate-spin text-slate-500"
//               />
//               <p className="mt-3 text-sm text-slate-500">Loading...</p>
//             </div>
//           ) : payments.length === 0 ? (
//             <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
//               <Receipt
//                 size={28}
//                 className="mx-auto text-slate-600"
//               />
//               <p className="mt-3 text-sm text-slate-400">
//                 No payments yet
//               </p>
//               <p className="mt-1 text-xs text-slate-600">
//                 Buy a plan to get started
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm">
//                   <thead>
//                     <tr className="border-b border-white/[0.06] bg-white/[0.02]">
//                       <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Date
//                       </th>
//                       <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Plan
//                       </th>
//                       <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Credits
//                       </th>
//                       <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Amount
//                       </th>
//                       <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Status
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {payments.map((p) => (
//                       <tr
//                         key={p._id}
//                         className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
//                       >
//                         <td className="px-5 py-4 text-slate-400">
//                           <div className="flex items-center gap-2">
//                             <Calendar size={13} className="text-slate-600" />
//                             {new Date(p.createdAt).toLocaleDateString(
//                               undefined,
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                               },
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-5 py-4 font-medium capitalize text-slate-200">
//                           {p.plan}
//                         </td>
//                         <td className="px-5 py-4 text-amber-400/90">
//                           +{p.credits}
//                         </td>
//                         <td className="px-5 py-4 text-slate-300">
//                           ৳{p.amount}
//                         </td>
//                         <td className="px-5 py-4">
//                           <StatusPill status={p.status} />
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────── */
// /*  Sub components                                                 */
// /* ─────────────────────────────────────────────────────────────── */

// function StatMini({ icon, label, value }) {
//   return (
//     <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
//       <div className="flex items-center gap-1.5 text-slate-500">
//         {icon}
//         <span className="text-[10px] font-medium uppercase tracking-wider">
//           {label}
//         </span>
//       </div>
//       <p className="mt-1.5 text-lg font-bold text-slate-100">{value}</p>
//     </div>
//   );
// }

// function StatusPill({ status }) {
//   const map = {
//     paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
//     created: "bg-amber-500/10 text-amber-400 border-amber-500/20",
//     failed: "bg-red-500/10 text-red-400 border-red-500/20",
//     cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
//   };
//   const cls = map[status] || map.created;

//   return (
//     <span
//       className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cls}`}
//     >
//       {status}
//     </span>
//   );
// }