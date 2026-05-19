import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { athlete_name, to_email } = req.body;

  if (!athlete_name || !to_email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Coach Ekpo <coach@ekpoperformance.com>',
      to: [to_email],
      subject: "You're registered — Ekpo Speed Performance ⚡",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" 
                 style="background:#080808;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" 
                       style="max-width:600px;width:100%;background:#111111;
                              border-radius:8px;overflow:hidden;
                              border:1px solid #222222;">
                  <tr>
                    <td style="background:#FF5E00;padding:32px;text-align:center;">
                      <p style="margin:0;font-size:12px;font-weight:700;
                                letter-spacing:0.18em;text-transform:uppercase;
                                color:#ffffff;">EKPO SPEED PERFORMANCE</p>
                      <h1 style="margin:12px 0 0;font-size:32px;font-weight:900;
                                 text-transform:uppercase;color:#ffffff;">
                        You're Locked In ⚡
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 32px;">
                      <p style="margin:0 0 16px;font-size:16px;color:#ffffff;">
                        Hey <strong style="color:#FF5E00;">${athlete_name}</strong>! 
                        I got your form submission 👍
                      </p>
                      <p style="margin:0 0 24px;font-size:15px;color:#AAAAAA;">
                        To lock in your spot for training, here's payment info:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" 
                             style="background:#181818;border-radius:6px;
                                    border:1px solid #222222;margin-bottom:24px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:11px;font-weight:700;
                                      letter-spacing:0.15em;text-transform:uppercase;
                                      color:#FFB800;">PAYMENT INFO</p>
                            <p style="margin:0 0 8px;font-size:14px;color:#ffffff;">
                              <span style="color:#AAAAAA;">Cash App:</span> 
                              &nbsp;<strong>$MicahEkpo39</strong>
                            </p>
                            <p style="margin:0;font-size:14px;color:#ffffff;">
                              <span style="color:#AAAAAA;">Venmo:</span> 
                              &nbsp;<strong>@MicahEkpo_39</strong>
                            </p>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 24px;font-size:15px;color:#AAAAAA;">
                        Once sent, I'll confirm your schedule and send your 
                        first session details.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" 
                             style="background:#181818;border-radius:6px;
                                    border:1px solid #222222;margin-bottom:32px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:11px;font-weight:700;
                                      letter-spacing:0.15em;text-transform:uppercase;
                                      color:#FFB800;">WHAT TO BRING</p>
                            <p style="margin:0;font-size:14px;color:#AAAAAA;
                                      line-height:1.8;">
                              ✓ Running shoes<br>
                              ✓ Water<br>
                              ✓ Your best effort
                            </p>
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="https://www.instagram.com/ekpospeed/"
                               style="display:inline-block;background:#FF5E00;
                                      color:#ffffff;font-size:13px;font-weight:700;
                                      letter-spacing:0.1em;text-transform:uppercase;
                                      text-decoration:none;padding:14px 32px;
                                      border-radius:4px;">
                              Follow @ekpospeed →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px;border-top:1px solid #222222;
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

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
