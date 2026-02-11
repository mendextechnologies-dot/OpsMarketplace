
'use server';

import nodemailer from 'nodemailer';

/**
 * Service to handle direct email sending via Nodemailer in a Server Action.
 * Requires SMTP credentials in .env
 */

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  // 1. Configure SMTP Transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Adding standard timeout and connection settings
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  const subject = `Welcome to OpsMarketplace, ${name}!`;
  const html = `
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

  try {
    // Determine the "From" address
    const fromAddress = process.env.SMTP_FROM || `"OpsMarketplace" <${process.env.SMTP_USER}>`;

    // 2. Attempt to send the email directly
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`Welcome email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("SMTP sending failed:", error);
    return { success: false, error: String(error) };
  }
}
