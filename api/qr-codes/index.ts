// POST /api/qr-codes - Create a new trackable QR code
// GET /api/qr-codes - List all QR codes

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, type QRCodeRow } from '../_lib/db';
import { generateShortCode } from '../_lib/shortCode';
import { setCachedRedirect } from '../_lib/kv';

interface CreateQRCodeRequest {
  destination_url: string;
  qr_type?: string;
  original_data?: unknown;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  try {
    if (req.method === 'POST') {
      return await handleCreate(req, res, baseUrl);
    }

    if (req.method === 'GET') {
      return await handleList(req, res, baseUrl);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCreate(req: VercelRequest, res: VercelResponse, baseUrl: string) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const body = req.body as CreateQRCodeRequest;

  // Validate required fields
  if (!body.destination_url) {
    return res.status(400).json({ error: 'destination_url is required' });
  }

  // Validate URL format
  try {
    new URL(body.destination_url);
  } catch {
    return res.status(400).json({ error: 'Invalid destination_url format' });
  }

  // Generate unique short code (with retry for collisions)
  let shortCode: string;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    shortCode = generateShortCode();
    attempts++;

    // Check if code already exists
    const existing = await sql`
      SELECT id FROM qr_codes WHERE short_code = ${shortCode}
    `;

    if (existing.length === 0) {
      break;
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate unique short code' });
    }
  } while (true);

  // Insert new QR code
  const result = await sql`
    INSERT INTO qr_codes (short_code, destination_url, qr_type, original_data)
    VALUES (
      ${shortCode},
      ${body.destination_url},
      ${body.qr_type || 'url'},
      ${body.original_data ? JSON.stringify(body.original_data) : null}
    )
    RETURNING *
  `;

  const row = result[0] as QRCodeRow;

  // Pre-populate cache for fast redirects
  await setCachedRedirect(shortCode, {
    destinationUrl: body.destination_url,
    qrCodeId: row.id,
  });

  return res.status(201).json(toQRCodeResponse(row, baseUrl));
}

async function handleList(req: VercelRequest, res: VercelResponse, baseUrl: string) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const result = await sql`
    SELECT *
    FROM qr_codes
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const qrCodes = result.map((row) => toQRCodeResponse(row as QRCodeRow, baseUrl));

  // Get total count
  const countResult = await sql`SELECT COUNT(*) as count FROM qr_codes`;
  const total = parseInt(countResult[0].count as string);

  return res.status(200).json({
    qrCodes,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}
