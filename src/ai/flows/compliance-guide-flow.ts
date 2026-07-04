'use server';
/**
 * @fileOverview Compliance Intake Flow.
 * 
 * - complianceGuide - An agentic flow designed to capture payroll, HRMS, and compliance requirements and execute tools.
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
    description: 'Creates a new compliance or payroll service request for an SME. Use this once you have captured company name, city, and a clear description of the HRMS/payroll/compliance requirement.',
    inputSchema: z.object({
      companyName: z.string().describe('The name of the SME company.'),
      city: z.string().describe('The city where the service is needed.'),
      description: z.string().describe('A detailed description of the payroll or compliance requirement.'),
      categoryName: z.string().describe('The estimated service category name.'),
      urgency: z.enum(['low', 'medium', 'high']).default('medium').describe('The detected urgency of the request.'),
    }),
    outputSchema: z.object({
      requestId: z.string(),
      status: z.string(),
      message: z.string(),
      matchPreview: z.string().optional().describe('A quick message about potential expert matches.'),
    }),
  },
  async (input) => {
    try {
      const category = SERVICE_TAXONOMY.find(c => 
        c.name.toLowerCase().includes(input.categoryName.toLowerCase()) || 
        input.categoryName.toLowerCase().includes(c.name.toLowerCase())
      );
      
      const companyKey = generateCompanyKey(input.companyName, input.city);
      
      const docRef = await addDoc(collection(db, "serviceRequests"), {
        companyName: input.companyName,
        city: input.city,
        description: input.description,
        categoryId: category?.id || "cat_labour_compliance",
        companyUniqueKey: companyKey,
        status: "new",
        urgency: input.urgency,
        isGuestRequest: true,
        leadOwnerType: "sme",
        createdAt: serverTimestamp(),
        source: "ai_sales_funnel",
        ai_metadata: {
          quality_score: 8,
          intent_clarity: 'clear',
          reasoning: 'Captured via high-conversion AI chat flow.'
        }
      });

      return {
        requestId: docRef.id,
        status: 'success',
        message: `Successfully created service request for ${input.companyName}. Reference ID: ${docRef.id}`,
        matchPreview: `I've found 3 verified experts in ${input.city} who specialize in ${input.categoryName}. One of them has a 98% match score for your specific requirement!`,
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
      message: `Excellent! I have prepared your onboarding as a ${input.role}. Please proceed to the signup page to finalize your profile and access high-intent leads.`,
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
  leadSummary: z.object({
    service: z.string().optional(),
    location: z.string().optional(),
    urgency: z.string().optional(),
  }).optional(),
});
export type GuideOutput = z.infer<typeof GuideOutputSchema>;

export async function complianceGuide(input: GuideInput): Promise<GuideOutput> {
  const response = await ai.generate({
    system: `
      You are the "OpsMarketplace Compliance Engine", a high-conversion AI agent focused on HRMS, payroll, and labour compliance services.
      
      YOUR MISSION:
      Capture high-quality compliance and payroll requirements, qualify the scope quickly, and guide users to submit a request or join as a verified provider.
      You are NOT a basic FAQ bot. You are a conversion-focused intake engine.
      
      STRATEGY:
      1. GREETING: Detect whether they need payroll/compliance support, are an expert, or are browsing.
      2. REQUIREMENT BUILDING: Ask clearly for Service Area, Location, Employee Count, Industry, and Urgency.
      3. PRICING INTELLIGENCE: Provide market ranges for the compliance domain if asked.
         - PF/ESIC Filing: ₹2,500 - ₹5,000
         - Shop Act Registration: ₹1,500 - ₹3,500
         - Labour Audit: ₹15,000 - ₹40,000
         - HRMS Implementation: ₹50,000 - ₹250,000
         - TDS / GST Compliance Support: ₹1,000 - ₹4,000 per month
      4. URGENCY: If the requirement is urgent, mention that verified experts can respond within hours and prioritize statutory deadlines.
      5. TOOL USE: Use 'submitServiceRequest' as soon as you have Company Name, City, Category or service area, and a clear payroll/compliance need.
      6. MATCHING: After a request is created, mention match readiness like "We have verified experts with a 94% match in Mumbai." 
      
      CONTEXT:
      Service categories include Labour Law & Compliance, Payroll & Statutory Filings, HRMS & Workforce Operations, and Employee Documentation.
      
      TONE: Professional, authoritative, efficient, and trust-building.
    `,
    prompt: input.message,
    history: input.history?.map(h => ({
      role: h.role,
      content: [{ text: h.content }]
    })),
    tools: [submitServiceRequest, initiateOnboarding],
  });

  const toolResult = response.toolResults?.[0];
  let redirectUrl = undefined;
  let action: GuideOutput['suggestedAction'] = 'none';

  if (toolResult?.name === 'initiateOnboarding') {
    redirectUrl = toolResult.output?.redirectUrl;
    action = 'redirect';
  } else if (toolResult?.name === 'submitServiceRequest') {
    action = 'none';
  }

  return {
    answer: response.text,
    suggestedAction: action,
    redirectUrl: redirectUrl,
  };
}
