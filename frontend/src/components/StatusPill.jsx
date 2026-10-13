export default function StatusPill({ status }) {
  const map = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    created: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  const cls = map[status] || map.created;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cls}`}
    >
      {status}
    </span>
  );
}