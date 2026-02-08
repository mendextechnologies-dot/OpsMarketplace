'use server';
/**
 * @fileOverview Marketplace Guide AI Flow.
 * Answers service-related questions and guides users through the marketplace.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SERVICE_TAXONOMY } from '@/lib/constants';

const GuideInputSchema = z.object({
  message: z.string().describe('The user question or message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});
export type GuideInput = z.infer<typeof GuideInputSchema>;

const GuideOutputSchema = z.object({
  answer: z.string().describe('The AI response message.'),
  suggestedAction: z.enum(['submit_request', 'join_network', 'none']).optional().describe('A suggested next step for the user.'),
});
export type GuideOutput = z.infer<typeof GuideOutputSchema>;

const guidePrompt = ai.definePrompt({
  name: 'marketplaceGuide',
  input: { schema: GuideInputSchema },
  output: { schema: GuideOutputSchema },
  prompt: `
    You are the "OpsMarketplace Guide", an expert AI assistant for operational services in India.
    
    CRITICAL RULES:
    1. ONLY answer questions related to the following services: {{#each services}} - {{this.name}} ({{this.description}}) {{/each}}.
    2. If a user asks about anything else (sports, weather, coding, etc.), politely decline and say you are specialized in business operations, compliance, and HR services.
    3. Always guide the user towards taking an action:
       - If they have a specific need, suggest "Submit a Request".
       - If they are a consultant, suggest "Join our Expert Network".
    4. Keep answers concise, professional, and helpful.
    
    User History:
    {{#each history}}
    {{role}}: {{content}}
    {{/each}}
    
    Current User Message: "{{message}}"
  `,
});

export async function marketplaceGuide(input: GuideInput): Promise<GuideOutput> {
  const { output } = await guidePrompt({
    ...input,
    services: SERVICE_TAXONOMY,
  });
  if (!output) throw new Error('AI failed to provide guidance');
  return output;
}
