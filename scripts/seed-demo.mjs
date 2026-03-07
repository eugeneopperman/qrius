#!/usr/bin/env node
/**
 * Seed a demo account with realistic QR codes and scan data.
 *
 * Prerequisites:
 *   - .env.local with VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, POSTGRES_URL
 *
 * Usage:
 *   node scripts/seed-demo.mjs
 *
 * What it does:
 *   1. Creates a demo user in Supabase Auth (or reuses existing)
 *   2. Ensures user profile + org + membership exist in Supabase
 *   3. Inserts 12 QR codes (varied types & styles) into Neon
 *   4. Inserts ~2,500 realistic scan events spread over 90 days
 */

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// ── Load env ──────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local — rely on process env */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!POSTGRES_URL) {
  console.error('Missing POSTGRES_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const sql = neon(POSTGRES_URL);

// ── Config ────────────────────────────────────────────────────────
const DEMO_EMAIL = 'demo@qriuscodes.com';
const DEMO_PASSWORD = 'DemoPass123!';
const DEMO_NAME = 'Demo User';
const ORG_NAME = "Demo User's Workspace";

// ── Helpers ───────────────────────────────────────────────────────
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
function shortCode() {
  let c = '';
  const r = crypto.getRandomValues(new Uint8Array(6));
  for (let i = 0; i < 6; i++) c += ALPHABET[r[i] % ALPHABET.length];
  return c;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomBetween(6, 23), randomBetween(0, 59), randomBetween(0, 59));
  return d.toISOString();
}

// ── Step 1: Create / find demo user ───────────────────────────────
console.log('1. Creating demo user in Supabase Auth...');

let userId;

// Check if user already exists
const { data: existingUsers } = await supabase.auth.admin.listUsers();
const existing = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

if (existing) {
  userId = existing.id;
  console.log(`   User already exists: ${userId}`);
} else {
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: DEMO_NAME, terms_accepted_at: new Date().toISOString(), terms_version: '1.0' },
  });
  if (error) {
    console.error('   Failed to create user:', error.message);
    process.exit(1);
  }
  userId = newUser.user.id;
  console.log(`   Created user: ${userId}`);
}

// ── Step 2: Ensure profile + org in Supabase ──────────────────────
console.log('2. Ensuring user profile & organization in Supabase...');

// The handle_new_user trigger should have created these, but let's verify
const { data: profile } = await supabase
  .from('users')
  .select('id')
  .eq('id', userId)
  .single();

if (!profile) {
  console.log('   Creating user profile...');
  await supabase.from('users').insert({
    id: userId,
    email: DEMO_EMAIL,
    name: DEMO_NAME,
    display_name: DEMO_NAME,
    plan: 'pro',
    terms_accepted_at: new Date().toISOString(),
    terms_version: '1.0',
  });
} else {
  // Upgrade to Pro for demo purposes
  await supabase.from('users').update({ plan: 'pro', display_name: DEMO_NAME }).eq('id', userId);
}

// Find or create org
const { data: membership } = await supabase
  .from('organization_members')
  .select('organization_id')
  .eq('user_id', userId)
  .limit(1)
  .single();

let orgId;
if (membership) {
  orgId = membership.organization_id;
  // Upgrade org to pro
  await supabase.from('organizations').update({ plan: 'pro' }).eq('id', orgId);
  console.log(`   Org exists: ${orgId} (upgraded to Pro)`);
} else {
  orgId = crypto.randomUUID();
  const slug = 'demo-' + userId.slice(0, 8);
  await supabase.from('organizations').insert({ id: orgId, name: ORG_NAME, slug, plan: 'pro' });
  await supabase.from('organization_members').insert({ organization_id: orgId, user_id: userId, role: 'owner' });
  console.log(`   Created org: ${orgId}`);
}

// ── Step 3: Clean existing demo QR codes ──────────────────────────
console.log('3. Cleaning existing demo data in Neon...');
await sql`DELETE FROM scan_events WHERE qr_code_id IN (SELECT id FROM qr_codes WHERE user_id = ${userId})`;
await sql`DELETE FROM qr_codes WHERE user_id = ${userId}`;
console.log('   Cleaned.');

// ── Step 4: Insert QR codes ───────────────────────────────────────
console.log('4. Inserting demo QR codes...');

const qrCodes = [
  {
    name: 'Company Website',
    destination_url: 'https://acme-corp.com',
    qr_type: 'url',
    original_data: { url: 'https://acme-corp.com' },
    total_scans: 847,
    days_ago: 85,
    style: { dotsColor: '#1a1a2e', backgroundColor: '#ffffff', dotsType: 'rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'M' },
  },
  {
    name: 'Product Launch Campaign',
    destination_url: 'https://acme-corp.com/new-product',
    qr_type: 'url',
    original_data: { url: 'https://acme-corp.com/new-product' },
    total_scans: 1234,
    days_ago: 60,
    style: { dotsColor: '#f97316', backgroundColor: '#fff7ed', dotsType: 'dots', cornersSquareType: 'dot', errorCorrectionLevel: 'H', useGradient: true, gradient: { type: 'linear', colorStops: [{ offset: 0, color: '#f97316' }, { offset: 1, color: '#ea580c' }] } },
  },
  {
    name: 'Restaurant Menu',
    destination_url: 'https://acme-bistro.com/menu',
    qr_type: 'url',
    original_data: { url: 'https://acme-bistro.com/menu' },
    total_scans: 2156,
    days_ago: 75,
    style: { dotsColor: '#16a34a', backgroundColor: '#f0fdf4', dotsType: 'classy-rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'M' },
  },
  {
    name: 'Contact Card - Sarah Chen',
    destination_url: 'BEGIN:VCARD\nVERSION:3.0\nN:Chen;Sarah\nFN:Sarah Chen\nTEL:+1-555-0123\nEMAIL:sarah@acme-corp.com\nEND:VCARD',
    qr_type: 'vcard',
    original_data: { firstName: 'Sarah', lastName: 'Chen', phone: '+1-555-0123', email: 'sarah@acme-corp.com', company: 'Acme Corp', title: 'Head of Marketing' },
    total_scans: 312,
    days_ago: 50,
    style: { dotsColor: '#7c3aed', backgroundColor: '#faf5ff', dotsType: 'rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'Q' },
  },
  {
    name: 'Office WiFi',
    destination_url: 'WIFI:T:WPA;S:AcmeGuest;P:Welcome2024;;',
    qr_type: 'wifi',
    original_data: { ssid: 'AcmeGuest', password: 'Welcome2024', encryption: 'WPA' },
    total_scans: 189,
    days_ago: 40,
    style: { dotsColor: '#0284c7', backgroundColor: '#f0f9ff', dotsType: 'square', cornersSquareType: 'square', errorCorrectionLevel: 'M' },
  },
  {
    name: 'Summer Sale Email',
    destination_url: 'mailto:deals@acme-corp.com?subject=Summer%20Sale%20Inquiry',
    qr_type: 'email',
    original_data: { email: 'deals@acme-corp.com', subject: 'Summer Sale Inquiry', body: 'I saw the QR code and would like to learn more.' },
    total_scans: 95,
    days_ago: 30,
    style: { dotsColor: '#dc2626', backgroundColor: '#fef2f2', dotsType: 'dots', cornersSquareType: 'dot', errorCorrectionLevel: 'M' },
  },
  {
    name: 'Conference Booth',
    destination_url: 'https://acme-corp.com/techconf-2026',
    qr_type: 'url',
    original_data: { url: 'https://acme-corp.com/techconf-2026' },
    total_scans: 567,
    days_ago: 20,
    style: { dotsColor: '#0f172a', backgroundColor: '#f8fafc', dotsType: 'classy', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'H', useGradient: true, gradient: { type: 'radial', colorStops: [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#334155' }] } },
  },
  {
    name: 'Customer Support Line',
    destination_url: 'tel:+15550199',
    qr_type: 'phone',
    original_data: { phone: '+1-555-0199' },
    total_scans: 78,
    days_ago: 25,
    style: { dotsColor: '#059669', backgroundColor: '#ecfdf5', dotsType: 'rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'M' },
  },
  {
    name: 'Team Offsite Location',
    destination_url: 'geo:37.7749,-122.4194',
    qr_type: 'location',
    original_data: { latitude: 37.7749, longitude: -122.4194, label: 'Acme Corp HQ - San Francisco' },
    total_scans: 42,
    days_ago: 10,
    style: { dotsColor: '#d97706', backgroundColor: '#fffbeb', dotsType: 'extra-rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'M' },
  },
  {
    name: 'SMS Feedback Line',
    destination_url: 'smsto:+15550188:Rate your experience 1-5',
    qr_type: 'sms',
    original_data: { phone: '+1-555-0188', message: 'Rate your experience 1-5' },
    total_scans: 156,
    days_ago: 35,
    style: { dotsColor: '#2563eb', backgroundColor: '#eff6ff', dotsType: 'dots', cornersSquareType: 'dot', errorCorrectionLevel: 'M' },
  },
  {
    name: 'Annual Gala Invite',
    destination_url: 'BEGIN:VEVENT\nSUMMARY:Acme Annual Gala\nDTSTART:20260515T190000Z\nDTEND:20260515T230000Z\nLOCATION:Grand Ballroom, SF\nEND:VEVENT',
    qr_type: 'event',
    original_data: { title: 'Acme Annual Gala', startDate: '2026-05-15T19:00:00Z', endDate: '2026-05-15T23:00:00Z', location: 'Grand Ballroom, San Francisco' },
    total_scans: 423,
    days_ago: 45,
    style: { dotsColor: '#be185d', backgroundColor: '#fdf2f8', dotsType: 'classy-rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'Q', useGradient: true, gradient: { type: 'linear', colorStops: [{ offset: 0, color: '#be185d' }, { offset: 1, color: '#9333ea' }] } },
  },
  {
    name: 'Blog - How QR Codes Boost ROI',
    destination_url: 'https://acme-corp.com/blog/qr-codes-roi',
    qr_type: 'url',
    original_data: { url: 'https://acme-corp.com/blog/qr-codes-roi' },
    total_scans: 298,
    days_ago: 15,
    style: { dotsColor: '#1e293b', backgroundColor: '#ffffff', dotsType: 'rounded', cornersSquareType: 'extra-rounded', errorCorrectionLevel: 'M' },
  },
];

const insertedIds = [];

for (const qr of qrCodes) {
  const code = shortCode();
  const createdAt = daysAgo(qr.days_ago);
  const metadata = JSON.stringify({ style_options: qr.style });

  const result = await sql`
    INSERT INTO qr_codes (
      short_code, destination_url, qr_type, original_data,
      user_id, organization_id, name, metadata,
      status, is_active, total_scans, created_at, updated_at
    ) VALUES (
      ${code}, ${qr.destination_url}, ${qr.qr_type},
      ${JSON.stringify(qr.original_data)},
      ${userId}, ${orgId}, ${qr.name}, ${metadata},
      'active', true, ${qr.total_scans},
      ${createdAt}, ${createdAt}
    )
    RETURNING id, short_code, name
  `;
  const row = result[0];
  insertedIds.push({ id: row.id, shortCode: row.short_code, name: row.name, totalScans: qr.total_scans, daysAgo: qr.days_ago });
  console.log(`   + ${qr.name} (${code}) — ${qr.total_scans} scans`);
}

// ── Step 5: Generate scan events ──────────────────────────────────
console.log('5. Generating scan events...');

const countries = [
  { code: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco', 'Seattle', 'Austin', 'Denver', 'Miami', 'Boston'], region: 'US-CA', weight: 40 },
  { code: 'GB', cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'], region: 'GB-ENG', weight: 12 },
  { code: 'DE', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'], region: 'DE-BE', weight: 8 },
  { code: 'FR', cities: ['Paris', 'Lyon', 'Marseille'], region: 'FR-IDF', weight: 6 },
  { code: 'CA', cities: ['Toronto', 'Vancouver', 'Montreal'], region: 'CA-ON', weight: 7 },
  { code: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane'], region: 'AU-NSW', weight: 5 },
  { code: 'JP', cities: ['Tokyo', 'Osaka', 'Kyoto'], region: 'JP-13', weight: 4 },
  { code: 'BR', cities: ['Sao Paulo', 'Rio de Janeiro'], region: 'BR-SP', weight: 4 },
  { code: 'IN', cities: ['Mumbai', 'Bangalore', 'Delhi'], region: 'IN-MH', weight: 5 },
  { code: 'ZA', cities: ['Cape Town', 'Johannesburg'], region: 'ZA-WC', weight: 3 },
  { code: 'SG', cities: ['Singapore'], region: 'SG-01', weight: 3 },
  { code: 'NL', cities: ['Amsterdam', 'Rotterdam'], region: 'NL-NH', weight: 3 },
];

const devices = [
  { type: 'mobile', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', weight: 45 },
  { type: 'mobile', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.90 Mobile Safari/537.36', weight: 25 },
  { type: 'mobile', ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.90 Mobile Safari/537.36', weight: 10 },
  { type: 'desktop', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', weight: 8 },
  { type: 'desktop', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', weight: 7 },
  { type: 'tablet', ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', weight: 5 },
];

const referrers = [
  { val: null, weight: 40 },
  { val: 'https://www.google.com', weight: 15 },
  { val: 'https://www.facebook.com', weight: 8 },
  { val: 'https://www.instagram.com', weight: 7 },
  { val: 'https://www.linkedin.com', weight: 6 },
  { val: 'https://twitter.com', weight: 5 },
  { val: 'https://www.tiktok.com', weight: 4 },
  { val: 'https://www.reddit.com', weight: 3 },
  { val: 'https://mail.google.com', weight: 5 },
  { val: 'https://outlook.office.com', weight: 4 },
  { val: 'https://www.yelp.com', weight: 3 },
];

function weightedRandom(items) {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * totalWeight;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

let totalEvents = 0;
const BATCH_SIZE = 200;

for (const qr of insertedIds) {
  const events = [];
  for (let i = 0; i < qr.totalScans; i++) {
    const country = weightedRandom(countries);
    const device = weightedRandom(devices);
    const referrer = weightedRandom(referrers);

    // Spread scans across the QR code's lifetime with a ramp-up pattern
    const maxDay = qr.daysAgo;
    // More recent = more scans (exponential bias)
    const dayOffset = Math.floor(Math.pow(Math.random(), 1.5) * maxDay);
    const scanDate = new Date();
    scanDate.setDate(scanDate.getDate() - dayOffset);
    // Realistic hour distribution: peak at lunch and evening
    const hourWeights = [1,1,1,1,1,2,3,5,7,8,9,10,11,10,9,8,7,8,9,10,9,7,4,2];
    let hourRoll = Math.random() * hourWeights.reduce((a,b) => a+b, 0);
    let hour = 0;
    for (let h = 0; h < 24; h++) {
      hourRoll -= hourWeights[h];
      if (hourRoll <= 0) { hour = h; break; }
    }
    scanDate.setHours(hour, randomBetween(0, 59), randomBetween(0, 59));

    const ipHash = crypto.createHash('sha256').update(`demo-${i}-${qr.id}`).digest('hex').slice(0, 16);

    events.push({
      qr_code_id: qr.id,
      scanned_at: scanDate.toISOString(),
      country_code: country.code,
      city: randomItem(country.cities),
      region: country.region,
      device_type: device.type,
      user_agent: device.ua,
      ip_hash: ipHash,
      referrer: referrer.val,
    });
  }

  // Insert in batches
  for (let b = 0; b < events.length; b += BATCH_SIZE) {
    const batch = events.slice(b, b + BATCH_SIZE);
    const values = batch.map((e, idx) => {
      const base = idx * 9;
      return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9})`;
    }).join(', ');

    const params = batch.flatMap(e => [
      e.qr_code_id, e.scanned_at, e.country_code, e.city, e.region,
      e.device_type, e.user_agent, e.ip_hash, e.referrer,
    ]);

    await sql.query(
      `INSERT INTO scan_events (qr_code_id, scanned_at, country_code, city, region, device_type, user_agent, ip_hash, referrer)
       VALUES ${values}`,
      params
    );
    totalEvents += batch.length;
  }

  console.log(`   ${qr.name}: ${qr.totalScans} scans inserted`);
}

// ── Step 6: Update total_scans counts ─────────────────────────────
console.log('6. Syncing total_scans counts...');
await sql`
  UPDATE qr_codes SET total_scans = (
    SELECT COUNT(*) FROM scan_events WHERE scan_events.qr_code_id = qr_codes.id
  )
  WHERE user_id = ${userId}
`;

// ── Done ──────────────────────────────────────────────────────────
console.log('\n=== Demo account ready ===');
console.log(`Email:    ${DEMO_EMAIL}`);
console.log(`Password: ${DEMO_PASSWORD}`);
console.log(`User ID:  ${userId}`);
console.log(`Org ID:   ${orgId}`);
console.log(`Plan:     Pro`);
console.log(`QR Codes: ${insertedIds.length}`);
console.log(`Scans:    ${totalEvents}`);
console.log('\nSign in at https://qriuscodes.com/signin');
