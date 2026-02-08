'use server';
/**
 * @fileOverview Lead Quality Scoring Engine.
 * Evaluates the quality and reliability of a service request.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const LeadScoreOutputSchema = z.object({
  score: z.number().min(0).max(10).describe('Overall quality score from 0 to 10'),
  reasoning: z.string().describe('Brief explanation for the score'),
  completeness: z.number().describe('Percentage of required fields provided'),
  intentClarity: z.enum(['vague', 'clear', 'very_specific']).describe('How clear the requirement is'),
});

export type LeadScoreOutput = z.infer<typeof LeadScoreOutputSchema>;

const scoringPrompt = ai.definePrompt({
  name: 'scoreLead',
  input: { schema: z.object({ description: z.string(), companyName: z.string() }) },
  output: { schema: LeadScoreOutputSchema },
  prompt: `
    You are a marketplace quality control agent.
    Evaluate the following service request for quality, intent clarity, and completeness.
    
    Company: {{companyName}}
    Description: {{description}}
    
    Provide a score from 0-10 where 10 is a highly specific, high-intent professional request.
  `,
});

export async function scoreLead(input: { description: string; companyName: string }): Promise<LeadScoreOutput> {
  const { output } = await scoringPrompt(input);
  if (!output) throw new Error('AI failed to score lead');
  return output;
}
