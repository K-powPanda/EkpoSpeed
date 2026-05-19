export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { athlete_name, to_email } = req.body;

  if (!athlete_name || !to_email) {
    return res.status(400).json({ error: 'Missing athlete_name or to_email' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Coach Ekpo <coach@ekpoperformance.com>',
        to: [to_email],
        subject: "You're registered — Ekpo Speed Performance ⚡",
        text: `Hey ${athlete_name}! I got your form submission 👍\n\nTo lock in your spot for training, here's payment info:\n\nCash App: $MicahEkpo39\nVenmo: @MicahEkpo_39\n\nOnce sent, I'll confirm your schedule + send your first session details.\n\n— Coach Ekpo\n@ekpospeed`
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
