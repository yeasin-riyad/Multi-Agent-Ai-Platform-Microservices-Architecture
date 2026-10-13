import { Calendar, Loader2, Receipt } from "lucide-react";
import StatusPill from "./StatusPill";

export default function PaymentHistory({ payments = [], loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <Loader2 size={20} className="mx-auto animate-spin text-slate-500" />
        <p className="mt-3 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <Receipt size={28} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">No payments yet</p>
        <p className="mt-1 text-xs text-slate-600">
          Buy a plan to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Plan
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Credits
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Amount
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p._id}
                className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-slate-600" />
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-5 py-4 font-medium capitalize text-slate-200">
                  {p.plan}
                </td>
                <td className="px-5 py-4 text-amber-400/90">+{p.credits}</td>
                <td className="px-5 py-4 text-slate-300">৳{p.amount}</td>
                <td className="px-5 py-4">
                  <StatusPill status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}