import type { LucideIcon } from 'lucide-react';

export default function MetricCard({
  label,
  value,
  helper,
  Icon,
}: {
  label: string;
  value: number;
  helper: string;
  Icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{helper}</p>
    </article>
  );
}
