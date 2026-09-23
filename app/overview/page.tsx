import Link from 'next/link';
import { CalendarCheck2, CheckCircle2, MessageCircle, PhoneCall, Sparkles, UsersRound } from 'lucide-react';

import LoggedOut from '@/app/components/LoggedOut';
import HomesPageHeader from '@/app/components/HomesPageHeader';
import MetricCard from '@/app/components/MetricCard';
import SidebarLayout from '@/app/components/SidebarLayout';
import { auth0 } from '@/lib/auth0';
import { getDashboardSummary } from '@/lib/homes/data';

export default async function OverviewPage() {
  const session = await auth0.getSession();
  if (!session) return <LoggedOut />;
  const userId = session.user.email || session.user.sub || 'usuario';
  const summary = await getDashboardSummary(userId);

  return (
    <SidebarLayout userId={userId} appName="Homes AI">
      <HomesPageHeader
        eyebrow="Operacao comercial"
        title="Visao geral"
        description="Acompanhe os leads que chegaram pelo WhatsApp, a qualidade das oportunidades e as proximas acoes do time."
        action={<Link href="/my-inbox" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"><MessageCircle className="h-4 w-4" />Abrir inbox</Link>}
      />
      <div className="space-y-6 p-6 lg:p-8">
        <section aria-labelledby="resumo-title">
          <h2 id="resumo-title" className="sr-only">Resumo do funil</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Leads em aberto" value={summary.openLeads} helper="Oportunidades ativas no funil" Icon={UsersRound} />
            <MetricCard label="Qualificados" value={summary.qualifiedLeads} helper="Prontos para atendimento comercial" Icon={Sparkles} />
            <MetricCard label="Conversas hoje" value={summary.conversationsToday} helper="Conversas com atividade desde 00:00" Icon={MessageCircle} />
            <MetricCard label="Visitas agendadas" value={summary.scheduledVisits} helper="Compromissos futuros confirmados" Icon={CalendarCheck2} />
            <MetricCard label="Permissoes pendentes" value={summary.callsAwaitingPermission} helper="Chamadas aguardando autorizacao" Icon={PhoneCall} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]" aria-label="Prontidao e proximos passos">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Base operacional pronta</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Inbox, captura de leads, historico e eventos de chamada compartilham o mesmo modelo de dados. A integracao passa a ganhar dados reais assim que o schema e as credenciais externas forem configurados.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {['Webhook assinado', 'Tempo real via Ably', 'Pipeline de qualificacao'].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{item}</div>)}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-950">Proximo marco</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">Conectar Meta, Auth0, Ably e Neon; depois validar mensagens e o campo de webhook <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs">calls</code> em um numero habilitado.</p>
            <Link href="/voice" className="mt-4 inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold text-amber-950 underline decoration-2 underline-offset-4">Ver prontidao de voz</Link>
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}
