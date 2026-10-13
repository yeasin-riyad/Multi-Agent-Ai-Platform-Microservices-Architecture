import { useNavigate, useSearchParams } from "react-router-dom";
import {
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Home,
  LifeBuoy,
} from "lucide-react";

/* ── Reason messages ────────────────────────────────────────────── */

const REASON_MESSAGES = {
  ORDER_NOT_FOUND:
    "We couldn't find your order. Please try again or contact support.",

  AMOUNT_MISMATCH:
    "The payment amount didn't match. If money was deducted, please contact support.",

  CURRENCY_MISMATCH:
    "Currency verification failed. Please try again.",

  INVALID:
    "The transaction couldn't be verified by the payment gateway.",

  VALIDATED_FAILED:
    "Payment validation failed on the gateway side.",

  FAILED:
    "The payment was declined by your bank or payment method.",

  default:
    "Something went wrong while processing your payment. No money has been deducted — you can try again safely.",
};

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tranId = searchParams.get("tran_id");
  const reason = searchParams.get("reason");

  const message = REASON_MESSAGES[reason] || REASON_MESSAGES.default;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0f14] px-4 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
          {/* Failed icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <XCircle
                size={40}
                className="text-red-400"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">
              Payment Failed
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your transaction couldn't be completed
            </p>
          </div>

          {/* Reason */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-amber-400"
            />
            <p className="text-sm leading-relaxed text-amber-200/90">
              {message}
            </p>
          </div>

          {/* Transaction details */}
          {tranId && (
            <div className="mb-6 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-slate-300">
                  {tranId.length > 22 ? `${tranId.slice(0, 22)}...` : tranId}
                </span>
              </div>
              {reason && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Reason</span>
                  <span className="font-semibold uppercase text-red-400">
                    {reason.replaceAll("_", " ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-400 hover:to-violet-600"
            >
              <RefreshCw
                size={16}
                className="transition-transform group-hover:rotate-90"
              />
              Try Again
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-xs font-medium text-slate-500 transition hover:text-slate-300"
            >
              <Home size={14} />
              Return Home
            </button>
          </div>
        </div>

        {/* Support footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-600">
          <LifeBuoy size={12} />
          <span>
            Need help?{" "}
            <a
              href="mailto:support@agentixai.com"
              className="text-indigo-400 underline-offset-2 hover:underline"
            >
              Contact support
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;