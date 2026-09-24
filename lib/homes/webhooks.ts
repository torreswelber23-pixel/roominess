import { sql } from '@vercel/postgres';

type MessageValue = {
  metadata?: { phone_number_id?: string };
  contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
  messages?: Array<{ id?: string; from?: string; timestamp?: string; type?: string; text?: { body?: string } }>;
};

export async function persistIncomingMessage(wabaId: string, value: MessageValue): Promise<void> {
  const message = value.messages?.[0];
  const phoneNumberId = value.metadata?.phone_number_id;
  const contactPhone = message?.from;
  if (!message?.id || !phoneNumberId || !contactPhone) return;

  const displayName = value.contacts?.[0]?.profile?.name || contactPhone;
  const body = message.text?.body || `[${message.type || 'unsupported'}]`;
  const occurredAt = (message.timestamp ? new Date(Number(message.timestamp) * 1000) : new Date()).toISOString();

  const owner = await sql`SELECT user_id FROM wabas WHERE waba_id = ${wabaId} LIMIT 1`;
  const userId = owner.rows[0]?.user_id;
  if (!userId) return;

  const leadResult = await sql`INSERT INTO leads (user_id, display_name, phone, source, stage, last_contact_at)
    VALUES (${userId}, ${displayName}, ${contactPhone}, 'whatsapp', 'new', ${occurredAt})
    ON CONFLICT (user_id, phone) DO UPDATE SET
      display_name = COALESCE(NULLIF(EXCLUDED.display_name, EXCLUDED.phone), leads.display_name),
      last_contact_at = GREATEST(leads.last_contact_at, EXCLUDED.last_contact_at), updated_at = NOW()
    RETURNING id`;
  const leadId = leadResult.rows[0].id;

  const conversationResult = await sql`INSERT INTO conversations
    (user_id, lead_id, waba_id, phone_number_id, contact_phone, last_message_preview, last_message_at, unread_count)
    VALUES (${userId}, ${leadId}, ${wabaId}, ${phoneNumberId}, ${contactPhone}, ${body}, ${occurredAt}, 1)
    ON CONFLICT (user_id, phone_number_id, contact_phone) DO UPDATE SET
      lead_id = EXCLUDED.lead_id, last_message_preview = EXCLUDED.last_message_preview,
      last_message_at = EXCLUDED.last_message_at, unread_count = conversations.unread_count + 1,
      updated_at = NOW()
    RETURNING id`;
  const conversationId = conversationResult.rows[0].id;

  await sql`INSERT INTO messages
    (user_id, conversation_id, meta_message_id, direction, message_type, body, occurred_at, raw_payload)
    VALUES (${userId}, ${conversationId}, ${message.id}, 'inbound', ${message.type || 'unknown'}, ${body},
      ${occurredAt}, ${JSON.stringify(message)}::jsonb)
    ON CONFLICT (meta_message_id) DO NOTHING`;
}

export async function persistOutgoingMessage(input: {
  userId: string;
  wabaId: string;
  phoneNumberId: string;
  contactPhone: string;
  body: string;
  metaMessageId?: string;
}): Promise<void> {
  const leadResult = await sql`INSERT INTO leads (user_id, display_name, phone, source, stage, last_contact_at)
    VALUES (${input.userId}, ${input.contactPhone}, ${input.contactPhone}, 'whatsapp', 'contacted', NOW())
    ON CONFLICT (user_id, phone) DO UPDATE SET stage = CASE WHEN leads.stage = 'new' THEN 'contacted' ELSE leads.stage END,
      last_contact_at = NOW(), updated_at = NOW() RETURNING id`;
  const leadId = leadResult.rows[0].id;

  const conversationResult = await sql`INSERT INTO conversations
    (user_id, lead_id, waba_id, phone_number_id, contact_phone, last_message_preview, last_message_at)
    VALUES (${input.userId}, ${leadId}, ${input.wabaId}, ${input.phoneNumberId}, ${input.contactPhone}, ${input.body}, NOW())
    ON CONFLICT (user_id, phone_number_id, contact_phone) DO UPDATE SET lead_id = EXCLUDED.lead_id,
      last_message_preview = EXCLUDED.last_message_preview, last_message_at = NOW(), updated_at = NOW()
    RETURNING id`;

  await sql`INSERT INTO messages
    (user_id, conversation_id, meta_message_id, direction, message_type, body, occurred_at)
    VALUES (${input.userId}, ${conversationResult.rows[0].id}, ${input.metaMessageId || null}, 'outbound', 'text', ${input.body}, NOW())
    ON CONFLICT (meta_message_id) DO NOTHING`;
}

export async function persistCallEvent(wabaId: string, value: Record<string, unknown>): Promise<void> {
  const metadata = value.metadata as { phone_number_id?: string } | undefined;
  const calls = value.calls as Array<Record<string, unknown>> | undefined;
  const statuses = value.statuses as Array<Record<string, unknown>> | undefined;
  const payload = calls?.[0] || statuses?.[0];
  const callId = payload?.id;
  if (!callId || !metadata?.phone_number_id) return;

  const owner = await sql`SELECT user_id FROM wabas WHERE waba_id = ${wabaId} LIMIT 1`;
  const userId = owner.rows[0]?.user_id;
  if (!userId) return;

  const status = String(payload.event || payload.status || 'received');
  const contactPhone = payload.from ? String(payload.from) : null;
  await sql`INSERT INTO voice_calls
    (user_id, meta_call_id, waba_id, phone_number_id, contact_phone, direction, status, raw_payload)
    VALUES (${userId}, ${String(callId)}, ${wabaId}, ${metadata.phone_number_id}, ${contactPhone},
      ${contactPhone ? 'inbound' : 'outbound'}, ${status}, ${JSON.stringify(payload)}::jsonb)
    ON CONFLICT (meta_call_id) DO UPDATE SET status = EXCLUDED.status,
      raw_payload = EXCLUDED.raw_payload, updated_at = NOW()`;
}
