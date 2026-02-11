'use server';

import nodemailer from 'nodemailer';
import { db } from './firebase-config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * Service to handle dynamic email sending via Firestore templates or Defaults.
 * Requires SMTP credentials in .env
 */

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

/**
 * Helper to replace placeholders like {{name}} with actual values.
 */
function replacePlaceholders(html: string, data: Record<string, string>) {
  let result = html;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key]);
  }
  return result;
}

/**
 * Fetches a template from Firestore by name.
 */
async function getTemplate(name: string) {
  try {
    const q = query(collection(db, "emailTemplates"), where("name", "==", name), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data();
    }
  } catch (e) {
    console.error(`Error fetching template ${name}:`, e);
  }
  return null;
}

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const transporter = createTransporter();
  const templateName = `Welcome ${role.toUpperCase()}`;
  const customTemplate = await getTemplate(templateName) || await getTemplate('Welcome General');

  let subject = `Welcome to OpsMarketplace, ${name}!`;
  let html = `
    <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <h2 style="color: #3F51B5; margin-bottom: 24px; font-weight: 800; font-size: 24px;">Welcome to the Marketplace!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 16px; line-height: 1.6;">Your account as a <strong style="color: #3F51B5;">${role.toUpperCase()}</strong> has been successfully created.</p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Login to your dashboard to start managing your operations or expert profile.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #94a3b8;">
          <p>Best regards,<br/>The OpsMarketplace Team</p>
        </div>
      </div>
    </div>
  `;

  if (customTemplate) {
    subject = replacePlaceholders(customTemplate.subject || subject, { name, role });
    html = replacePlaceholders(customTemplate.html, { name, role });
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"OpsMarketplace" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: subject,
      html: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Welcome email failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendLeadAssignmentEmail(consultantEmail: string, consultantName: string, companyName: string, serviceCategory: string) {
  const transporter = createTransporter();
  const customTemplate = await getTemplate("New Lead Notification");

  let subject = `New Opportunity: ${companyName} - ${serviceCategory}`;
  let html = `
    <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="background-color: #3F51B5; padding: 20px; border-radius: 12px; color: white; margin-bottom: 30px;">
          <h2 style="margin: 0; font-weight: 800;">New Lead Assigned!</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Hi ${consultantName},</p>
        <p style="font-size: 16px; line-height: 1.6;">You have been matched with a new service opportunity on OpsMarketplace:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Client</p>
          <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: 800; color: #1e293b;">${companyName}</p>
          
          <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Requirement</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #334155;">${serviceCategory}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;"><strong>Next Steps:</strong></p>
        <ol style="font-size: 15px; color: #475569; line-height: 1.8;">
          <li>Log in to your Expert Console.</li>
          <li>Review the detailed requirement.</li>
          <li>Accept the lead to unlock primary contact details.</li>
        </ol>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://opsmarketplace.com/dashboard" style="background-color: #3F51B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Expert Console</a>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          <p>You received this because you are a verified expert on OpsMarketplace.</p>
        </div>
      </div>
    </div>
  `;

  if (customTemplate) {
    subject = replacePlaceholders(customTemplate.subject || subject, { consultantName, companyName, serviceCategory });
    html = replacePlaceholders(customTemplate.html, { consultantName, companyName, serviceCategory });
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"OpsMarketplace" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: consultantEmail,
      subject: subject,
      html: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Lead assignment email failed:", error);
    return { success: false, error: String(error) };
  }
}
