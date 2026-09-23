import { History, MessageCircle } from 'lucide-react';

import HomesPageHeader from '@/app/components/HomesPageHeader';
import LoggedOut from '@/app/components/LoggedOut';
import SidebarLayout from '@/app/components/SidebarLayout';
import { Badge } from '@/app/components/ui/Badge';
import { auth0 } from '@/lib/auth0';
import { getConversationHistory } from '@/lib/homes/data';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

export default async function HistoryPage() {
  const session = await auth0.getSession();
  if (!session) return <LoggedOut />;
  const userId = session.user.email || session.user.sub || 'usuario';
  const conversations = await getConversationHistory(userId);

  return (
    <SidebarLayout userId={userId} appName="Homes AI">
      <HomesPageHeader eyebrow="Relacionamento" title="Historico de conversas" description="Uma linha do tempo persistente para retomar o atendimento com contexto, independentemente de quem assumir o lead." />
      <div className="p-6 lg:p-8">
        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><History className="h-6 w-6" /></span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">O historico comeca no primeiro webhook</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Mensagens recebidas serao vinculadas ao lead e armazenadas sem depender do estado temporario do navegador.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {conversations.map((conversation) => <li key={conversation.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MessageCircle className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-900">{conversation.leadName}</h2><Badge variant="green">WhatsApp</Badge>{conversation.unreadCount > 0 ? <Badge variant="amber">{conversation.unreadCount} nao lidas</Badge> : null}</div><p className="mt-1 truncate text-sm text-slate-600">{conversation.lastMessage}</p><p className="mt-1 text-xs text-slate-500">{conversation.phone}</p></div></div><time className="shrink-0 text-xs font-medium text-slate-500" dateTime={conversation.lastMessageAt}>{dateFormatter.format(new Date(conversation.lastMessageAt))}</time></div></li>)}
          </ul>
        )}
      </div>
    </SidebarLayout>
  );
}
