const nodemailer = require('nodemailer');

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

async function sendOtpEmail(to, otp) {
  if (!hasSmtpConfig()) {
    throw new Error('Email is not configured. Add SMTP settings in .env to send OTP by email.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Event Booking <no-reply@example.com>',
    to,
    subject: 'Your event booking OTP',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });

  return { delivered: true };
}

module.exports = { sendOtpEmail };
