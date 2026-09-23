// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import type { AppDetails } from '@/app/types/api';

/**
 * Local preview mode deliberately avoids Meta, Postgres and realtime calls.
 * It is never enabled in production, even if an environment variable is set.
 */
export function isDemoMode(): boolean {
  if (process.env.NODE_ENV === 'production') return false;

  return (
    process.env.DEMO_MODE === 'true' ||
    (process.env.BYPASS_AUTH === 'true' && ['demo', 'your-facebook-app-id'].includes(process.env.FB_APP_ID ?? ''))
  );
}

export const demoAppDetails: AppDetails = {
  id: 'demo',
  client_config: {},
  name: 'Homes AI',
  app_domains: ['localhost'],
  app_type: 'BUSINESS',
  company: 'Roominess',
  config_ids: [],
};

