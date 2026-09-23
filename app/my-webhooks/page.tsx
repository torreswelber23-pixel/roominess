// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import { auth0 } from '@/lib/auth0';
import SidebarLayout from '@/app/components/SidebarLayout';
import LoggedOut from '@/app/components/LoggedOut';
import publicConfig from '@/app/publicConfig';
import { getAppDetails } from '@/app/api/beUtils';
import LiveWebhooks from '@/app/components/LiveWebhooks';
import { isDemoMode } from '@/lib/demo-mode';
import { Radio } from 'lucide-react';

export default async function MyWebhooks() {
  const session = await auth0.getSession();
  if (!session) return <LoggedOut />;

  const userId = session.user.email;
  const appId = publicConfig.appId;
  const appDetails = await getAppDetails(appId);
  const appName = appDetails.name;
  const logoUrl = appDetails.logo_url;

  return (
    <SidebarLayout userId={userId} logoUrl={logoUrl} appName={appName}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Webhooks</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Real-time debug view of all incoming webhook events for your app.
          </p>
        </div>

        {isDemoMode() ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Radio className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Visualização em modo demonstração</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              Configure Meta e Ably para receber eventos reais. Nenhuma conexão externa é aberta nesta prévia.
            </p>
          </div>
        ) : (
          <LiveWebhooks appId={appId ?? ''} />
        )}
      </div>
    </SidebarLayout>
  );
}

