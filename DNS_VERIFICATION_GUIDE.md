# DNS Verification Guide for Resend (Namecheap)

## ✅ Current Status
- **Domain Added**: semjidkhujirt.com
- **Status**: Not Started (needs DNS verification)
- **Domain ID**: 8e12d2d5-9e6f-4246-b200-584ee08f9e2c

## Step 1: Add DNS Records to Namecheap

### TXT Record (Domain Ownership Verification)
```
Host: @
Type: TXT
Value: resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c
TTL: 300
```

### MX Record (Email Routing)
```
Host: @
Type: MX
Value: feedback-smtp.ap-northeast-1.resend.com
Priority: 10
TTL: 300
```

## Step 2: Add Records in Namecheap Dashboard

1. **Login to Namecheap**: https://www.namecheap.com/
2. **Go to Domain List**: Click "Domain" in top menu
3. **Find your domain**: semjidkhujirt.com
4. **Click "Manage"** next to your domain

5. **Go to Advanced DNS**:
   - Click "Advanced DNS" tab
   - You'll see existing records

6. **Add TXT Record**:
   - Click "ADD NEW RECORD"
   - **Type**: TXT Record
   - **Host**: @ (leave blank)
   - **Value**: `resend-domain-verification=8e12d2d5-9e6f-4246-b200-584ee08f9e2c`
   - **TTL**: 300
   - Click the ✓ (checkmark) to save

7. **Add MX Record**:
   - Click "ADD NEW RECORD" again
   - **Type**: MX Record
   - **Host**: @ (leave blank)
   - **Value**: `feedback-smtp.ap-northeast-1.resend.com`
   - **Priority**: 10
   - **TTL**: 300
   - Click the ✓ (checkmark) to save

## Step 3: Verify in Resend

1. **Go to Resend**: https://resend.com/domains
2. **Find your domain**: semjidkhujirt.com
3. **Click "Verify"**
4. **Wait 5-30 minutes** for DNS propagation
5. **Status should change to "Verified"**

## Step 4: Update Email Code

Once verified, update `src/lib/email.ts`:

```javascript
// Change from:
from: "Сэмжид Хужирт Захиалга <booking@resend.dev>",
to: recipientEmail, // Only admin email works

// To:
from: "Сэмжид Хужирт Захиалга <booking@semjidkhujirt.com>",
to: booking.email, // Now works for customers!
```

## Troubleshooting

### Check DNS Propagation
```bash
# Check TXT record
nslookup -type=TXT semjidkhujirt.com

# Check MX record
nslookup -type=MX semjidkhujirt.com
```

### Common Issues
- **"Record not found"**: Wait longer (up to 30 minutes)
- **"Invalid record"**: Double-check the values exactly
- **Namecheap caching**: Try refreshing the page

### Still Having Issues?
- Contact Namecheap support for DNS issues
- Contact Resend support: https://resend.com/support
- Check domain ownership in Namecheap