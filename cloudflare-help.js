#!/usr/bin/env node

// Cloudflare Access Helper
// Run with: node cloudflare-help.js

function showCloudflareHelp() {
  console.log('🔧 CLOUDFLARE ACCESS HELP\n');

  console.log('📍 DIRECT LINKS:');
  console.log('   • Main Site: https://cloudflare.com/');
  console.log('   • Dashboard: https://dash.cloudflare.com/');
  console.log('   • Websites: https://dash.cloudflare.com/websites');
  console.log('   • Add Site: https://dash.cloudflare.com/?add-site\n');

  console.log('🎯 WHAT TO LOOK FOR:');
  console.log('   • Blue "Add a site" button');
  console.log('   • "Websites" in left sidebar');
  console.log('   • "Add website" button');
  console.log('   • Plus (+) icon next to Websites\n');

  console.log('🔍 IF YOU CAN\'T FIND IT:');
  console.log('   1. Make sure you\'re logged in');
  console.log('   2. Try: https://dash.cloudflare.com/websites');
  console.log('   3. Look for any blue button with "Add"');
  console.log('   4. Try refreshing the page');
  console.log('   5. Try incognito/private browsing');
  console.log('   6. Clear browser cache\n');

  console.log('📞 ALTERNATIVE PROVIDERS:');
  console.log('   • Porkbun: https://porkbun.com/ (supports MX records)');
  console.log('   • Njalla: https://njal.la/ (privacy-focused)');
  console.log('   • Name.com: https://name.com/ (basic DNS)\n');

  console.log('⏰ TIMELINE:');
  console.log('   • Account creation: 2 minutes');
  console.log('   • Domain addition: 3 minutes');
  console.log('   • Nameserver change: 2 minutes');
  console.log('   • DNS propagation: 5-30 minutes');
  console.log('   • Record addition: 2 minutes');
  console.log('   • Verification: 1 minute\n');

  console.log('✅ QUICK CHECK:');
  console.log('   After adding domain to Cloudflare, run:');
  console.log('   node -e "console.log(\'Check https://dnschecker.org/ for semjidkhujirt.com\')"');
}

showCloudflareHelp();