import type { ReactNode } from 'react';

export default function HomesPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-end sm:justify-between lg:px-8">
      <div className="max-w-3xl">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
        <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
