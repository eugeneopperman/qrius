---
title: Team Management
description: Invite team members and manage roles in your organization.
sidebar:
  order: 2
---

Qrius supports team collaboration. Invite your coworkers, assign roles, and work together on QR code campaigns without sharing login credentials.

## Organizations vs Teams

In Qrius, an **organization** is your workspace. It can be your company, a department, a project team, or a client.

Each organization has:
- Its own QR codes
- Its own members with specific roles
- Shared brand templates
- Shared settings

You can create and belong to multiple organizations. Switch between them in the sidebar dropdown.

## Inviting Team Members

To add someone to your organization:

1. Go to **Settings** → **Team** tab
2. Click **Invite Member**
3. Enter their email address
4. Select their role (see below for what each role can do)
5. Click **Send Invite**

They'll receive an email with a link to accept. Once they accept, they'll have access to your organization's QR codes and resources.

## Roles & Permissions

Every team member has a role that defines what they can do:

### Owner
- Full control: create, edit, delete QR codes
- Manage team members and invitations
- Change organization settings, billing, API keys
- Delete the organization

Only one owner per organization. If you need to transfer ownership, contact support.

### Admin
- Create, edit, delete QR codes
- Manage team members and invitations
- Change organization settings
- Cannot change billing or delete the organization

Perfect for team leads who need control over QR codes but shouldn't touch billing.

### Editor
- Create, edit, delete QR codes
- View team members list
- Cannot invite members or change settings

Great for marketing and operations folks creating and managing campaigns.

### Viewer
- View all QR codes and analytics
- View team members list
- Cannot create or edit QR codes

Perfect for stakeholders, managers, or clients who need visibility but shouldn't make changes.

## Team Size Limits by Plan

Different plans support different team sizes:

| Plan | Max Team Members |
| --- | --- |
| **Free** | 1 (just you) |
| **Starter** | 1 (just you) |
| **Pro** | 5 |
| **Business** | 25 |

If you're on a Free or Starter plan, you can't invite team members yet. Upgrade to Pro or Business to unlock collaboration.

Want to add more than 25 people? Contact us — we can work something out.

## Removing Team Members

If someone leaves your team or you want to revoke access:

1. Go to **Settings** → **Team**
2. Find the member in the list
3. Click the remove icon (trash) next to their name
4. Confirm deletion

They'll lose access to your organization immediately. QR codes they created remain in the organization (they won't be deleted).

## Pending Invitations

Sent an invite that hasn't been accepted yet? You'll see it in the Pending section:

- **Resend** — send another copy of the invite email
- **Revoke** — cancel the invitation (they can no longer accept it)

Invitations expire after 7 days if not accepted.

## Organization Settings

As an Owner or Admin, you can manage:

- **Organization Name** — the name shown in your sidebar
- **Organization Slug** — a URL-friendly identifier (used in some integrations)
- **Billing** — payment method and plan upgrades (Owner only)
- **API Keys** — for programmatic access (Owner/Admin; available on Pro+)

## Switching Organizations

If you belong to multiple organizations, switch between them:

1. Click the organization name in the sidebar
2. Select the one you want to switch to

Your QR codes, settings, and team context change instantly. Handy if you manage accounts for multiple clients or departments.

## Best Practices

1. **Use descriptive organization names** — "Acme Corp Marketing" is clearer than "Team 1"
2. **Start small with roles** — give people the minimum permissions they need
3. **Remove inactive members** — reduce clutter and security surface area
4. **Rotate ownership** — if you're the only owner and you leave, your team is stuck. Document who can step in.
5. **Check team members regularly** — quarterly reviews help spot unused accounts

---

**Next step:** Need to automate QR code creation? Check out [API Keys](/docs/account/api-keys) to learn how to set up programmatic access (Pro and Business plans only).
