import { CalendarDays, PlugZap } from 'lucide-react';

import HomesPageHeader from '@/app/components/HomesPageHeader';
import LoggedOut from '@/app/components/LoggedOut';
import SidebarLayout from '@/app/components/SidebarLayout';
import { Badge } from '@/app/components/ui/Badge';
import { auth0 } from '@/lib/auth0';

export default async function AppointmentsPage() {
  const session = await auth0.getSession();
  if (!session) return <LoggedOut />;
  const userId = session.user.email || session.user.sub || 'usuario';

  return (
    <SidebarLayout userId={userId} appName="Homes AI">
      <HomesPageHeader eyebrow="Proximo modulo" title="Agendamentos" description="Estrutura preparada para visitas, reunioes e sincronizacao futura com calendarios externos." />
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CalendarDays className="h-6 w-6" /></span>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2"><h2 className="text-lg font-bold text-slate-950">Modulo preparado, integracao pendente</h2><Badge variant="amber">Roadmap</Badge></div>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">A tabela de compromissos e os vinculos com leads ja fazem parte do schema. O proximo passo e escolher Google Calendar, Outlook Calendar ou outro provedor e implementar OAuth e sincronizacao.</p>
          <div className="mx-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"><PlugZap className="h-4 w-4" />Nenhuma credencial necessaria nesta etapa</div>
        </div>
      </div>
    </SidebarLayout>
  );
}
