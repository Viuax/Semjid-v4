import { Resend } from "resend";
import { config } from "dotenv";

config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

export async function checkDomainStatus() {
  try {
    console.log("🔍 Checking domain verification status...");

    const response = await resend.domains.list();
    console.log("API Response structure:", Object.keys(response));

    const domains = response.data || response || [];

    if (!domains || (Array.isArray(domains) && domains.length === 0)) {
      console.log("❌ No domains found. Add your domain first at https://resend.com/domains");
      console.log("📝 Steps to add domain:");
      console.log("   1. Go to https://resend.com/domains");
      console.log("   2. Click 'Add Domain'");
      console.log("   3. Enter: semjid-khujirt.mn");
      console.log("   4. Copy the DNS records shown");
      console.log("   5. Add them to your GoDaddy DNS settings");
      return;
    }

    console.log("Found domains data:", domains);

    if (Array.isArray(domains)) {
      for (const domain of domains) {
        console.log(`📋 Domain: ${domain.name || domain.domain || 'Unknown'}`);
        console.log(`   Status: ${domain.status || 'Unknown'}`);
        console.log(`   Created: ${domain.created_at || 'Unknown'}`);

        if (domain.status === 'verified') {
          console.log("✅ Domain is verified! You can now send emails to customers.");
        } else if (domain.status === 'pending') {
          console.log("⏳ Domain is pending verification. Check DNS records.");
          console.log("   Required DNS records:");
          console.log(`   TXT: ${domain.name || domain.domain} TXT "resend-domain-verification=${domain.id}"`);
          console.log(`   MX: ${domain.name || domain.domain} MX feedback-smtp.ap-northeast-1.resend.com (priority: 10)`);
        } else if (domain.status === 'not_started') {
          console.log("📝 Domain added but DNS verification not started.");
          console.log("   You need to add these DNS records to your domain registrar:");
          console.log("");
          console.log("   TXT Record (for domain ownership):");
          console.log(`   Name: @`);
          console.log(`   Type: TXT`);
          console.log(`   Value: resend-domain-verification=${domain.id}`);
          console.log(`   TTL: 300`);
          console.log("");
          console.log("   MX Record (for email routing):");
          console.log(`   Name: @`);
          console.log(`   Type: MX`);
          console.log(`   Value: feedback-smtp.ap-northeast-1.resend.com`);
          console.log(`   Priority: 10`);
          console.log(`   TTL: 300`);
          console.log("");
          console.log("   🌐 Add these records in your Namecheap DNS settings, then click 'Verify' in Resend.");
        } else {
          console.log("❌ Domain verification failed. Check DNS setup.");
        }
        console.log("---");
      }
    } else if (domains.data && Array.isArray(domains.data)) {
      // Handle the actual API response structure
      for (const domain of domains.data) {
        console.log(`📋 Domain: ${domain.name}`);
        console.log(`   Status: ${domain.status}`);
        console.log(`   Created: ${domain.created_at}`);

        if (domain.status === 'verified') {
          console.log("✅ Domain is verified! You can now send emails to customers.");
        } else if (domain.status === 'not_started') {
          console.log("📝 Domain added but DNS verification not started.");
          console.log("   You need to add these DNS records:");
          console.log("");
          console.log("   TXT Record:");
          console.log(`   Name: @`);
          console.log(`   Type: TXT`);
          console.log(`   Value: resend-domain-verification=${domain.id}`);
          console.log(`   TTL: 300`);
          console.log("");
          console.log("   MX Record:");
          console.log(`   Name: @`);
          console.log(`   Type: MX`);
          console.log(`   Value: feedback-smtp.${domain.region}.resend.com`);
          console.log(`   Priority: 10`);
          console.log(`   TTL: 300`);
          console.log("");
          console.log("   Add these in Namecheap DNS settings, then verify in Resend dashboard.");
        }
        console.log("---");
      }
    }

  } catch (error) {
    console.error("❌ Error checking domains:", error.message);
    console.error("Full error object:", error);
  }
}

// Run check
checkDomainStatus();