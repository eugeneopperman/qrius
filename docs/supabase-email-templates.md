# Supabase Auth Email Templates — Branded

## Step 1: Configure Custom SMTP

Go to **Supabase Dashboard → Project Settings → Authentication → SMTP Settings**

Toggle "Enable Custom SMTP" ON, then enter:

| Field | Value |
|-------|-------|
| **Sender email** | `noreply@qriuscodes.com` |
| **Sender name** | `Qrius Codes` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | *(your RESEND_API_KEY — the `re_` value)* |
| **Minimum interval** | `60` seconds |

Click **Save**.

---

## Step 2: Paste Branded Templates

Go to **Supabase Dashboard → Authentication → Email Templates**

For each template type below, paste the HTML into the "Body" field.

---

### Confirm Signup

**Subject:** `Confirm your email — Qrius Codes`

```html
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">

<!-- Header -->
<div style="text-align:center;margin-bottom:32px">
<img src="https://qriuscodes.com/icon.svg" alt="Qrius Codes" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1A1A1A;vertical-align:middle">Qrius Codes</span>
</div>

<!-- Body -->
<div style="background-color:#FFFFFF;border:1px solid #E8E6E3;border-radius:12px;padding:32px">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Confirm your email</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
Thanks for signing up for Qrius Codes! Click the button below to confirm your email address and start creating QR codes.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Confirm email</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
If you didn't create an account with Qrius Codes, you can safely ignore this email.
</p>
</div>

<!-- Footer -->
<div style="text-align:center;margin-top:32px">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:#4A4A4A;margin:0 0 16px">Stay qrius.</p>
<hr style="border:none;border-top:1px solid #E8E6E3;margin:16px 0">
<p style="font-size:12px;color:#4A4A4A;margin:0">© 2026 Qrius Codes. All rights reserved.</p>
</div>

</div>
</body>
</html>
```

---

### Invite User

**Subject:** `You've been invited to Qrius Codes`

```html
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">

<div style="text-align:center;margin-bottom:32px">
<img src="https://qriuscodes.com/icon.svg" alt="Qrius Codes" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1A1A1A;vertical-align:middle">Qrius Codes</span>
</div>

<div style="background-color:#FFFFFF;border:1px solid #E8E6E3;border-radius:12px;padding:32px">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">You've been invited!</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
You've been invited to join Qrius Codes. Click the button below to accept and set up your account.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Accept invitation</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
If you weren't expecting this invitation, you can safely ignore this email.
</p>
</div>

<div style="text-align:center;margin-top:32px">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:#4A4A4A;margin:0 0 16px">Stay qrius.</p>
<hr style="border:none;border-top:1px solid #E8E6E3;margin:16px 0">
<p style="font-size:12px;color:#4A4A4A;margin:0">© 2026 Qrius Codes. All rights reserved.</p>
</div>

</div>
</body>
</html>
```

---

### Magic Link

**Subject:** `Your sign-in link — Qrius Codes`

```html
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">

<div style="text-align:center;margin-bottom:32px">
<img src="https://qriuscodes.com/icon.svg" alt="Qrius Codes" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1A1A1A;vertical-align:middle">Qrius Codes</span>
</div>

<div style="background-color:#FFFFFF;border:1px solid #E8E6E3;border-radius:12px;padding:32px">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Sign in to Qrius Codes</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
Click the button below to sign in. This link expires in 24 hours and can only be used once.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Sign in</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
If you didn't request this link, you can safely ignore this email. Your account is secure.
</p>
</div>

<div style="text-align:center;margin-top:32px">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:#4A4A4A;margin:0 0 16px">Stay qrius.</p>
<hr style="border:none;border-top:1px solid #E8E6E3;margin:16px 0">
<p style="font-size:12px;color:#4A4A4A;margin:0">© 2026 Qrius Codes. All rights reserved.</p>
</div>

</div>
</body>
</html>
```

---

### Change Email Address

**Subject:** `Confirm your new email — Qrius Codes`

```html
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">

<div style="text-align:center;margin-bottom:32px">
<img src="https://qriuscodes.com/icon.svg" alt="Qrius Codes" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1A1A1A;vertical-align:middle">Qrius Codes</span>
</div>

<div style="background-color:#FFFFFF;border:1px solid #E8E6E3;border-radius:12px;padding:32px">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Confirm your new email</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
Click the button below to confirm changing your email address to this one.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Confirm new email</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
If you didn't request this change, please contact support immediately.
</p>
</div>

<div style="text-align:center;margin-top:32px">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:#4A4A4A;margin:0 0 16px">Stay qrius.</p>
<hr style="border:none;border-top:1px solid #E8E6E3;margin:16px 0">
<p style="font-size:12px;color:#4A4A4A;margin:0">© 2026 Qrius Codes. All rights reserved.</p>
</div>

</div>
</body>
</html>
```

---

### Reset Password

**Subject:** `Reset your password — Qrius Codes`

```html
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">

<div style="text-align:center;margin-bottom:32px">
<img src="https://qriuscodes.com/icon.svg" alt="Qrius Codes" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1A1A1A;vertical-align:middle">Qrius Codes</span>
</div>

<div style="background-color:#FFFFFF;border:1px solid #E8E6E3;border-radius:12px;padding:32px">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Reset your password</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
We received a request to reset your password. Click the button below to choose a new one.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Reset password</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
</p>
</div>

<div style="text-align:center;margin-top:32px">
<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:#4A4A4A;margin:0 0 16px">Stay qrius.</p>
<hr style="border:none;border-top:1px solid #E8E6E3;margin:16px 0">
<p style="font-size:12px;color:#4A4A4A;margin:0">© 2026 Qrius Codes. All rights reserved.</p>
</div>

</div>
</body>
</html>
```
