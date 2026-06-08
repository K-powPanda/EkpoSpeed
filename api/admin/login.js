import { createSessionCookie } from './_auth.js';

function timingSafePasswordMatch(input, expected) {
  const encoder = new TextEncoder();
  const left = encoder.encode(input || '');
  const right = encoder.encode(expected || '');
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password is not configured' });
  }

  const { password } = req.body || {};
  if (!timingSafePasswordMatch(password, adminPassword)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  return res.status(200).json({ ok: true });
}
