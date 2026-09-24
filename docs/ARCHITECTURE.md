# Architecture and functional scope

## Data flow

1. Meta sends signed `messages` or `calls` payloads to `/api/webhooks`.
2. The route verifies the HMAC signature, publishes live events through Ably
   and persists normalized records in PostgreSQL.
3. Incoming phone numbers are upserted into `leads`; conversations and messages
   retain the complete relationship history.
4. `POST /api/leads/{id}/qualify` runs the deterministic qualification engine,
   updates the lead and stores an immutable qualification snapshot.
5. The dashboard, leads and history pages read tenant-scoped data using the
   authenticated Auth0 identity.

## Current functional modules

- Meta Embedded Signup and asset management inherited from the upstream sample.
- WhatsApp inbox with Ably real-time delivery.
- WhatsApp send/template APIs inherited from the upstream sample.
- WhatsApp Calling routes for permission, settings, pre-accept, accept,
  connect, reject and terminate.
- Persistent leads, conversations, inbound messages and call events once the
  Homes schema is applied.
- Rule-based lead qualification with score, temperature, missing fields and
  next-best-action.
- Dashboard, lead pipeline, conversation history, voice-readiness and
  appointments-ready screens.

## Prepared but not complete

- External LLM qualification provider and prompt/evaluation pipeline.
- Autonomous voice agent (media transport, STT, LLM orchestration and TTS).
- Recording consent, call recording storage and transcript retention.
- Human handoff queues and assignment notifications.
- Calendar OAuth and two-way synchronization.
- CRM-specific adapters, durable jobs, retries and reconciliation.
- Production-grade multi-tenant authorization policies and admin roles.

## Security boundaries

- Meta, Auth0, Ably, database, AI and voice secrets stay on the server.
- The webhook accepts events only after Meta signature verification.
- Every product query is scoped by the authenticated `user_id`.
- Raw provider payloads are retained only where useful for debugging and future
  compatibility; define retention limits before production.
