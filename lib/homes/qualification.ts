import type { QualificationInput, QualificationResult } from '@/lib/homes/types';

const FIELD_LABELS: Record<string, string> = {
  intent: 'objetivo (comprar, alugar ou vender)',
  preferredLocation: 'regiao de interesse',
  propertyType: 'tipo de imovel',
  budget: 'faixa de investimento',
  bedrooms: 'numero de quartos',
  urgency: 'prazo para decisao',
};

export function qualifyLead(input: QualificationInput): QualificationResult {
  let score = 10;
  const missingFields: string[] = [];

  if (input.intent && input.intent !== 'unknown') score += 18;
  else missingFields.push(FIELD_LABELS.intent);

  if (input.preferredLocation) score += 14;
  else missingFields.push(FIELD_LABELS.preferredLocation);

  if (input.propertyType) score += 10;
  else missingFields.push(FIELD_LABELS.propertyType);

  if (input.budgetMin || input.budgetMax) score += 18;
  else missingFields.push(FIELD_LABELS.budget);

  if (input.bedrooms) score += 8;
  else missingFields.push(FIELD_LABELS.bedrooms);

  if (input.urgency) score += 14;
  else missingFields.push(FIELD_LABELS.urgency);

  if ((input.messageCount ?? 0) >= 4) score += 4;
  if (input.repliedRecently) score += 4;

  score = Math.min(100, score);
  const temperature = score >= 72 ? 'hot' : score >= 42 ? 'warm' : 'cold';
  const recommendedStage = score >= 60 ? 'qualified' : 'contacted';
  const nextBestAction = missingFields.length
    ? `Perguntar sobre ${missingFields.slice(0, 2).join(' e ')}.`
    : 'Confirmar disponibilidade e sugerir horarios para uma visita.';

  return {
    score,
    temperature,
    recommendedStage,
    summary:
      temperature === 'hot'
        ? 'Lead com intencao clara e dados suficientes para abordagem comercial imediata.'
        : temperature === 'warm'
          ? 'Lead engajado, mas ainda precisa de algumas informacoes para avancar.'
          : 'Lead em descoberta; priorize perguntas curtas para entender contexto e intencao.',
    missingFields,
    nextBestAction,
    provider: 'rules_v1',
  };
}
