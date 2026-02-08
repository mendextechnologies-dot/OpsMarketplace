'use server';
/**
 * @fileOverview Intent Extraction Engine.
 * Converts natural language requirements into structured JSON objects.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntentOutputSchema = z.object({
  serviceCategory: z.string().describe('The broad category of service (e.g. Labour Compliance, Payroll, HR)'),
  specificServices: z.array(z.string()).describe('List of specific sub-services identified'),
  location: z.string().describe('The city or state mentioned'),
  urgency: z.enum(['low', 'medium', 'high']).describe('The urgency of the requirement'),
  companySize: z.string().optional().describe('Estimated employee count if mentioned'),
  industry: z.string().optional().describe('The industry of the SME'),
});

export type IntentOutput = z.infer<typeof IntentOutputSchema>;

const intentPrompt = ai.definePrompt({
  name: 'extractIntent',
  input: { schema: z.object({ text: z.string() }) },
  output: { schema: IntentOutputSchema },
  prompt: `
    You are an expert marketplace intake agent for operational services in India.
    Extract structured data from the following user requirement text.
    
    User Text: "{{text}}"
    
    Identify the service category, specific services, location, and urgency.
    If company size or industry is mentioned, extract those as well.
  `,
});

export async function extractIntent(text: string): Promise<IntentOutput> {
  const { output } = await intentPrompt({ text });
  if (!output) throw new Error('AI failed to extract intent');
  return output;
}
