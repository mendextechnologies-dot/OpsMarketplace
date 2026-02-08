'use server';
/**
 * @fileOverview Provider Profile AI Enhancer.
 * Generates professional descriptions and specialization tags for consultants.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProfileEnhancerOutputSchema = z.object({
  professionalBio: z.string().describe('A high-impact, professional bio for the consultant'),
  specializationTags: z.array(z.string()).describe('SEO keywords and specialized tags'),
  industryFocus: z.array(z.string()).describe('Industries this consultant excels in'),
});

export type ProfileEnhancerOutput = z.infer<typeof ProfileEnhancerOutputSchema>;

const enhancementPrompt = ai.definePrompt({
  name: 'enhanceProfile',
  input: { schema: z.object({ rawBio: z.string(), services: z.array(z.string()) }) },
  output: { schema: ProfileEnhancerOutputSchema },
  prompt: `
    You are a professional brand consultant for enterprise service providers.
    Enhance the following consultant profile data into a high-conversion professional bio and tags.
    
    Raw Bio: {{rawBio}}
    Services Offered: {{#each services}} - {{this}} {{/each}}
  `,
});

export async function enhanceProfile(input: { rawBio: string; services: string[] }): Promise<ProfileEnhancerOutput> {
  const { output } = await enhancementPrompt(input);
  if (!output) throw new Error('AI failed to enhance profile');
  return output;
}
