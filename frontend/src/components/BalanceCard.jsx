import { Coins, TrendingUp, Receipt } from "lucide-react";

export default function BalanceCard({ user, paymentsCount = 0 }) {
  if (!user) return null;

  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-500/10 via-purple-500/[0.05] to-transparent p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Current Balance
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <Coins size={28} className="text-amber-400" />
            <span className="text-4xl font-bold text-slate-50 sm:text-5xl">
              {user.credits?.toLocaleString() ?? 0}
            </span>
            <span className="text-sm text-slate-400">credits</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Plan:{" "}
            <span className="font-medium capitalize text-slate-300">
              {user.plan || "free"}
            </span>
            {user.planExpiresAt && (
              <>
                {" · Expires "}
                {new Date(user.planExpiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatMini
            icon={<TrendingUp size={16} />}
            label="Total Credits"
            value={user.totalCredits?.toLocaleString() ?? 0}
          />
          <StatMini
            icon={<Receipt size={16} />}
            label="Purchases"
            value={paymentsCount}
          />
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-lg font-bold text-slate-100">{value}</p>
    </div>
  );
}