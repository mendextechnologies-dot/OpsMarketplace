
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase-config";

/**
 * Service to handle system emails via the Firebase "Trigger Email" extension.
 * The extension must be installed in the Firebase Console and configured with SMTP details.
 */

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  try {
    // 1. Find the appropriate template from the managed collection
    const templatesRef = collection(db, "emailTemplates");
    const q = query(templatesRef, where("roleType", "==", role), limit(1));
    const querySnapshot = await getDocs(q);

    let subject = `Welcome to OpsMarketplace, ${name}!`;
    let html = `
      <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <h2 style="color: #6366f1; margin-bottom: 24px; font-weight: 800; font-size: 24px;">Welcome to the Marketplace!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          <p style="font-size: 16px; line-height: 1.6;">Your account as a <strong style="color: #6366f1;">${role.toUpperCase()}</strong> has been successfully created.</p>
          <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Login to your dashboard to start managing your operations or expert profile.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #94a3b8;">
            <p>Best regards,<br/>The OpsMarketplace Team</p>
          </div>
        </div>
      </div>
    `;

    // Override with custom template if found in Firestore
    if (!querySnapshot.empty) {
      const template = querySnapshot.docs[0].data();
      subject = template.subject.replace(/{{name}}/g, name);
      html = template.html.replace(/{{name}}/g, name);
    }

    // 2. Queue the email in the 'mail' collection
    // The Firebase "Trigger Email" extension listens to this collection
    await addDoc(collection(db, "mail"), {
      to: [email],
      message: {
        subject: subject,
        html: html,
      },
      createdAt: serverTimestamp(),
    });

    console.log(`Welcome email queued for ${email} as role ${role}`);
  } catch (error) {
    console.error("Failed to queue welcome email:", error);
  }
}
