const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
require('dotenv').config();

const pool = require('./db/pool');
const { requireAdmin } = require('./middleware/auth');
const { sendOtpEmail } = require('./services/mailer');
const { createOtp, hashOtp, compareOtp } = require('./utils/otp');

const app = express();
const port = Number(process.env.PORT || 3000);

function getBaseUrl(req) {
  return (process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/vendor/html5-qrcode', express.static(path.join(__dirname, '..', 'node_modules', 'html5-qrcode')));

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
  const admin = rows[0];

  if (!admin || !(await bcrypt.compare(password || '', admin.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || 'change-this-secret', {
    expiresIn: '8h'
  });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
});

app.post('/api/users/login', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  await pool.execute(
    `INSERT INTO users (name, email)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = CURRENT_TIMESTAMP`,
    [name.trim(), email.trim()]
  );

  const [rows] = await pool.execute('SELECT id, name, email, is_verified FROM users WHERE email = ?', [email.trim()]);
  res.json({ user: rows[0] });
});

app.get('/api/events', async (_req, res) => {
  const [events] = await pool.execute(
    `SELECT id, title, description, venue, event_date, price, capacity, seats_booked, is_active
     FROM events
     WHERE is_active = TRUE
     ORDER BY event_date ASC`
  );
  res.json(events);
});

app.get('/api/admin/events', requireAdmin, async (_req, res) => {
  const [events] = await pool.execute('SELECT * FROM events WHERE is_active = TRUE ORDER BY event_date ASC');
  res.json(events);
});

app.post('/api/admin/events', requireAdmin, async (req, res) => {
  const { title, description, venue, eventDate, price, capacity } = req.body;

  if (!title || !venue || !eventDate || Number(capacity) < 1) {
    return res.status(400).json({ message: 'Title, venue, date, and capacity are required.' });
  }

  const [existingRows] = await pool.execute(
    `SELECT id
     FROM events
     WHERE title = ? AND venue = ? AND event_date = ?
     LIMIT 1`,
    [title.trim(), venue.trim(), eventDate]
  );

  if (existingRows.length) {
    return res.status(409).json({ message: 'This event already exists.' });
  }

  const [result] = await pool.execute(
    `INSERT INTO events (title, description, venue, event_date, price, capacity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title.trim(), description || '', venue.trim(), eventDate, Number(price || 0), Number(capacity)]
  );

  res.status(201).json({ id: result.insertId });
});

app.patch('/api/admin/events/:id', requireAdmin, async (req, res) => {
  const { title, description, venue, eventDate, price, capacity, isActive } = req.body;

  await pool.execute(
    `UPDATE events
     SET title = ?, description = ?, venue = ?, event_date = ?, price = ?, capacity = ?, is_active = ?
     WHERE id = ?`,
    [title, description || '', venue, eventDate, Number(price || 0), Number(capacity), Boolean(isActive), req.params.id]
  );

  res.json({ message: 'Event updated.' });
});

app.post('/api/admin/events/cleanup-duplicates', requireAdmin, async (_req, res) => {
  const [result] = await pool.execute(
    `UPDATE events e
     JOIN events original
       ON original.title = e.title
      AND original.venue = e.venue
      AND original.event_date = e.event_date
      AND original.id < e.id
      AND original.is_active = TRUE
     SET e.is_active = FALSE
     WHERE e.is_active = TRUE`
  );

  res.json({ message: `${result.affectedRows} duplicate event(s) hidden.` });
});

app.delete('/api/admin/events/:id', requireAdmin, async (req, res) => {
  const [bookingRows] = await pool.execute('SELECT id FROM bookings WHERE event_id = ? LIMIT 1', [req.params.id]);

  if (bookingRows.length) {
    await pool.execute('UPDATE events SET is_active = FALSE WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Event has bookings, so it was hidden instead of deleted.' });
  }

  await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.json({ message: 'Event deleted.' });
});

app.post('/api/bookings/start', async (req, res) => {
  const { eventId, name, email, quantity } = req.body;
  const qty = Math.max(1, Number(quantity || 1));
  const connection = await pool.getConnection();

  if (!eventId || !name || !email) {
    return res.status(400).json({ message: 'Event, name, and email are required.' });
  }

  try {
    await connection.beginTransaction();

    const [eventRows] = await connection.execute('SELECT * FROM events WHERE id = ? AND is_active = TRUE FOR UPDATE', [
      eventId
    ]);
    const event = eventRows[0];

    if (!event) {
      await connection.rollback();
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.seats_booked + qty > event.capacity) {
      await connection.rollback();
      return res.status(409).json({ message: 'Not enough seats available.' });
    }

    await connection.execute(
      `INSERT INTO users (name, email)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = CURRENT_TIMESTAMP`,
      [name, email]
    );
    const [userRows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = userRows[0];

    const bookingCode = `EVT-${Date.now().toString(36).toUpperCase()}`;
    const qrToken = randomUUID();
    const [bookingResult] = await connection.execute(
      `INSERT INTO bookings (booking_code, event_id, user_id, quantity, qr_token)
       VALUES (?, ?, ?, ?, ?)`,
      [bookingCode, eventId, user.id, qty, qrToken]
    );

    const otp = createOtp();
    const otpHash = await hashOtp(otp);
    await connection.execute(
      `INSERT INTO email_otps (user_id, otp_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [user.id, otpHash]
    );

    await sendOtpEmail(email, otp);
    await connection.commit();

    res.status(201).json({
      bookingId: bookingResult.insertId,
      email,
      message: 'OTP sent to your email. Verify it to confirm your ticket.'
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: error.message || 'Booking could not be started.' });
  } finally {
    connection.release();
  }
});

app.post('/api/bookings/verify-otp', async (req, res) => {
  const { bookingId, otp } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.execute(
      `SELECT b.*, u.email, u.id AS user_id
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = ? FOR UPDATE`,
      [bookingId]
    );
    const booking = bookingRows[0];

    if (!booking) {
      await connection.rollback();
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status !== 'PENDING_OTP') {
      await connection.rollback();
      return res.status(409).json({ message: 'Booking is already processed.' });
    }

    const [capacityRows] = await connection.execute('SELECT * FROM events WHERE id = ? FOR UPDATE', [booking.event_id]);
    const event = capacityRows[0];

    if (!event || event.seats_booked + booking.quantity > event.capacity) {
      await connection.rollback();
      return res.status(409).json({ message: 'This event no longer has enough seats available.' });
    }

    const [otpRows] = await connection.execute(
      `SELECT * FROM email_otps
       WHERE user_id = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [booking.user_id]
    );
    const otpRecord = otpRows[0];

    if (!otpRecord || !(await compareOtp(String(otp || ''), otpRecord.otp_hash))) {
      await connection.rollback();
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await connection.execute('UPDATE email_otps SET used_at = NOW() WHERE id = ?', [otpRecord.id]);
    await connection.execute('UPDATE users SET is_verified = TRUE WHERE id = ?', [booking.user_id]);
    await connection.execute('UPDATE bookings SET status = "CONFIRMED" WHERE id = ?', [booking.id]);
    await connection.execute('UPDATE events SET seats_booked = seats_booked + ? WHERE id = ?', [
      booking.quantity,
      booking.event_id
    ]);

    await connection.commit();

    const ticketUrl = `${getBaseUrl(req)}/ticket.html?code=${encodeURIComponent(booking.booking_code)}`;
    const qrDataUrl = await QRCode.toDataURL(ticketUrl);

    res.json({
      bookingCode: booking.booking_code,
      ticketUrl,
      qrDataUrl
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'OTP verification failed.' });
  } finally {
    connection.release();
  }
});

app.get('/api/tickets/:bookingCode', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT b.booking_code, b.quantity, b.status, b.qr_token, e.title, e.venue, e.event_date, u.name, u.email
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     JOIN users u ON u.id = b.user_id
     WHERE b.booking_code = ?`,
    [req.params.bookingCode]
  );
  const ticket = rows[0];

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found.' });
  }

  const ticketUrl = `${getBaseUrl(req)}/ticket.html?code=${encodeURIComponent(ticket.booking_code)}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl);
  res.json({ ...ticket, qrDataUrl });
});

app.post('/api/tickets/verify', requireAdmin, async (req, res) => {
  let token = req.body.token;
  let bookingCode = null;

  try {
    const parsed = JSON.parse(token);
    token = parsed.token || token;
  } catch {
    // Raw token, booking URL, and booking code scans are also allowed.
  }

  try {
    const scannedUrl = new URL(token);
    bookingCode = scannedUrl.searchParams.get('code');
  } catch {
    if (String(token || '').startsWith('EVT-')) {
      bookingCode = token;
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT b.*, e.title, e.event_date, u.name, u.email
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       JOIN users u ON u.id = b.user_id
       WHERE b.qr_token = ? OR b.booking_code = ?
       FOR UPDATE`,
      [token, bookingCode]
    );
    const booking = rows[0];

    if (!booking) {
      await connection.rollback();
      return res.status(404).json({ valid: false, message: 'Ticket not found.' });
    }

    if (booking.status === 'CHECKED_IN') {
      await connection.rollback();
      return res.status(409).json({ valid: false, message: 'Ticket already checked in.', booking });
    }

    if (booking.status !== 'CONFIRMED') {
      await connection.rollback();
      return res.status(409).json({ valid: false, message: `Ticket is ${booking.status}.`, booking });
    }

    await connection.execute('UPDATE bookings SET status = "CHECKED_IN", checked_in_at = NOW() WHERE id = ?', [
      booking.id
    ]);
    await connection.commit();
    booking.status = 'CHECKED_IN';
    booking.checked_in_at = new Date().toISOString();
    res.json({ valid: true, message: 'Ticket verified and checked in.', booking });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ valid: false, message: 'Ticket verification failed.' });
  } finally {
    connection.release();
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`Event booking system running at http://localhost:${port}`);
});
