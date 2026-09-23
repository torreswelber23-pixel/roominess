# Homes / Roominess setup

No credentials are included in this repository. Use `.env.local` locally and
Vercel project environment variables in production.

## Required services

### Meta Developer / WhatsApp Cloud API

- Create a Meta app with the **Connect through WhatsApp** use case.
- Configure Facebook Login for Business and Embedded Signup.
- Set `FB_APP_ID`, `FB_APP_SECRET`, `FB_GRAPH_API_VERSION`, `FB_REG_PIN` and
  `FB_VERIFY_TOKEN`.
- Configure `https://YOUR_DOMAIN/api/webhooks` as the callback URL.
- Subscribe to `messages`. Subscribe to `calls` only after WhatsApp Business
  Calling is enabled for the WABA/number and the feature is available to the
  account.
- Request `whatsapp_business_management` and
  `whatsapp_business_messaging` during App Review.

The webhook verifies `X-Hub-Signature-256` before processing payloads. Keep the
Meta App Secret server-only.

### Auth0

- Create a Regular Web Application.
- Configure callback URL `https://YOUR_DOMAIN/auth/callback` and logout URL
  `https://YOUR_DOMAIN`.
- Set `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`
  and `APP_BASE_URL`.

`BYPASS_AUTH=true` is accepted only in local development and must never be used
as a production authentication strategy.

### Ably

- Create an app and set its root key as `ABLY_KEY` on the server.
- The browser receives scoped tokens through `/api/ably-auth`; do not expose
  the root key in client-side environment variables.

### Neon / PostgreSQL

- Connect a Neon database to the Vercel project or set `POSTGRES_URL` manually.
- Apply the upstream sample tables from the root README.
- Apply `database/schema.sql` for leads, conversations, messages,
  qualifications, calls, permissions, agents, handoffs, appointments and CRM
  sync jobs.
- Before production, enable Row Level Security if database access will exist
  outside the server and define policies that match the Auth0 tenancy model.

## Optional services

### AI qualification

The included `rules_v1` engine is deterministic and needs no credentials. The
variables `AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL` reserve a
server-only contract for a future external model. Do not send raw access tokens
or unnecessary personal data to the model provider.

### Voice agent

`VOICE_PROVIDER`, `VOICE_PROVIDER_API_KEY` and `VOICE_MODEL` are placeholders
for a future STT/LLM/TTS provider. The current version handles Calling events
and WebRTC actions but does not autonomously answer calls, transcribe audio or
generate speech.

### Calendar and CRM

The database has `appointments`, `handoffs` and `crm_sync_jobs`. OAuth flows,
provider-specific adapters and background retries still need implementation.

## Vercel

- Import the GitHub repository into Vercel.
- Use the default Next.js build command (`npm run build`).
- Add every required environment variable separately for Preview and
  Production.
- Connect Neon through the Vercel integration or supply `POSTGRES_URL`.
- After the first deployment, update Auth0 URLs, Meta App Domains, Facebook
  Login redirect URLs and the Meta webhook callback with the final domain.
- Run database migrations before directing production webhooks to the app.

## Production checklist

- Replace the placeholder privacy policy and contact information.
- Complete Meta Business Verification and App Review.
- Rotate any credential ever copied into logs or chat.
- Confirm signature verification with real Meta webhook test payloads.
- Add retention/deletion policies for message content and call transcripts.
- Add rate limiting, audit logs and observability before onboarding customers.
