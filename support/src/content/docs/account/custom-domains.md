---
title: Custom Domains
description: Use your own domain for branded QR code short URLs.
sidebar:
  order: 4
---

By default, Qrius QR codes redirect through a short URL like `qrslnk.com/abc123`. But what if you want your brand on the redirect?

**Custom domains** let you use your own domain — like `scan.mycompany.com` — instead of our default. Your QR codes still work exactly the same way, but the redirect URL carries your branding.

## What Custom Domains Do

When someone scans a QR code, they're actually scanning a short link that redirects to your destination. With a custom domain, that short link uses *your* domain instead of ours.

**Without custom domain:**
- QR encodes: `qrslnk.com/xyz789`
- User scans → gets redirected → reaches your destination

**With custom domain:**
- QR encodes: `scan.mycompany.com/xyz789`
- User scans → gets redirected → reaches your destination

The experience is identical. But if a user checks their browser address bar, they see *your* domain, not ours. It feels more professional and builds trust.

## Plan Availability

Custom domains are available on:

| Plan | Domains | Details |
| --- | --- | --- |
| **Free** | 0 | Not available |
| **Starter** | 0 | Not available |
| **Pro** | 1 | One custom domain per organization |
| **Business** | Unlimited | Add as many as you need |

Upgrade to Pro or Business to unlock custom domains.

## Setting Up a Custom Domain

### Step 1: Add Your Domain

1. Go to **Settings** → **Domains** tab
2. Click **Add Custom Domain**
3. Enter your domain (e.g., `scan.mycompany.com`)
4. Click **Next**

### Step 2: Verify DNS

Qrius will show you a DNS CNAME record to add. It looks like:

```
Name: scan
Type: CNAME
Value: cname.vercel-dns.com
```

Go to your domain registrar (GoDaddy, Namecheap, AWS Route 53, etc.) and add this CNAME record.

**Important:** You need DNS access for your domain. If you don't have it, ask your IT team.

### Step 3: Verification & Activation

1. Return to Qrius and click **Verify Domain**
2. Qrius checks your DNS records
3. Once verified, the domain is active immediately

DNS propagation can take a few minutes to a few hours globally. Until then, some scans might still hit the old default domain. That's normal — be patient.

## Managing Your Domains

On the **Domains** page, you can:

- **View all domains** — see which ones are verified and active
- **Edit domain** — change which domain is your primary
- **Delete domain** — remove a domain (unverified domains can be deleted instantly)

When you delete a domain, QR codes that used it will fall back to the default domain. Existing scans aren't affected — the redirect still works.

## Best Practices

1. **Use a subdomain** — `scan.mycompany.com` is better than pointing your root `mycompany.com` to Qrius
2. **Keep it short** — `scan.co` or `go.mycompany.com` are memorable
3. **Use one primary domain** — don't bounce between multiple domains in your campaigns; pick one and stick with it
4. **Verify before launching** — test a few QR codes after verification before running a big campaign
5. **Document your setup** — keep track of which domain is for which campaign (especially if you have multiple organizations)

## How It Affects Existing QR Codes

When you add a custom domain:

- **New QR codes** use your custom domain by default
- **Existing QR codes** keep their old short URL (they still work fine; nothing breaks)
- **Optional update** — if you want old codes to use your new domain, you can regenerate them (they'll get new short codes)

So adding a domain is non-destructive. Your old campaigns keep working.

## Troubleshooting

**"Domain verification failed"**
- Double-check your CNAME record in your DNS provider
- Wait a few minutes — DNS can take time to propagate
- Make sure you're pointing the right subdomain (e.g., `scan`, not `scan.mycompany.com`)

**"My QR codes still use the old domain"**
- Existing codes keep their old URLs (that's by design)
- New codes you create will use your custom domain
- If you really need old codes on the new domain, regenerate them (they'll get new short codes)

**"I don't have DNS access"**
- Ask your IT or web team to add the CNAME record
- Some registrars (like Shopify or Wix) manage DNS for you

**"I want to remove the custom domain"**
- Delete it from the Domains page
- QR codes fall back to the default domain
- Existing scans still work

---

**Ready to brand your QR codes?** Start by upgrading to Pro or Business, then head to Settings → Domains to add your first custom domain.
