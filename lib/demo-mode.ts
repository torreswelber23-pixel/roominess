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

