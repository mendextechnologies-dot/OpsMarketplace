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
    You are a marketplace pricing analyst for operational services in India.
    Provide realistic market price insights for the following service and location.
    
    Service: {{categoryName}}
    Location: {{location}}
    
    Consider standard rates for:
    - PF/ESIC Registration: ₹2,500 - ₹5,000
    - Shop Act: ₹1,500 - ₹3,500
    - Labour Audits: ₹15,000+
    - GST Filing: ₹1,000 - ₹3,000 per month
    
    Provide a realistic range and sentiment.
  `,
});

export async function getPricingInsights(input: { categoryName: string; location: string }): Promise<PricingOutput> {
  const { output } = await pricingPrompt(input);
  if (!output) throw new Error('AI failed to generate pricing insights');
  return output;
}
