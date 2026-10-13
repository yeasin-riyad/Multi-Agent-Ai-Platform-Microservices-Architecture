import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  CheckCircle2,
  Coins,
  Loader2,
  ArrowRight,
  Receipt,
  Sparkles,
} from "lucide-react";

import { setUserData } from "../redux/userSlice";
import getCurrentUser from "../features/getCurrentUser";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const tranId = searchParams.get("tran_id");

  /* Page load হলে fresh user data (updated credits) আনা */
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const data = await getCurrentUser();
        if (data) dispatch(setUserData(data));
      } catch (err) {
        console.log("Failed to refresh user:", err);
      } finally {
        setLoading(false);
      }
    };

    // একটু delay — backend-এ updateUserPayment শেষ হতে সময় লাগতে পারে
    const timer = setTimeout(refreshUser, 800);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0f14] px-4 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
          {/* Success icon with glow */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <CheckCircle2
                  size={40}
                  className="text-emerald-400"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">
              Payment Successful!
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your credits have been added to your account
            </p>
          </div>

          {/* Refreshing state */}
          {loading ? (
            <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              Updating your account...
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-400">
              <Sparkles size={14} />
              Account updated successfully
            </div>
          )}

          {/* Order details */}
          {tranId && (
            <div className="mb-6 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Receipt size={12} />
                  Transaction ID
                </span>
                <span className="font-mono text-slate-300">
                  {tranId.length > 22
                    ? `${tranId.slice(0, 22)}...`
                    : tranId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Coins size={12} />
                  Status
                </span>
                <span className="font-semibold text-emerald-400">Paid</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-400 hover:to-violet-600 hover:shadow-indigo-500/30"
            >
              Start Using AgentixAI
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
            >
              <Coins size={16} />
              View Billing
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          A confirmation has been sent to your email
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;