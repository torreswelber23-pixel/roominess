import { sql } from '@vercel/postgres';
import { type NextRequest, NextResponse } from 'next/server';

import { auth0 } from '@/lib/auth0';
import { qualifyLead } from '@/lib/homes/qualification';
import type { QualificationInput } from '@/lib/homes/types';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth0.getSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const userId = session.user.email || session.user.sub;
  const { id } = await params;
  if (!userId) return NextResponse.json({ error: 'Authenticated user has no stable identifier' }, { status: 400 });

  const leadResult = await sql`SELECT id, intent, budget_min, budget_max, preferred_location,
    property_type, bedrooms, urgency FROM leads WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  const lead = leadResult.rows[0];
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const messageResult = await sql`SELECT COUNT(*) AS message_count,
    MAX(occurred_at) >= NOW() - INTERVAL '72 hours' AS replied_recently
    FROM messages m JOIN conversations c ON c.id = m.conversation_id
    WHERE c.lead_id = ${id} AND m.direction = 'inbound'`;

  const input: QualificationInput = {
    intent: lead.intent,
    budgetMin: lead.budget_min ? Number(lead.budget_min) : undefined,
    budgetMax: lead.budget_max ? Number(lead.budget_max) : undefined,
    preferredLocation: lead.preferred_location,
    propertyType: lead.property_type,
    bedrooms: lead.bedrooms ? Number(lead.bedrooms) : undefined,
    urgency: lead.urgency,
    messageCount: Number(messageResult.rows[0]?.message_count || 0),
    repliedRecently: Boolean(messageResult.rows[0]?.replied_recently),
  };
  const result = qualifyLead(input);

  await sql`UPDATE leads SET score = ${result.score}, temperature = ${result.temperature},
    stage = ${result.recommendedStage}, qualification_summary = ${result.summary},
    next_best_action = ${result.nextBestAction}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}`;
  await sql`INSERT INTO lead_qualifications
    (user_id, lead_id, provider, score, summary, missing_fields, next_best_action, input_snapshot, output_snapshot)
    VALUES (${userId}, ${id}, ${result.provider}, ${result.score}, ${result.summary},
      ${JSON.stringify(result.missingFields)}::jsonb, ${result.nextBestAction},
      ${JSON.stringify(input)}::jsonb, ${JSON.stringify(result)}::jsonb)`;

  return NextResponse.json(result);
}
