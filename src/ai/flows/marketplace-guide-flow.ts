'use server';
/**
 * @fileOverview Agentic Marketplace Guide.
 * 
 * - marketplaceGuide - An agentic flow that can answer questions and execute tools.
 * - Tools: submitServiceRequest, initiateOnboarding.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SERVICE_TAXONOMY } from '@/lib/constants';
import { db } from '@/lib/firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateCompanyKey } from '@/lib/utils';

// --- TOOLS ---

/**
 * Tool to directly create a service request from the chat.
 */
const submitServiceRequest = ai.defineTool(
  {
    name: 'submitServiceRequest',
    description: 'Creates a new service request (lead) for an SME. Use this when the user provides company name, city, and a description of their need.',
    inputSchema: z.object({
      companyName: z.string().describe('The name of the SME company.'),
      city: z.string().describe('The city where the service is needed.'),
      description: z.string().describe('A detailed description of the service requirement.'),
      categoryName: z.string().describe('The estimated service category name.'),
    }),
    outputSchema: z.object({
      requestId: z.string(),
      status: z.string(),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      // Find category ID from taxonomy if possible
      const category = SERVICE_TAXONOMY.find(c => 
        c.name.toLowerCase().includes(input.categoryName.toLowerCase()) || 
        input.categoryName.toLowerCase().includes(c.name.toLowerCase())
      );
      
      const companyKey = generateCompanyKey(input.companyName, input.city);
      
      const docRef = await addDoc(collection(db, "serviceRequests"), {
        companyName: input.companyName,
        city: input.city,
        description: input.description,
        categoryId: category?.id || "cat_labour_compliance", // fallback
        companyUniqueKey: companyKey,
        status: "new",
        urgency: "medium",
        isGuestRequest: true,
        leadOwnerType: "sme",
        createdAt: serverTimestamp(),
        source: "ai_chat_agent"
      });

      return {
        requestId: docRef.id,
        status: 'success',
        message: `Successfully created service request for ${input.companyName}. Reference ID: ${docRef.id}`,
      };
    } catch (error: any) {
      return {
        requestId: '',
        status: 'error',
        message: `Failed to create request: ${error.message}`,
      };
    }
  }
);

/**
 * Tool to capture interest for Consultant or Partner onboarding.
 */
const initiateOnboarding = ai.defineTool(
  {
    name: 'initiateOnboarding',
    description: 'Signals intent to join the platform as a Consultant or Partner. Use this when a professional expresses interest in joining.',
    inputSchema: z.object({
      name: z.string().describe('The name of the individual or firm.'),
      email: z.string().email().describe('The contact email.'),
      role: z.enum(['consultant', 'partner']).describe('The role they wish to join as.'),
    }),
    outputSchema: z.object({
      status: z.string(),
      redirectUrl: z.string(),
      message: z.string(),
    }),
  },
  async (input) => {
    const url = `/signup?role=${input.role}&email=${encodeURIComponent(input.email)}&name=${encodeURIComponent(input.name)}`;
    return {
      status: 'success',
      redirectUrl: url,
      message: `Excellent! I have prepared your onboarding as a ${input.role}. Please proceed to the signup page to finalize your profile.`,
    };
  }
);

// --- FLOW ---

const GuideInputSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});
export type GuideInput = z.infer<typeof GuideInputSchema>;

const GuideOutputSchema = z.object({
  answer: z.string(),
  suggestedAction: z.enum(['submit_request', 'join_network', 'redirect', 'none']).optional(),
  redirectUrl: z.string().optional(),
});
export type GuideOutput = z.infer<typeof GuideOutputSchema>;

export async function marketplaceGuide(input: GuideInput): Promise<GuideOutput> {
  const response = await ai.generate({
    system: `
      You are the "OpsMarketplace Agent", a proactive AI assistant.
      
      GOALS:
      1. Answer questions about operational services: {{#each services}} - {{this.name}} ({{this.description}}) {{/each}}.
      2. If a user provides company name, city, and a requirement, use the 'submitServiceRequest' tool to create the lead IMMEDIATELY.
      3. If a professional (Consultant/Partner) wants to join, use the 'initiateOnboarding' tool to prepare their signup.
      4. If you don't have enough info for a tool, ask clarifying questions.
      
      TONE: Professional, efficient, and action-oriented.
    `,
    prompt: input.message,
    history: input.history?.map(h => ({
      role: h.role,
      content: [{ text: h.content }]
    })),
    tools: [submitServiceRequest, initiateOnboarding],
  });

  // Check if a tool was used and extract its results
  const toolResult = response.toolResults?.[0];
  let redirectUrl = undefined;
  let action: GuideOutput['suggestedAction'] = 'none';

  if (toolResult?.name === 'initiateOnboarding') {
    redirectUrl = toolResult.output?.redirectUrl;
    action = 'redirect';
  } else if (toolResult?.name === 'submitServiceRequest') {
    action = 'none'; // The text answer will confirm creation
  }

  return {
    answer: response.text,
    suggestedAction: action,
    redirectUrl: redirectUrl,
  };
}
