import { createRequire } from 'module';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const response = await fetch(
      'https://sheetdb.io/api/v1/24lvcvb18iofv'
    );
    const data = await response.json();

    const slots = {
      'Tuesday (5:00–6:00 PM 1-on-1)': 0,
      'Tuesday (6:00–7:00 PM 1-on-1)': 0,
      'Tuesday (7:00–8:00 PM 1-on-1)': 0,
      'Friday (5:00–6:00 PM 1-on-1)': 0,
      'Friday (6:00–7:00 PM 1-on-1)': 0,
      'Friday (7:00–8:00 PM 1-on-1)': 0,
    };

    for (const row of data) {
      if (row['Registration Type'] === 'Paid Package' &&
          row['Training Type'] === '1-on-1 Private Sessions') {
        const availability = row['Availability'] || '';
        for (const slot of Object.keys(slots)) {
          if (availability.includes(slot)) {
            slots[slot]++;
          }
        }
      }
    }

    return res.status(200).json({ slots });
  } catch (err) {
    console.error('Slot check error:', err);
    return res.status(500).json({ error: err.message });
  }
}
