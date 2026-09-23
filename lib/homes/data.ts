import { sql } from '@vercel/postgres';

import type { ConversationHistoryItem, DashboardSummary, Lead, LeadStage } from '@/lib/homes/types';

function numberValue(value: unknown): number {
  return Number(value ?? 0);
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  try {
    const [leadRows, conversationRows, visitRows, permissionRows] = await Promise.all([
      sql`SELECT
            COUNT(*) FILTER (WHERE stage NOT IN ('won', 'lost')) AS open_leads,
            COUNT(*) FILTER (WHERE stage = 'qualified') AS qualified_leads
          FROM leads WHERE user_id = ${userId}`,
      sql`SELECT COUNT(*) AS conversations_today FROM conversations
          WHERE user_id = ${userId} AND last_message_at >= CURRENT_DATE`,
      sql`SELECT COUNT(*) AS scheduled_visits FROM appointments
          WHERE user_id = ${userId} AND status = 'scheduled' AND starts_at >= NOW()`,
      sql`SELECT COUNT(*) AS awaiting_permission FROM call_permissions
          WHERE user_id = ${userId} AND status IN ('requested', 'pending')`,
    ]);

    return {
      openLeads: numberValue(leadRows.rows[0]?.open_leads),
      qualifiedLeads: numberValue(leadRows.rows[0]?.qualified_leads),
      conversationsToday: numberValue(conversationRows.rows[0]?.conversations_today),
      scheduledVisits: numberValue(visitRows.rows[0]?.scheduled_visits),
      callsAwaitingPermission: numberValue(permissionRows.rows[0]?.awaiting_permission),
    };
  } catch (error) {
    console.warn('[Homes] Dashboard data unavailable. Has database/schema.sql been applied?', error);
    return { openLeads: 0, qualifiedLeads: 0, conversationsToday: 0, scheduledVisits: 0, callsAwaitingPermission: 0 };
  }
}

export async function getLeads(userId: string): Promise<Lead[]> {
  try {
    const { rows } = await sql`SELECT id, display_name, phone, source, stage, score, temperature,
      intent, property_type, preferred_location, budget_min, budget_max, bedrooms, urgency,
      qualification_summary, last_contact_at, next_action_at, created_at
      FROM leads WHERE user_id = ${userId}
      ORDER BY score DESC, COALESCE(last_contact_at, created_at) DESC LIMIT 100`;

    return rows.map((row) => ({
      id: String(row.id),
      name: String(row.display_name || row.phone),
      phone: String(row.phone),
      source: String(row.source || 'whatsapp'),
      stage: row.stage as LeadStage,
      score: numberValue(row.score),
      temperature: row.temperature as Lead['temperature'],
      intent: row.intent as Lead['intent'],
      propertyType: row.property_type ? String(row.property_type) : undefined,
      preferredLocation: row.preferred_location ? String(row.preferred_location) : undefined,
      budgetMin: row.budget_min ? numberValue(row.budget_min) : undefined,
      budgetMax: row.budget_max ? numberValue(row.budget_max) : undefined,
      bedrooms: row.bedrooms ? numberValue(row.bedrooms) : undefined,
      urgency: row.urgency ? String(row.urgency) : undefined,
      qualificationSummary: row.qualification_summary ? String(row.qualification_summary) : undefined,
      lastContactAt: row.last_contact_at ? new Date(row.last_contact_at).toISOString() : undefined,
      nextActionAt: row.next_action_at ? new Date(row.next_action_at).toISOString() : undefined,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  } catch (error) {
    console.warn('[Homes] Leads unavailable. Has database/schema.sql been applied?', error);
    return [];
  }
}

export async function getConversationHistory(userId: string): Promise<ConversationHistoryItem[]> {
  try {
    const { rows } = await sql`SELECT c.id, COALESCE(l.display_name, c.contact_phone) AS lead_name,
      c.contact_phone, c.last_message_preview, c.last_message_at, c.unread_count,
      COALESCE(l.stage, 'new') AS stage
      FROM conversations c LEFT JOIN leads l ON l.id = c.lead_id
      WHERE c.user_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST LIMIT 100`;

    return rows.map((row) => ({
      id: String(row.id),
      leadName: String(row.lead_name),
      phone: String(row.contact_phone),
      channel: 'whatsapp',
      lastMessage: String(row.last_message_preview || 'Conversa iniciada'),
      lastMessageAt: new Date(row.last_message_at).toISOString(),
      unreadCount: numberValue(row.unread_count),
      stage: row.stage as LeadStage,
    }));
  } catch (error) {
    console.warn('[Homes] Conversation history unavailable. Has database/schema.sql been applied?', error);
    return [];
  }
}
