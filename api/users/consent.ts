import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireAuth(req);

    const { terms_version } = req.body || {};
    if (!terms_version || typeof terms_version !== 'string' || terms_version.length > 20) {
      return res.status(400).json({ error: 'Invalid terms_version' });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('users')
      .update({
        terms_accepted_at: new Date().toISOString(),
        terms_version,
      })
      .eq('id', user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
