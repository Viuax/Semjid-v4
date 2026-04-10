#!/usr/bin/env node

import { config } from "dotenv";
import { Resend } from "resend";

// Load environment variables
config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("🔑 RESEND_API_KEY loaded:", process.env.RESEND_API_KEY ? "Yes" : "No");
console.log("📧 ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

async function testEmail() {
  try {
    console.log("🧪 Testing email configuration...");

    // Test API key
    const domains = await resend.domains.list();
    console.log("✅ API Key valid, domains:", domains.data?.length || 0);

    // Test sending email (to verified email only for testing)
    const result = await resend.emails.send({
      from: "Test <test@resend.dev>",
      to: "dulguunlkh17@gmail.com", // Verified email for testing
      subject: "Email Test - Semjid Booking System",
      html: `
        <h1>🧪 Email Test</h1>
        <p>This is a test email from the Semjid booking system.</p>
        <p>If you receive this, the email system is working correctly.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Admin email configured: ${process.env.ADMIN_EMAIL}</p>
      `,
    });

    console.log("✅ Test email sent successfully:", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Email test failed:", error);
    return { success: false, error: error.message };
  }
}

// Run test directly
testEmail().then(result => {
  console.log("Test result:", result);
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});