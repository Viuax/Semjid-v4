# Namecheap DNS Setup - Quick Visual Guide

## 🚨 URGENT: MX Record Type Missing?

### ❌ Current Issue: No MX Record Option
If you don't see "MX Record" in the Type dropdown, here's what to do:

## 🔧 Troubleshooting Steps

### Step 1: Double-Check Your Location
1. Go to https://www.namecheap.com/
2. **Login** to your account
3. Click **"Domain"** in the top menu
4. Find **`semjidkhujirt.com`**
5. Click **"MANAGE"** button (not "Renew" or other buttons)

### Step 2: Access the Right DNS Section
1. Look for the **"Advanced DNS"** tab
2. **NOT** "Nameservers" tab
3. **NOT** "Domain" tab
4. **NOT** "Redirect" tab
5. Click **"Advanced DNS"**

### Step 3: Check Record Types Available
In the "ADD NEW RECORD" section, you should see:
- A Record
- AAAA Record
- CNAME Record
- MX Record ← **This should be here!**
- TXT Record
- SRV Record
- URL Redirect Record

### Step 4: If MX Record is Still Missing

#### Option A: Contact Namecheap Support
- Go to https://www.namecheap.com/support/
- Search for "MX record"
- They can enable it for your domain

#### Option B: Use Different DNS Provider Temporarily
- Point nameservers to Cloudflare (free)
- Add records there
- Then switch back

#### Option C: Check Domain Status
- Make sure domain is **not expired**
- Make sure domain is **fully registered**
- Check if you have **DNS management enabled**

## 📋 Your DNS Records (Copy Exactly)

### TXT Record ✅ (Domain Verification)
```
Host: @
Type: TXT Record
Value: resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c
TTL: 300
```

### MX Record ❌ (Email Routing - MISSING!)
```
Host: @
Type: MX Record
Value: feedback-smtp.ap-northeast-1.resend.com
Priority: 10
TTL: 300
```

## 🖥️ Alternative: Use Cloudflare DNS (If Namecheap Won't Work)

### Step 1: Add Cloudflare Nameservers
In Namecheap:
1. Go to Domain → semjidkhujirt.com → Nameservers
2. Change to Custom DNS
3. Add these nameservers:
   - `emma.ns.cloudflare.com`
   - `logan.ns.cloudflare.com`

### Step 2: Add Records in Cloudflare
1. Go to https://cloudflare.com/
2. Add your domain
3. Go to DNS settings
4. Add both TXT and MX records as shown above

### Step 3: Verify in Resend
Same as before - wait and click verify.

## ❓ Why MX Record is Critical

- **TXT Record**: Proves domain ownership
- **MX Record**: Routes emails to Resend servers
- **Both Required**: Without MX, emails won't deliver

## 📞 Get Help

If MX record option is missing:
1. **Screenshot** your DNS page
2. **Contact Namecheap**: https://www.namecheap.com/support/tickets/new/
3. **Mention**: "MX record type not available in Advanced DNS"
4. **Ask them to enable** MX record support

## ⏱️ Quick Fix Timeline

- **Contact Support**: 5 minutes
- **Support Response**: 1-24 hours
- **Add Records**: 5 minutes
- **DNS Propagation**: 5-30 minutes
- **Verification**: 1 minute

**Total**: 15 minutes - 24 hours