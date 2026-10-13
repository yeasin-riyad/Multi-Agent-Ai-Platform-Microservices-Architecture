"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Next.js: next/navigation
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Coins, Receipt } from "lucide-react";
// import { toast } from "sonner";

import {
  fetchMyPayments,
  startPayment,
} from "../redux/billingSlice";

import PlanCard from "../components/PlanCard";
import PaymentHistory from "../components/PaymentHistory";
import BalanceCard from "../components/BalanceCard";

/* ── Plans (চাইলে backend থেকেও আনতে পারো) ─────────────────────── */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    amount: 199,
    credits: 500,
    validity: 30,
    description: "Perfect for trying things out",
    features: [
      "500 AI credits",
      "Access to all agents",
      "Standard support",
      "30 days validity",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    amount: 499,
    credits: 1000,
    validity: 30,
    popular: true,
    description: "Best for regular users",
    features: [
      "1,000 AI credits",
      "Priority agent queue",
      "Advanced analytics",
      "Priority support",
      "30 days validity",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    amount: 999,
    credits: 2500,
    validity: 30,
    description: "For power users",
    features: [
      "2,500 AI credits",
      "Unlimited agents",
      "Custom agent creation",
      "24/7 dedicated support",
      "Early access to features",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────── */
/*  Billing Page                                                  */
/* ─────────────────────────────────────────────────────────────── */

export default function BillingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const { payments, loadingHistory, buyingPlan } = useSelector(
    (state) => state.billing,
  );

  /* ── Payment history load ─────────────────────────────────────── */
  useEffect(() => {
    dispatch(fetchMyPayments());
  }, [dispatch]);

  /* ── Buy plan handler ─────────────────────────────────────────── */
  async function handleBuy(planId) {
    if (!userData) {
      // toast.error("Please login first");
      return;
    }

    const action = await dispatch(
      startPayment({
        plan: planId,
        name: userData?.name,
        email: userData?.email,
        phone: userData?.phone || "01711111111",
      }),
    );

    if (startPayment.fulfilled.match(action)) {
      const res = action.payload;
      if (res?.url) {
        // toast.success("Redirecting to payment gateway...");
        window.location.href = res.url;
      } else {
        // toast.error("Could not start payment");
      }
    } else {
      // toast.error(action.payload || "Payment initiation failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="mb-10 text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <Coins size={14} />
            Credits & Billing
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Supercharge your AI workflow
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Top up your credits and unlock premium agents, faster responses,
            and advanced capabilities.
          </p>
        </div>

        {/* Current balance card */}
        <BalanceCard user={userData} paymentsCount={payments.length} />

        {/* Plans */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            Choose a plan
          </h2>
          <span className="text-xs text-slate-500">
            All plans valid for 30 days
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isLoading={buyingPlan === plan.id}
              disabled={!!buyingPlan}
              onBuy={() => handleBuy(plan.id)}
            />
          ))}
        </div>

        {/* Payment history */}
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-2">
            <Receipt size={18} className="text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Payment History
            </h2>
          </div>

          <PaymentHistory payments={payments} loading={loadingHistory} />
        </div>
      </div>
    </div>
  );
}