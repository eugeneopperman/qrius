---
title: API Keys
description: Generate and manage API keys for programmatic QR code creation.
sidebar:
  order: 3
---

If you need to create QR codes programmatically — from your own app, automation scripts, or backend services — you'll need an API key.

## Who Can Use the API?

API access is available on:

- **Pro plan** — up to 1,000 API requests per day
- **Business plan** — up to 10,000 API requests per day

Free and Starter users can't access the API. If you need it, upgrade your plan.

## Generating an API Key

To create a new API key:

1. Go to **Settings** → **API Keys** tab
2. Click **Generate New Key**
3. Give it a descriptive name (e.g., "Mobile App", "Internal Automation", "Client Portal")
4. Click **Create**

Qrius will display your new key exactly once. **Copy it immediately and save it somewhere safe.** We don't store the plain-text key, so you can't retrieve it later.

If you lose it, you'll need to delete and regenerate a new one.

## Storing Your Key Safely

Your API key is like a password. Treat it with care:

- **Don't commit it to version control** — use environment variables or secrets management tools instead
- **Rotate regularly** — delete old unused keys every few months
- **Use key names to track usage** — "Legacy Mobile App" tells you it might be outdated
- **One key per service** — if you have an iOS app, Android app, and backend service, create three separate keys. If one gets compromised, you only revoke that one.

## Using Your API Key

In your API requests, include your key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

For example:

```bash
curl -X POST https://qriuscodes.com/api/qr-codes \
  -H "Authorization: Bearer sk_live_abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{
    "qr_type": "url",
    "destination_url": "https://example.com",
    "name": "My QR Code"
  }'
```

We'll handle authentication and return your QR code data.

## Rate Limits

Every API request counts toward your daily quota:

| Plan | Daily Limit |
| --- | --- |
| **Pro** | 1,000 requests/day |
| **Business** | 10,000 requests/day |

Limits reset at midnight UTC.

If you exceed your daily limit, new requests will return a `429 Too Many Requests` error. Wait until the next day, or upgrade to a higher plan.

Need more? Contact us — we can discuss custom limits for high-volume use cases.

## Managing Your Keys

On the **API Keys** page, you can:

- **View key name and creation date** — last four characters shown for verification
- **Delete a key** — instantly revokes access (can't be undone)
- **Regenerate a key** — creates a new key with the same name (old one stops working)

Keep your list clean. Delete keys you're no longer using.

## Common Use Cases

### Bulk QR Code Creation
Create hundreds of QR codes at once from a spreadsheet or database:

```javascript
const urls = ['https://example.com/1', 'https://example.com/2', ...];
for (const url of urls) {
  await fetch('https://qriuscodes.com/api/qr-codes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      qr_type: 'url',
      destination_url: url,
      name: `Product ${url}`
    })
  });
}
```

### Embed QR Generation in Your App
Let your users generate QR codes without leaving your application.

### Automation & Webhooks
Create QR codes automatically when certain events happen (new product launched, new customer signed up, etc.).

## API Documentation

For detailed endpoint specifications, parameters, and response formats, visit our [API docs](https://qriuscodes.com/api/docs) (or see your Qrius account).

## Troubleshooting

**"Unauthorized" error?**
- Check that your key is correct (no extra spaces)
- Make sure you're using the full key, not just the last four characters
- Verify the key hasn't been deleted

**"Rate limit exceeded" error?**
- You've hit your daily quota
- Upgrade to a higher plan or wait until tomorrow
- Batch your requests more efficiently

**Key not working after regeneration?**
- The old key is instantly disabled
- Update your code to use the new key
- Restart any services that cache the key

---

**Need more help?** Check out [Team Management](/docs/account/team-management) to learn about org permissions, or contact our support team.
