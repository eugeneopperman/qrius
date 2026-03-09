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

For each template type below, paste the **Subject** and **Body** (HTML).

---

### Confirm Signup

**Subject:** `Confirm your email — Qrius Codes`

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
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">One quick step — confirm your email.</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 16px">
You just signed up for Qrius Codes. Click below to confirm your email and start creating beautiful, trackable QR codes.
</p>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
It takes about 30 seconds to make your first one.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Confirm email</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
Didn't sign up for Qrius Codes? No worries — just ignore this email and nothing happens.
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

### Invite User

**Subject:** `You've got a seat — join Qrius Codes`

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
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Someone wants you on the team.</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
You've been invited to join a team on Qrius Codes — where you can create, customize, and track QR codes together. Click below to accept and set up your account.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Accept and join</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
Wasn't expecting this? Just ignore the email — no account gets created unless you click.
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
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Here's your sign-in link.</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
Click below to sign in to Qrius Codes. This link is single-use and expires in 24 hours — no password needed.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Sign in</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
Didn't request this? Your account is safe — just ignore this email.
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
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Confirm your new email address.</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
You asked to change the email on your Qrius Codes account to this address. Click below to confirm — once you do, this becomes your new login.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Confirm new email</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
Didn't request this change? Your current email stays in place. If you're concerned, update your password from Settings.
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
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Let's get you back in.</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
Someone (hopefully you) requested a password reset for your Qrius Codes account. Click below to choose a new password.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Reset password</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
Didn't ask for this? Your password stays the same — just ignore this email.
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

### Reauthentication

**Subject:** `Confirm it's you — Qrius Codes`

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
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1A1A1A;margin:0 0 16px">Quick security check.</h1>

<p style="font-size:16px;color:#4A4A4A;line-height:1.6;margin:0 0 24px">
You're trying to do something sensitive on your Qrius Codes account — like changing your email or password. Click below to confirm it's really you.
</p>

<div style="text-align:center;margin:24px 0">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;padding:14px 28px">Confirm it's me</a>
</div>

<p style="font-size:13px;color:#4A4A4A;line-height:1.6;margin:16px 0 0">
Didn't trigger this? Someone may be trying to access your account. Change your password from Settings right away.
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
