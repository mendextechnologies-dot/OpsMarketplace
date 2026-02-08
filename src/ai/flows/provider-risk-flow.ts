'use server';
/**
 * @fileOverview Provider Risk & Integrity Engine.
 * Detects suspicious behavior or low-quality patterns in consultant profiles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RiskAssessmentSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']).describe('Assessed risk level'),
  riskScore: z.number().min(0).max(100).describe('0-100 score where 100 is extremely high risk'),
  flags: z.array(z.string()).describe('Specific reasons for the risk flag'),
  recommendation: z.string().describe('Suggested action for the admin'),
});

export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

const riskPrompt = ai.definePrompt({
  name: 'assessProviderRisk',
  input: { 
    schema: z.object({ 
      name: z.string(),
      description: z.string(),
      responseTimeMinutes: z.number(),
      completionRate: z.number(),
      complaintCount: z.number()
    }) 
  },
  output: { schema: RiskAssessmentSchema },
  prompt: `
    You are a marketplace integrity agent.
    Analyze the following consultant performance data for potential risk, fraud, or low-quality behavior.
    
    Name: {{name}}
    Description: {{description}}
    Avg Response Time: {{responseTimeMinutes}} minutes
    Completion Rate: {{completionRate}}%
    Complaints: {{complaintCount}}
    
    Flag high risk if:
    - Completion rate is < 60%
    - Complaints are > 3
    - Description is generic or looks generated/fake
    - Response time is excessively long (> 1440 minutes / 24 hours)
  `,
});

export async function assessProviderRisk(input: { 
  name: string; 
  description: string; 
  responseTimeMinutes: number;
  completionRate: number;
  complaintCount: number;
}): Promise<RiskAssessment> {
  const { output } = await riskPrompt(input);
  if (!output) throw new Error('AI failed to assess provider risk');
  return output;
}
