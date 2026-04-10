# Cloudflare DNS Workaround - Detailed Guide

## 🎯 Goal: Add MX Record Using Cloudflare (Temporary)

Since Namecheap is missing MX record support, we'll temporarily use Cloudflare's free DNS to add the required records, then switch back.

## 📋 Required Records (Copy These!)

### TXT Record
```
Type: TXT
Name: semjidkhujirt.com
Content: resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c
TTL: Auto
```

### MX Record
```
Type: MX
Name: semjidkhujirt.com
Content: feedback-smtp.ap-northeast-1.resend.com
Priority: 10
TTL: Auto
```

## 🖥️ Step-by-Step Instructions (Updated for Current Interface)

### Phase 1: Switch to Cloudflare Nameservers

#### Step 1: Sign up for Cloudflare
1. Go to https://cloudflare.com/
2. Click **"Sign up"** in the top right (free account)
3. Create account with email
4. Verify email

#### Step 2: Access Dashboard After Login
1. After login, you should see the **Cloudflare Dashboard**
2. If you see a welcome screen, look for **"Add a site"** or **"Add website"**
3. If you don't see it, click on **"Websites"** in the left sidebar
4. Then click **"Add a site"** or **"Add website"** button

#### Alternative Navigation:
- **Direct URL**: https://dash.cloudflare.com/
- Look for **blue "Add a site" button** anywhere on the page
- Or click **"Websites"** → **"Add site"**

#### Step 3: Add Your Domain to Cloudflare
1. Click **"Add a site"** or **"Add website"**
2. Enter: `semjidkhujirt.com`
3. Click **"Add site"** or **"Continue"**
4. Select **"Free"** plan (should be selected by default)
5. Click **"Continue"**

#### Step 4: Quick Scan (Optional)
1. Cloudflare will scan your DNS records
2. Click **"Continue"** (we'll add our own records)

#### Step 5: Get Cloudflare Nameservers
1. You'll see **2 nameservers** to update
2. **Copy these exactly** (they'll look like):
   - `emma.ns.cloudflare.com`
   - `logan.ns.cloudflare.com`
3. **Keep this page open** - you'll need these nameservers
4. Click **"Continue"** (don't close this page yet!)

#### Step 6: Change Nameservers in Namecheap
1. Open new tab, go to https://www.namecheap.com/
2. Login to your account
3. Click **"Domain"** in top menu
4. Find `semjidkhujirt.com`
5. Click **"MANAGE"**
6. Click **"Nameservers"** tab
7. Select **"Custom DNS"**
8. **Delete any existing nameservers**
9. **Add the 2 Cloudflare nameservers** you copied
10. Click **"Save changes"**
11. Go back to Cloudflare tab

### Phase 2: Add DNS Records in Cloudflare

#### Step 7: Complete Cloudflare Setup
1. In Cloudflare, click **"Done, check nameservers"**
2. Wait for nameserver verification (5-30 minutes)
3. Or click **"Continue"** to add records now

#### Step 8: Access DNS Settings
1. In Cloudflare dashboard, click on `semjidkhujirt.com`
2. Click **"DNS"** in the left sidebar
3. You should see existing records (if any)

#### Step 9: Add TXT Record
1. Click **"Add record"** button
2. Select **"TXT"** from the Type dropdown
3. **Name**: Leave as `@` or type `semjidkhujirt.com`
4. **Content**: `resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c`
5. **TTL**: Auto (leave default)
6. Click **"Save"**

#### Step 10: Add MX Record
1. Click **"Add record"** button again
2. Select **"MX"** from the Type dropdown
3. **Name**: Leave as `@` or type `semjidkhujirt.com`
4. **Content**: `feedback-smtp.ap-northeast-1.resend.com`
5. **Priority**: 10
6. **TTL**: Auto (leave default)
7. Click **"Save"**

### Phase 3: Verify and Test

#### Step 11: Check DNS Propagation
1. Go to https://dnschecker.org/
2. Enter: `semjidkhujirt.com`
3. Check **TXT** tab - should show your verification string
4. Check **MX** tab - should show `feedback-smtp.ap-northeast-1.resend.com`

#### Step 12: Verify in Resend
1. Go to https://resend.com/domains
2. Find `semjidkhujirt.com`
3. Click **"Verify"**
4. Status should change to **"Verified"** ✅

### Phase 4: Switch Back to Namecheap (Optional)

#### Step 13: Return to Namecheap DNS
Once verified, you can switch back:
1. In Namecheap → Domain → semjidkhujirt.com → Nameservers
2. Change back to **"Namecheap BasicDNS"**
3. Add the same TXT and MX records in Namecheap's Advanced DNS
4. Delete the domain from Cloudflare (optional)

## 🔍 Troubleshooting "Add a site" Button

### If you can't find "Add a site":
1. **Make sure you're logged in**
2. **Try the direct URL**: https://dash.cloudflare.com/
3. **Look in left sidebar** for "Websites"
4. **Refresh the page**
5. **Try a different browser**
6. **Clear browser cache**

### Alternative Access:
- **Dashboard URL**: https://dash.cloudflare.com/
- **Websites Page**: https://dash.cloudflare.com/websites
- **Add Site URL**: https://dash.cloudflare.com/?add-site

### If still can't find it:
- **Contact Cloudflare support**: https://support.cloudflare.com/
- **Use a different DNS provider** (like Porkbun or Njalla)
1. Go to https://www.namecheap.com/
2. Login to your account
3. Click **"Domain"** in top menu
4. Find `semjidkhujirt.com`
5. Click **"MANAGE"**
6. Click **"Nameservers"** tab
7. Select **"Custom DNS"**
8. **Delete any existing nameservers**
9. **Add the 2 Cloudflare nameservers** you copied
10. Click **"Save changes"**

### Phase 2: Add DNS Records in Cloudflare

#### Step 5: Go Back to Cloudflare
1. Return to Cloudflare dashboard
2. Click on `semjidkhujirt.com`
3. Click **"DNS"** in left sidebar

#### Step 6: Add TXT Record
1. Click **"Add record"**
2. Select **"TXT"** from dropdown
3. **Name**: `semjidkhujirt.com` (or leave as @)
4. **Content**: `resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c`
5. **TTL**: Auto (leave default)
6. Click **"Save"**

#### Step 7: Add MX Record
1. Click **"Add record"** again
2. Select **"MX"** from dropdown
3. **Name**: `semjidkhujirt.com` (or leave as @)
4. **Content**: `feedback-smtp.ap-northeast-1.resend.com`
5. **Priority**: 10
6. **TTL**: Auto (leave default)
7. Click **"Save"**

### Phase 3: Verify and Test

#### Step 8: Check DNS Propagation
1. Go to https://dnschecker.org/
2. Enter: `semjidkhujirt.com`
3. Check **TXT** tab - should show your verification string
4. Check **MX** tab - should show `feedback-smtp.ap-northeast-1.resend.com`

#### Step 9: Verify in Resend
1. Go to https://resend.com/domains
2. Find `semjidkhujirt.com`
3. Click **"Verify"**
4. Status should change to **"Verified"** ✅

### Phase 4: Switch Back to Namecheap (Optional)

#### Step 10: Return to Namecheap DNS
Once verified, you can switch back:
1. In Namecheap → Domain → semjidkhujirt.com → Nameservers
2. Change back to **"Namecheap BasicDNS"**
3. Add the same TXT and MX records in Namecheap's Advanced DNS
4. Delete the domain from Cloudflare

## ⏱️ Timeline

- **Cloudflare Setup**: 10 minutes
- **Nameserver Change**: 5 minutes
- **DNS Propagation**: 5-30 minutes
- **Add Records**: 5 minutes
- **Verification**: 1 minute

**Total Time**: 25-55 minutes

## 🔍 Verification Commands

Run these to check status:

```bash
# Check if domain is verified
node -e "
require('dotenv').config({path:'.env.local'});
const {Resend} = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
resend.domains.list().then(r => console.log(r.data));
"
```

## ✅ After Success

Update your email code in `src/lib/email.ts`:

```javascript
// Change this line:
to: recipientEmail, // Currently sends to admin

// To this:
to: booking.email, // Will send to actual customers!
```

## 🚨 Important Notes

- **Keep Cloudflare account** - you might need it again
- **DNS changes take time** - be patient
- **Test emails** after verification
- **You can keep using Cloudflare** if you prefer their interface

## ❓ Troubleshooting

### "Nameservers not updating"
- Wait longer (up to 48 hours, but usually 30 minutes)
- Check https://dnschecker.org/ for propagation status

### "Records not showing"
- Make sure you saved each record
- Check for typos in the values
- Try different TTL settings

### "Verification failed"
- Wait longer for DNS propagation
- Double-check record values
- Contact Resend support if needed

## 🎉 Success Checklist

- [ ] Cloudflare account created
- [ ] Domain added to Cloudflare
- [ ] Nameservers changed in Namecheap
- [ ] TXT record added in Cloudflare
- [ ] MX record added in Cloudflare
- [ ] DNS propagated (check dnschecker.org)
- [ ] Domain verified in Resend
- [ ] Email code updated
- [ ] Test booking email sent

Let me know if you get stuck at any step!