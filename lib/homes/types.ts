export type LeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'visit_scheduled'
  | 'proposal'
  | 'won'
  | 'lost';

export type LeadTemperature = 'cold' | 'warm' | 'hot';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  stage: LeadStage;
  score: number;
  temperature: LeadTemperature;
  intent?: 'buy' | 'rent' | 'sell' | 'unknown';
  propertyType?: string;
  preferredLocation?: string;
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: number;
  urgency?: string;
  qualificationSummary?: string;
  lastContactAt?: string;
  nextActionAt?: string;
  createdAt: string;
}

export interface QualificationInput {
  intent?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  propertyType?: string;
  bedrooms?: number;
  urgency?: string;
  messageCount?: number;
  repliedRecently?: boolean;
}

export interface QualificationResult {
  score: number;
  temperature: LeadTemperature;
  recommendedStage: LeadStage;
  summary: string;
  missingFields: string[];
  nextBestAction: string;
  provider: 'rules_v1' | 'external_ai';
}

export interface DashboardSummary {
  openLeads: number;
  qualifiedLeads: number;
  conversationsToday: number;
  scheduledVisits: number;
  callsAwaitingPermission: number;
}

export interface ConversationHistoryItem {
  id: string;
  leadName: string;
  phone: string;
  channel: 'whatsapp';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  stage: LeadStage;
}
