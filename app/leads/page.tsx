import { CircleDot, Sparkles, UsersRound } from 'lucide-react';

import HomesPageHeader from '@/app/components/HomesPageHeader';
import LoggedOut from '@/app/components/LoggedOut';
import SidebarLayout from '@/app/components/SidebarLayout';
import { Badge } from '@/app/components/ui/Badge';
import { auth0 } from '@/lib/auth0';
import { getLeads } from '@/lib/homes/data';
import type { Lead } from '@/lib/homes/types';

const stageLabels: Record<Lead['stage'], string> = { new: 'Novo', contacted: 'Em contato', qualified: 'Qualificado', visit_scheduled: 'Visita agendada', proposal: 'Proposta', won: 'Ganho', lost: 'Perdido' };
const temperatureVariant: Record<Lead['temperature'], 'blue' | 'amber' | 'green'> = { cold: 'blue', warm: 'amber', hot: 'green' };
const temperatureLabels: Record<Lead['temperature'], string> = { cold: 'Frio', warm: 'Morno', hot: 'Quente' };

export default async function LeadsPage() {
  const session = await auth0.getSession();
  if (!session) return <LoggedOut />;
  const userId = session.user.email || session.user.sub || 'usuario';
  const leads = await getLeads(userId);

  return (
    <SidebarLayout userId={userId} appName="Homes AI">
      <HomesPageHeader eyebrow="Pipeline comercial" title="Leads" description="Centralize contexto, score, estagio e proxima melhor acao para cada oportunidade imobiliaria." />
      <div className="p-6 lg:p-8">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><UsersRound className="h-6 w-6" aria-hidden="true" /></span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">Nenhum lead capturado ainda</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Depois de aplicar o schema e conectar o webhook da Meta, cada novo contato do WhatsApp sera criado aqui automaticamente.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <caption className="sr-only">Leads ordenados por score e atividade recente</caption>
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600"><tr><th className="px-5 py-4">Lead</th><th className="px-5 py-4">Estagio</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Interesse</th><th className="px-5 py-4">Proxima acao</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => <tr key={lead.id} className="align-top hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-slate-900">{lead.name}</p><p className="mt-1 text-xs text-slate-500">{lead.phone}</p></td><td className="px-5 py-4"><Badge variant="gray"><CircleDot className="h-3 w-3" />{stageLabels[lead.stage]}</Badge></td><td className="px-5 py-4"><div className="flex items-center gap-2"><span className="font-bold text-slate-900">{lead.score}</span><Badge variant={temperatureVariant[lead.temperature]}>{temperatureLabels[lead.temperature]}</Badge></div></td><td className="px-5 py-4 text-slate-600">{[lead.intent, lead.propertyType, lead.preferredLocation].filter(Boolean).join(' · ') || 'Em descoberta'}</td><td className="max-w-sm px-5 py-4 text-slate-600"><span className="inline-flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{lead.qualificationSummary || 'Coletar preferencias e prazo de decisao.'}</span></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
