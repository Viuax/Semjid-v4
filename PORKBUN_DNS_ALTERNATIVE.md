# Porkbun DNS Alternative - Simple MX Record Support

## 🎯 Quick Alternative: Use Porkbun Instead of Cloudflare

Since Cloudflare interface is confusing, let's use **Porkbun** - they definitely support MX records and have a simple interface.

## 📋 Required Records (Copy These!)

### TXT Record
```
Type: TXT
Host: semjidkhujirt.com
Answer: resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c
TTL: 600
```

### MX Record
```
Type: MX
Host: semjidkhujirt.com
Answer: feedback-smtp.ap-northeast-1.resend.com
Priority: 10
TTL: 600
```

## 🖥️ Step-by-Step Instructions (Updated Interface)

### Step 1: Sign up for Porkbun
1. Go to https://porkbun.com/
2. Click **"Get Started"** or **"Sign Up"** (usually in top right)
3. Create account with email
4. Verify email
5. Login to dashboard

### Step 2: Find the Add Domain Field
After logging in, you should see the Porkbun dashboard:

#### Option A: If you see "Domains" section
1. Look for **"Domains"** in the left sidebar or top menu
2. Click on **"Domains"**
3. Look for **"Add Domain"** button or **"+" icon**
4. Click it to see the domain input field

#### Option B: If you see main dashboard
1. Look for a **search bar** or **"Add a domain"** text field
2. It might say **"Enter a domain name"** or **"Add domain to DNS"**
3. The field might be labeled **"Domain"** or **"Domain Name"**

#### Option C: Direct URL
- Try: https://porkbun.com/account/domains
- Or: https://porkbun.com/account

### Step 3: Add Your Domain
1. In the domain field, enter: `semjidkhujirt.com`
2. Click **"Add Domain"** or **"Add"** button
3. Porkbun will add it for DNS management (you keep registration at Namecheap)

### Step 4: Confirm Domain Addition
1. You should see `semjidkhujirt.com` in your domains list
2. Click on it to manage DNS

## 🔍 Troubleshooting "Add Domain" Field

### If you can't find the domain input field:
1. **Make sure you're logged in**
2. **Try these URLs**:
   - https://porkbun.com/account/domains
   - https://porkbun.com/account
   - https://porkbun.com/domains
3. **Look for**:
   - "Add Domain" button
   - "Add a domain" text field
   - "Enter domain name" input
   - "+" icon next to Domains

### If domain field is missing:
- **Refresh the page**
- **Try incognito mode**
- **Clear browser cache**
- **Contact Porkbun support** (they have live chat)

### Alternative: Use their API
If web interface isn't working, you can use their API, but web interface should work.
1. Porkbun will offer to transfer your domain from Namecheap
2. This costs ~$10-15 but gives you full control
3. **OR** just use their DNS without transferring

### Step 4: Get Porkbun Nameservers
1. In Porkbun, go to **"Domains"** → `semjidkhujirt.com`
2. Click **"DNS & Registrant"** tab
3. You'll see **2 nameservers** (like `macele.porkbun.com`)
4. **Copy both nameservers**

### Step 5: Change Nameservers in Namecheap
1. Go to https://www.namecheap.com/
2. Login → **"Domain"** → `semjidkhujirt.com` → **"MANAGE"**
3. Click **"Nameservers"** tab
4. Select **"Custom DNS"**
5. **Delete existing nameservers**
6. **Add the 2 Porkbun nameservers**
7. Click **"Save changes"**

### Step 6: Add DNS Records in Porkbun
1. Back in Porkbun → **"Domains"** → `semjidkhujirt.com`
2. Click **"DNS & Registrant"** tab
3. Click **"Add"** button

#### Add TXT Record:
1. **Type**: TXT
2. **Host**: Leave blank (or @)
3. **Answer**: `resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c`
4. **TTL**: 600
5. Click **"Add"**

#### Add MX Record:
1. Click **"Add"** again
2. **Type**: MX
3. **Host**: Leave blank (or @)
4. **Answer**: `feedback-smtp.ap-northeast-1.resend.com`
5. **Priority**: 10
6. **TTL**: 600
7. Click **"Add"**

### Step 7: Verify DNS Propagation
1. Go to https://dnschecker.org/
2. Enter: `semjidkhujirt.com`
3. Check **TXT** and **MX** tabs
4. Should show your records

### Step 8: Verify in Resend
1. Go to https://resend.com/domains
2. Click **"Verify"** next to `semjidkhujirt.com`
3. Should show **"Verified"**

## ✅ After Success

Update `src/lib/email.ts`:

```javascript
// Change this:
to: recipientEmail, // Sends to admin only

// To this:
to: booking.email, // Sends to actual customers!
```

## ⏱️ Timeline

- **Porkbun Setup**: 5 minutes
- **Domain Addition**: 2 minutes
- **Nameserver Change**: 2 minutes
- **DNS Propagation**: 5-30 minutes
- **Record Addition**: 3 minutes
- **Verification**: 1 minute

**Total**: 18-43 minutes

## 🔍 Why Porkbun?

- ✅ **Definitely supports MX records**
- ✅ **Simple, clear interface**
- ✅ **No confusing buttons**
- ✅ **Good customer support**
- ✅ **Accepts various payment methods**

## 🚨 Important Notes

- **Keep Porkbun account** - great DNS provider
- **Domain transfer is optional** - you can just use their DNS
- **Test emails** after verification

## ❓ Troubleshooting

### "Domain not found"
- Make sure you typed `semjidkhujirt.com` correctly
- Try without "www" prefix

### "Nameservers not updating"
- Wait longer (up to 48 hours)
- Check https://dnschecker.org/

### "Records not saving"
- Double-check the values
- Make sure TTL is 600

Let me know if you need help with any step!