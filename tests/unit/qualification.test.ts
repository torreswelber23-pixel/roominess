import { describe, expect, it } from 'vitest';

import { qualifyLead } from '@/lib/homes/qualification';

describe('qualifyLead', () => {
  it('marks a complete, engaged lead as hot and qualified', () => {
    const result = qualifyLead({
      intent: 'buy',
      budgetMax: 900000,
      preferredLocation: 'Moema',
      propertyType: 'apartment',
      bedrooms: 3,
      urgency: '30 days',
      messageCount: 6,
      repliedRecently: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(72);
    expect(result.temperature).toBe('hot');
    expect(result.recommendedStage).toBe('qualified');
    expect(result.missingFields).toHaveLength(0);
  });

  it('returns discovery questions for a sparse lead', () => {
    const result = qualifyLead({ messageCount: 1 });

    expect(result.temperature).toBe('cold');
    expect(result.missingFields).toContain('faixa de investimento');
    expect(result.nextBestAction).toMatch(/^Perguntar/);
  });
});
