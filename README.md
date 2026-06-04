# 🎟️ Event Ticket Booking System

A full-stack event ticketing web app with OTP-based booking verification, QR code tickets, and an admin dashboard for managing events and check-ins.

---

## ✨ Features

### For Attendees
- Browse available events with seat availability and pricing
- Book tickets by name + email (no account needed)
- OTP sent to email to confirm booking
- Receive a QR code ticket with a unique booking code

### For Admins
- Secure JWT-based admin login
- Create, edit, and deactivate events
- Scan QR codes to check attendees in at the venue
- Cleanup duplicate event entries

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js, Express                        |
| Database   | MySQL (via `mysql2`)                    |
| Auth       | JWT (`jsonwebtoken`) + bcrypt           |
| Email      | Nodemailer (SMTP)                       |
| QR Codes   | `qrcode` + `html5-qrcode` (scanner UI) |
| Security   | Helmet, OTP hashing via bcrypt          |

---

## 📁 Project Structure

```
├── server.js              # Express app, all API routes
├── db/
│   ├── pool.js            # MySQL connection pool
│   ├── init.js            # DB setup + admin seeder
│   └── schema.sql         # Table definitions
├── middleware/
│   └── auth.js            # requireAdmin JWT middleware
├── services/
│   └── mailer.js          # SMTP OTP email sender
├── utils/
│   └── otp.js             # OTP generate / hash / compare
└── public/                # Frontend static files
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MySQL 5.7+ or 8+
- An SMTP account (Gmail, Mailtrap, etc.)

### 1. Clone & Install


```bash
git clone https://github.com/VTU24663/Full-stack-projects.git
cd Full-stack-projects
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
# Server
PORT=3000
APP_BASE_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=event_booking_system

# JWT
JWT_SECRET=your-secret-key

# Admin seed credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# SMTP (required for OTP emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
SMTP_FROM=Event Booking <no-reply@example.com>
```

### 3. Initialize the Database

```bash
node db/init.js
```

This creates the database, runs all migrations, and seeds the admin account.

### 4. Start the Server

```bash
node server.js
```

App runs at `http://localhost:3000`

---

## 📡 API Overview

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all active events |
| `POST` | `/api/users/login` | Register or log in by name + email |
| `POST` | `/api/bookings/start` | Start a booking, triggers OTP email |
| `POST` | `/api/bookings/verify-otp` | Confirm booking with OTP |
| `GET` | `/api/tickets/:bookingCode` | Get ticket details + QR code |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `GET` | `/api/admin/events` | List all events |
| `POST` | `/api/admin/events` | Create event |
| `PATCH` | `/api/admin/events/:id` | Edit event |
| `DELETE` | `/api/admin/events/:id` | Delete or hide event |
| `POST` | `/api/tickets/verify` | Scan & check in a ticket |

---

## 🔐 Booking Flow

```
User enters name + email → Seat reserved → OTP sent to email
→ User submits OTP → Booking CONFIRMED → QR ticket generated
→ Admin scans QR at venue → Status set to CHECKED_IN
```

---

## 🗄️ Database Schema

Five tables: `admins`, `events`, `users`, `email_otps`, `bookings`

- Bookings use a transaction lock (`FOR UPDATE`) to prevent double-booking
- OTPs expire after 10 minutes and are bcrypt-hashed
- Booking status: `PENDING_OTP` → `CONFIRMED` → `CHECKED_IN`

## 👤 Author

Made by [Aparna]

---
