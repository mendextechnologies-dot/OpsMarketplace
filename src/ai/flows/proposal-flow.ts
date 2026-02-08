'use server';
/**
 * @fileOverview AI Proposal Assistant.
 * Generates professional introductory responses for consultants.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProposalOutputSchema = z.object({
  draftMessage: z.string().describe('The professional proposal draft'),
  keyValueProps: z.array(z.string()).describe('Key selling points to highlight in the conversation'),
  estimatedComplexity: z.enum(['simple', 'moderate', 'complex']).describe('AI estimated difficulty'),
});

export type ProposalOutput = z.infer<typeof ProposalOutputSchema>;

const proposalPrompt = ai.definePrompt({
  name: 'generateProposal',
  input: { 
    schema: z.object({ 
      description: z.string(), 
      services: z.array(z.string()),
      consultantName: z.string(),
      consultantBio: z.string()
    }) 
  },
  output: { schema: ProposalOutputSchema },
  prompt: `
    You are an expert sales assistant for operational consultants in India.
    Your goal is to draft a high-impact, professional introductory message for a new service request.
    
    Consultant Name: {{consultantName}}
    Expertise: {{consultantBio}}
    
    Requirement:
    Description: {{description}}
    Specific Services: {{#each services}} - {{this}} {{/each}}
    
    Instructions:
    1. Keep the draft professional, concise, and value-driven.
    2. Acknowledge the specific requirements mentioned.
    3. Do not include specific pricing unless mentioned in the description.
    4. Focus on how the consultant can solve the compliance/operational pain point.
  `,
});

export async function generateProposal(input: { 
  description: string; 
  services: string[]; 
  consultantName: string;
  consultantBio: string;
}): Promise<ProposalOutput> {
  const { output } = await proposalPrompt(input);
  if (!output) throw new Error('AI failed to generate proposal');
  return output;
}
