// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import { auth0 } from '@/lib/auth0';
import SidebarLayout from '@/app/components/SidebarLayout';
import LoggedOut from '@/app/components/LoggedOut';
import publicConfig from '@/app/publicConfig';
import { getAppDetails, getClientPhones } from '@/app/api/beUtils';
import InboxLayout from '@/app/components/InboxLayout';
import { isDemoMode } from '@/lib/demo-mode';
import { Inbox, PlugZap } from 'lucide-react';

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return <LoggedOut />;
  }

  const userId = session.user.email;

  const phones = await getClientPhones(userId);

  const appDetails = await getAppDetails(publicConfig.appId);
  const appName = appDetails.name;
  const logoUrl = appDetails.logo_url;

  if (isDemoMode()) {
    return (
      <SidebarLayout userId={userId} logoUrl={logoUrl} appName={appName}>
        <div className="flex min-h-[70vh] items-center justify-center p-6">
          <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Inbox className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-xl font-bold text-slate-950">Inbox pronta para conectar</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A prévia local está ativa. Conecte Meta, Postgres e Ably para carregar números e conversas reais do WhatsApp.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <PlugZap className="h-3.5 w-3.5" /> Modo demonstração — nenhuma chamada externa
            </div>
          </section>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout userId={userId} logoUrl={logoUrl} appName={appName}>
      <div className="h-full flex flex-col">
        <InboxLayout phones={phones} />
      </div>
    </SidebarLayout>
  );
}

