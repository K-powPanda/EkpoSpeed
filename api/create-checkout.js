import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  'drop-in-1on1':        'price_1TYwRhIhyeCdMv4a9IX8D4zG',
  'drop-in-group':       'price_1TYwT4IhyeCdMv4aQcxkpn1U',
  '2month-1on1':         'price_1TYwUDIhyeCdMv4aNwvZ6g9X',
  '2month-group':        'price_1TYwVBIhyeCdMv4aRcexH19L',
  'summer-1on1':         'price_1TYwX7IhyeCdMv4aRK8ygk6Z',
  'summer-group':        'price_1TYwY2IhyeCdMv4a8epuOlGW',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { package_key, athlete_name, athlete_email, availability } = req.body;

  const priceId = PRICE_MAP[package_key];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid package selected' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      customer_email: athlete_email,
      metadata: {
        athlete_name,
        athlete_email,
        availability: availability || ''
      },
      success_url: 'https://ekpoperformance.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://ekpoperformance.com/#pricing',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
