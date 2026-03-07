#!/usr/bin/env node
/**
 * Add today's scans for the demo account.
 * Run: node scripts/seed-today-scans.mjs
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

const sql = neon(process.env.POSTGRES_URL);
const DEMO_USER = '8ea7f9f9-90ae-4bf7-866e-aaef33be9424';

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item; }
  return items[items.length - 1];
}

const countries = [
  { code: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Austin', 'Miami'], region: 'US-CA', weight: 40 },
  { code: 'GB', cities: ['London', 'Manchester'], region: 'GB-ENG', weight: 12 },
  { code: 'DE', cities: ['Berlin', 'Munich'], region: 'DE-BE', weight: 8 },
  { code: 'FR', cities: ['Paris', 'Lyon'], region: 'FR-IDF', weight: 6 },
  { code: 'CA', cities: ['Toronto', 'Vancouver'], region: 'CA-ON', weight: 7 },
  { code: 'AU', cities: ['Sydney', 'Melbourne'], region: 'AU-NSW', weight: 5 },
  { code: 'JP', cities: ['Tokyo', 'Osaka'], region: 'JP-13', weight: 4 },
  { code: 'IN', cities: ['Mumbai', 'Bangalore'], region: 'IN-MH', weight: 5 },
  { code: 'SG', cities: ['Singapore'], region: 'SG-01', weight: 3 },
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
  { val: 'https://mail.google.com', weight: 5 },
];

// Get all demo QR codes
const qrCodes = await sql`SELECT id, name, total_scans FROM qr_codes WHERE user_id = ${DEMO_USER} ORDER BY total_scans DESC`;
console.log(`Found ${qrCodes.length} QR codes for demo user\n`);

// Scans per QR code today — proportional to their popularity
const scanPlan = qrCodes.map(qr => {
  // Popular codes get more today-scans
  const base = Math.max(3, Math.round(qr.total_scans / 30));
  const todayScans = randomBetween(Math.round(base * 0.6), Math.round(base * 1.4));
  return { id: qr.id, name: qr.name, todayScans };
});

const now = new Date();
const currentHour = now.getHours();
let totalInserted = 0;
const BATCH_SIZE = 100;

for (const qr of scanPlan) {
  const events = [];

  for (let i = 0; i < qr.todayScans; i++) {
    const country = weightedRandom(countries);
    const device = weightedRandom(devices);
    const referrer = weightedRandom(referrers);

    // Spread scans across today up to the current hour
    const scanTime = new Date(now);
    const hour = randomBetween(6, currentHour); // scans from 6am to now
    scanTime.setHours(hour, randomBetween(0, 59), randomBetween(0, 59), randomBetween(0, 999));

    const ipHash = crypto.createHash('sha256').update(`today-${i}-${qr.id}`).digest('hex').slice(0, 16);

    events.push({
      qr_code_id: qr.id,
      scanned_at: scanTime.toISOString(),
      country_code: country.code,
      city: randomItem(country.cities),
      region: country.region,
      device_type: device.type,
      user_agent: device.ua,
      ip_hash: ipHash,
      referrer: referrer.val,
    });
  }

  // Batch insert
  for (let b = 0; b < events.length; b += BATCH_SIZE) {
    const batch = events.slice(b, b + BATCH_SIZE);
    const values = batch.map((_, idx) => {
      const base = idx * 9;
      return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9})`;
    }).join(', ');

    const params = batch.flatMap(e => [
      e.qr_code_id, e.scanned_at, e.country_code, e.city, e.region,
      e.device_type, e.user_agent, e.ip_hash, e.referrer,
    ]);

    await sql.query(
      `INSERT INTO scan_events (qr_code_id, scanned_at, country_code, city, region, device_type, user_agent, ip_hash, referrer) VALUES ${values}`,
      params
    );
    totalInserted += batch.length;
  }

  console.log(`  ${qr.name}: +${qr.todayScans} scans today`);
}

// Sync total_scans
await sql`
  UPDATE qr_codes SET total_scans = (
    SELECT COUNT(*) FROM scan_events WHERE scan_events.qr_code_id = qr_codes.id
  )
  WHERE user_id = ${DEMO_USER}
`;

console.log(`\nDone! Added ${totalInserted} scans for today.`);
