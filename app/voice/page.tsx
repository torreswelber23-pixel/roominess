import { Bot, CheckCircle2, CircleAlert, Headphones, PhoneCall, ShieldCheck } from 'lucide-react';

import HomesPageHeader from '@/app/components/HomesPageHeader';
import LoggedOut from '@/app/components/LoggedOut';
import SidebarLayout from '@/app/components/SidebarLayout';
import { Badge } from '@/app/components/ui/Badge';
import { auth0 } from '@/lib/auth0';

const capabilities = [
  { title: 'Webhook calls', description: 'Eventos connect, terminate, failed e status sao reconhecidos e publicados em tempo real.', Icon: PhoneCall, ready: true },
  { title: 'Permissoes de chamada', description: 'Rotas para consultar e solicitar permissao ja existem na base oficial.', Icon: ShieldCheck, ready: true },
  { title: 'Cliente WebRTC', description: 'Fluxo de pre-accept, accept, connect, reject e terminate esta estruturado no inbox.', Icon: Headphones, ready: true },
  { title: 'Agente de voz', description: 'Modelo de dados e pontos de extensao estao prontos; provedor de STT/LLM/TTS ainda deve ser escolhido.', Icon: Bot, ready: false },
];

export default async function VoicePage() {
  const session = await auth0.getSession();
  if (!session) return <LoggedOut />;
  const userId = session.user.email || session.user.sub || 'usuario';
  const hasMeta = Boolean(process.env.FB_APP_ID && process.env.FB_APP_SECRET);
  const hasRealtime = Boolean(process.env.ABLY_KEY);
  const hasVoiceProvider = Boolean(process.env.VOICE_PROVIDER_API_KEY);

  return (
    <SidebarLayout userId={userId} appName="Homes AI">
      <HomesPageHeader eyebrow="WhatsApp Business Calling" title="Voz e chamadas" description="Camada de preparacao para chamadas humanas agora e automacao de voz depois, mantendo permissao e handoff como requisitos explicitos." />
      <div className="space-y-6 p-6 lg:p-8">
        <section className="grid gap-4 md:grid-cols-2" aria-label="Capacidades de voz">
          {capabilities.map(({ title, description, Icon, ready }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-slate-950">{title}</h2><Badge variant={ready ? 'green' : 'amber'}>{ready ? <CheckCircle2 className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}{ready ? 'Estruturado' : 'Pendente'}</Badge></div><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div></div></article>)}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="readiness-title">
          <h2 id="readiness-title" className="text-lg font-bold text-slate-950">Prontidao de configuracao</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[['Meta Developer', hasMeta], ['Ably', hasRealtime], ['Provedor de voz', hasVoiceProvider]].map(([label, ready]) => <div key={String(label)} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-700">{label}</span><Badge variant={ready ? 'green' : 'gray'}>{ready ? 'Configurado' : 'Nao configurado'}</Badge></div>)}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Esta tela verifica apenas a presenca das variaveis; nenhum segredo e exibido no navegador.</p>
        </section>
      </div>
    </SidebarLayout>
  );
}
