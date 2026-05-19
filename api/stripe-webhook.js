import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const athlete_name = session.metadata?.athlete_name || 'Athlete';
    const athlete_email = session.metadata?.athlete_email || session.customer_email;
    const availability = session.metadata?.availability || 'TBD';
    const amount = (session.amount_total / 100).toFixed(2);
    const product_name = session.display_items?.[0]?.custom?.name || 'Training Package';

    try {
      await resend.emails.send({
        from: 'Coach Ekpo <coach@ekpoperformance.com>',
        to: [athlete_email],
        subject: "You're all set — Ekpo Speed Performance 💪",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"></head>
          <body style="margin:0;padding:0;background:#080808;
                       font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#080808;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="max-width:600px;width:100%;background:#111111;
                                border-radius:8px;overflow:hidden;
                                border:1px solid #222222;">
                    <tr>
                      <td style="background:#FF5E00;padding:32px;
                                 text-align:center;">
                        <p style="margin:0;font-size:12px;font-weight:700;
                                  letter-spacing:0.18em;text-transform:uppercase;
                                  color:#ffffff;">EKPO SPEED PERFORMANCE</p>
                        <h1 style="margin:12px 0 0;font-size:32px;
                                   font-weight:900;text-transform:uppercase;
                                   color:#ffffff;">
                          You're All Set 💪
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 32px;">
                        <p style="margin:0 0 24px;font-size:16px;
                                  color:#ffffff;">
                          Hey <strong style="color:#FF5E00;">
                          ${athlete_name}</strong>! Your payment of
                          <strong style="color:#FF5E00;">
                          $${amount}</strong> is confirmed.
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0"
                               style="background:#181818;border-radius:6px;
                                      border:1px solid #222222;
                                      margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px;">
                              <p style="margin:0 0 16px;font-size:11px;
                                        font-weight:700;letter-spacing:0.15em;
                                        text-transform:uppercase;
                                        color:#FFB800;">📍 TRAINING INFO</p>
                              <p style="margin:0 0 10px;font-size:14px;
                                        color:#ffffff;">
                                <span style="color:#AAAAAA;">Location:</span>
                                &nbsp;
                                <a href="https://maps.google.com/?q=4501+West+Fwy+Fort+Worth+TX+76107"
                                   style="color:#FF5E00;">
                                  Arlington Heights Track —
                                  4501 West Fwy, Fort Worth, TX 76107
                                </a>
                              </p>
                              <p style="margin:0 0 10px;font-size:14px;
                                        color:#ffffff;">
                                <span style="color:#AAAAAA;">Schedule:</span>
                                &nbsp;${availability}
                              </p>
                              <p style="margin:0;font-size:14px;
                                        color:#AAAAAA;line-height:1.8;">
                                <strong style="color:#ffffff;">
                                What to bring:</strong><br>
                                ✓ Running shoes<br>
                                ✓ Water<br>
                                ✓ Your best
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0 0 32px;font-size:15px;
                                  color:#AAAAAA;">
                          See you at your first session. Let's get to work.
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="https://www.instagram.com/ekpospeed/"
                                 style="display:inline-block;
                                        background:#FF5E00;color:#ffffff;
                                        font-size:13px;font-weight:700;
                                        letter-spacing:0.1em;
                                        text-transform:uppercase;
                                        text-decoration:none;
                                        padding:14px 32px;border-radius:4px;">
                                Follow @ekpospeed →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 32px;
                                 border-top:1px solid #222222;
                                 text-align:center;">
                        <p style="margin:0;font-size:12px;color:#444444;">
                          Ekpo Speed Performance · Fort Worth, TX ·
                          ekpoperformance.com
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr);
    }
  }

  return res.status(200).json({ received: true });
}
