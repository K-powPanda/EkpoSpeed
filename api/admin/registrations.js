import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdmin(req, res)) return;

  const sheetUrl = process.env.SHEETDB_URL;
  if (!sheetUrl) {
    return res.status(500).json({ error: 'SHEETDB_URL is not configured' });
  }

  try {
    const response = await fetch(`${sheetUrl}?sheet=Registrations`);
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'SheetDB request failed',
        details: text,
      });
    }

    const data = JSON.parse(text);
    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Admin registration fetch error:', error);
    return res.status(500).json({ error: 'Unable to load registrations' });
  }
}
