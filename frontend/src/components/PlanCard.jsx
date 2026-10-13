import { Coins, Check, Crown, Zap, Sparkles, Loader2 } from "lucide-react";

const ICON = {
  starter: <Zap size={20} />,
  pro: <Crown size={20} />,
  elite: <Sparkles size={20} />,
};

export default function PlanCard({ plan, isLoading, disabled, onBuy }) {
  const isPopular = plan.popular;

  return (
    <div
      className={`
        relative flex flex-col overflow-hidden rounded-2xl border p-6
        transition-all duration-200
        ${
          isPopular
            ? "border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.08] to-transparent shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
        }
      `}
    >
      {isPopular && (
        <div className="absolute right-4 top-4 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Popular
        </div>
      )}

      {/* Icon + name */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`
            flex h-10 w-10 items-center justify-center rounded-xl
            ${
              isPopular
                ? "bg-indigo-500/20 text-indigo-300"
                : "bg-white/[0.06] text-slate-300"
            }
          `}
        >
          {ICON[plan.id] || <Coins size={20} />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            {plan.name}
          </h3>
          <p className="text-xs text-slate-500">{plan.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-50">
            ৳{plan.amount}
          </span>
          <span className="text-sm text-slate-500">
            /{plan.validity} days
          </span>
        </div>
        <p className="mt-1 text-xs text-amber-400/80">
          {plan.credits.toLocaleString()} credits included
        </p>
      </div>

      {/* Features */}
      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-slate-400"
          >
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={onBuy}
        disabled={isLoading || disabled}
        className={`
          flex w-full items-center justify-center gap-2 rounded-xl
          px-4 py-3 text-sm font-semibold transition-all duration-150
          disabled:cursor-not-allowed disabled:opacity-60
          ${
            isPopular
              ? "bg-indigo-500 text-white hover:bg-indigo-400"
              : "border border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Coins size={16} />
            Buy {plan.name}
          </>
        )}
      </button>
    </div>
  );
}