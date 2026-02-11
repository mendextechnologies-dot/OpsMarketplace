
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase-config";

/**
 * Service to handle system emails via the Firebase "Trigger Email" extension.
 */

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  try {
    // 1. Find the appropriate template
    const templatesRef = collection(db, "emailTemplates");
    const q = query(templatesRef, where("roleType", "==", role), limit(1));
    const querySnapshot = await getDocs(q);

    let subject = `Welcome to OpsMarketplace, ${name}!`;
    let html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Welcome to the Marketplace!</h2>
        <p>Hi ${name},</p>
        <p>Your account as a <strong>${role.toUpperCase()}</strong> has been successfully created.</p>
        <p>Login to your dashboard to get started.</p>
        <br/>
        <p>Best regards,<br/>The OpsMarketplace Team</p>
      </div>
    `;

    // Override with custom template if found
    if (!querySnapshot.empty) {
      const template = querySnapshot.docs[0].data();
      subject = template.subject.replace("{{name}}", name);
      html = template.html.replace("{{name}}", name);
    }

    // 2. Queue the email in the 'mail' collection for the Firebase Extension to pick up
    await addDoc(collection(db, "mail"), {
      to: [email],
      message: {
        subject: subject,
        html: html,
      },
      createdAt: serverTimestamp(),
    });

    console.log(`Welcome email queued for ${email}`);
  } catch (error) {
    console.error("Failed to queue welcome email:", error);
  }
}
