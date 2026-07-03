'use server';
/**
 * @fileOverview AI Pricing Intelligence Engine.
 * Provides market-aware pricing estimates based on category and location.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PricingOutputSchema = z.object({
  typicalRange: z.object({
    min: z.number().describe('Minimum typical price'),
    max: z.number().describe('Maximum typical price'),
    currency: z.string().default('INR'),
  }),
  marketSentiment: z.string().describe('Brief description of current market trends for this service'),
  factors: z.array(z.string()).describe('Key factors influencing the price (e.g., urgency, complexity)'),
});

export type PricingOutput = z.infer<typeof PricingOutputSchema>;

const pricingPrompt = ai.definePrompt({
  name: 'getPricingInsights',
  input: { schema: z.object({ categoryName: z.string(), location: z.string() }) },
  output: { schema: PricingOutputSchema },
  prompt: `
    You are a pricing analyst for HRMS, payroll, and labour compliance services in India.
    Provide realistic market price insights for the following compliance service and location.
    
    Service: {{categoryName}}
    Location: {{location}}
    
    Consider market norms for:
    - PF/ESIC Filing & Payroll Compliance: ₹2,500 - ₹5,000
    - Shop Act / Labour Licence: ₹1,500 - ₹3,500
    - Labour Law Audit: ₹15,000 - ₹40,000
    - HRMS / Payroll Software Implementation: ₹50,000 - ₹250,000
    - TDS/GST Filing Support: ₹1,000 - ₹4,000 per month
    
    Provide a realistic range, key pricing factors, and market sentiment for SMEs.
  `,
});

export async function getPricingInsights(input: { categoryName: string; location: string }): Promise<PricingOutput> {
  const { output } = await pricingPrompt(input);
  if (!output) throw new Error('AI failed to generate pricing insights');
  return output;
}
