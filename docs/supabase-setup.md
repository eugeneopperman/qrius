# Supabase Production Setup Guide

This guide walks through setting up a production Supabase project for Qrius.

## Table of Contents

1. [Create Supabase Project](#1-create-supabase-project)
2. [Run Database Migrations](#2-run-database-migrations)
3. [Configure Authentication](#3-configure-authentication)
4. [Set Up Google OAuth](#4-set-up-google-oauth)
5. [Configure Email Templates](#5-configure-email-templates)
6. [Environment Variables](#6-environment-variables)
7. [Verify Setup](#7-verify-setup)

---

## 1. Create Supabase Project

### Step 1.1: Create Account/Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **New Project**
4. Fill in project details:
   - **Name**: `qrius-production` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `us-east-1` for US)
   - **Pricing Plan**: Free tier works initially, Pro recommended for production
5. Click **Create new project**
6. Wait 2-3 minutes for project provisioning

### Step 1.2: Get Project Credentials
1. Go to **Project Settings** → **API**
2. Note down these values:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIs...` (safe for frontend)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIs...` (keep secret!)

---

## 2. Run Database Migrations

### Step 2.1: Open SQL Editor
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**

### Step 2.2: Run Base Schema
1. Copy contents of `api/schema.sql`
2. Paste into SQL Editor
3. Click **Run** (or Cmd/Ctrl + Enter)
4. Verify: "Success. No rows returned"

### Step 2.3: Run SaaS Schema
1. Create new query
2. Copy contents of `api/schema-saas.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify: "Success. No rows returned"

### Step 2.4: Verify Tables Created
Go to **Table Editor** and confirm these tables exist:
- `users`
- `organizations`
- `organization_members`
- `organization_invitations`
- `api_keys`
- `subscriptions`
- `usage_records`
- `qr_codes`
- `scan_events`
- `plan_limits`

### Step 2.5: Verify Plan Limits
```sql
SELECT * FROM plan_limits;
```
Should return 3 rows: free, pro, business

---

## 3. Configure Authentication

### Step 3.1: General Settings
1. Go to **Authentication** → **Providers**
2. Verify **Email** is enabled (should be by default)

### Step 3.2: Auth Settings
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-domain.com` (or Vercel URL for now)
3. Add **Redirect URLs**:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/auth/reset-password
   http://localhost:5173/auth/callback (for local dev)
   http://localhost:5173/auth/reset-password (for local dev)
   ```

### Step 3.3: Email Settings (Optional but Recommended)
1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

For production, consider using a custom SMTP provider:
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable custom SMTP and configure:
   - **Sender email**: `noreply@your-domain.com`
   - **Sender name**: `Qrius`
   - **Host**: Your SMTP host (e.g., smtp.resend.com)
   - **Port**: 587
   - **Username/Password**: Your SMTP credentials

---

## 4. Set Up Google OAuth

### Step 4.1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type
5. Fill in app information:
   - **App name**: Qrius
   - **User support email**: your email
   - **Developer contact**: your email
6. Add scopes: `email`, `profile`, `openid`
7. Save and continue through remaining steps

### Step 4.2: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Qrius Production
   - **Authorized JavaScript origins**:
     ```
     https://your-domain.com
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
5. Click **Create**
6. Save the **Client ID** and **Client Secret**

### Step 4.3: Configure in Supabase
1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Enter:
   - **Client ID**: From Google Console
   - **Client Secret**: From Google Console
5. Save

---

## 5. Configure Email Templates

### Step 5.1: Confirmation Email
Go to **Authentication** → **Email Templates** → **Confirm signup**

```html
<h2>Welcome to Qrius!</h2>

<p>Thanks for signing up. Please confirm your email address by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm my email</a></p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>– The Qrius Team</p>
```

### Step 5.2: Password Reset Email
Go to **Authentication** → **Email Templates** → **Reset password**

```html
<h2>Reset your password</h2>

<p>We received a request to reset your Qrius password. Click the link below to choose a new password:</p>

<p><a href="{{ .ConfirmationURL }}">Reset my password</a></p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>

<p>– The Qrius Team</p>
```

### Step 5.3: Magic Link Email (if using)
```html
<h2>Your sign-in link</h2>

<p>Click the link below to sign in to Qrius:</p>

<p><a href="{{ .ConfirmationURL }}">Sign in to Qrius</a></p>

<p>This link will expire in 10 minutes.</p>

<p>– The Qrius Team</p>
```

---

## 6. Environment Variables

### Step 6.1: Local Development (.env.local)
Create/update `.env.local` in the project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Server-side only (for API routes)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Step 6.2: Vercel Environment Variables
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following for **Production** environment:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://[project-ref].supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |

**Important**: The service role key should only be added as a secret and never exposed to the frontend.

---

## 7. Verify Setup

### Step 7.1: Test User Signup
1. Start your local dev server: `npm run dev`
2. Go to `http://localhost:5173/signup`
3. Create a test account
4. Check Supabase **Authentication** → **Users** for new user
5. Check **Table Editor** → `users` for profile
6. Check `organizations` for auto-created personal workspace
7. Check `organization_members` for owner membership

### Step 7.2: Test Google OAuth
1. Go to `http://localhost:5173/signin`
2. Click "Sign in with Google"
3. Complete Google flow
4. Verify user created in Supabase

### Step 7.3: Test RLS Policies
In SQL Editor, run:
```sql
-- This should return the test user's data only when authenticated
SELECT * FROM users;

-- This should return the user's organization
SELECT * FROM organizations;

-- This should return the user's membership
SELECT * FROM organization_members;
```

### Step 7.4: Test Password Reset
1. Go to `http://localhost:5173/signin`
2. Click "Forgot password?"
3. Enter test email
4. Check email for reset link
5. Complete password reset

---

## Troubleshooting

### User not created in `users` table
- Check if the `handle_new_user` trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Check Supabase logs: **Database** → **Logs**

### OAuth redirect not working
- Verify redirect URLs match exactly in both Google Console and Supabase
- Check browser console for errors
- Ensure Site URL is set correctly in Supabase

### RLS policies blocking queries
- For debugging, temporarily run as service role:
  ```sql
  SET ROLE service_role;
  SELECT * FROM users;
  ```
- Check if `auth.uid()` is returning expected value

### Email not sending
- Check **Logs** → **Auth logs** for errors
- Verify SMTP settings if using custom provider
- Check spam folder

---

## Security Checklist

Before going live, verify:

- [ ] Service role key is NOT exposed in frontend code
- [ ] All RLS policies are enabled and tested
- [ ] Production Site URL is set correctly
- [ ] Test accounts are removed
- [ ] Database password is strong and stored securely
- [ ] Two-factor auth enabled on Supabase account
- [ ] Backup configured (Pro plan)

---

## Next Steps

After Supabase is configured:

1. **Configure Stripe** - See `docs/STRIPE-SETUP.md` (coming soon)
2. **Set up Upstash Redis** - For redirect caching
3. **Configure custom domain** - In Vercel
4. **Set up error monitoring** - Sentry integration
