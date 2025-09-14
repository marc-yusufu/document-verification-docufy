import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * POST /send-otp
 * Body: { email: string, otp: string }
 * Sends an OTP email using SendGrid
 */
app.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP required' });
  }

  try {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<strong>Your OTP is ${otp}. It expires in 10 minutes.</strong>`,
    };

    await sgMail.send(msg);

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('SendGrid error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
  }
});
