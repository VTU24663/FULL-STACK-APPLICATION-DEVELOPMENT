# 📝 Online Exam System

A full-stack web application that enables students to take timed online exams and allows administrators to create, manage, and auto-grade assessments.

> Built as a college project using React, Node.js, and php with a MySQL database.

---

## 🚀 Features

- **Student Registration & Login** — Secure authentication for students and admins
- **Timed Exams** — Countdown timer enforced per exam session
- **Auto-Grading** — Instant scoring upon exam submission
- **Admin Dashboard** — Create, edit, and manage exams and questions
- **Results & Scores** — Students can review their performance after submission

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React.js          |
| Backend    | Node.js / Express + PHP |
| Database   | MySQL        |

---

## 📁 Project Structure

```
online_exam_system/
├── frontend/          # React.js app
├── backend/           # Node.js/Express API
├── laravel/           # PHP
├── database/          # SQL migrations and seed files
└── README.md
```

> ⚠️ Update this structure to match your actual folder layout.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- PHP (v8.1+) & Composer
- MySQL or PostgreSQL
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/online_exam_system.git
cd online_exam_system
```

### 2. Set Up the Database

```bash
# Create a database named `exam_system` in MySQL/PostgreSQL
# Then import the schema:
mysql -u root -p exam_system < database/schema.sql
```

### 3. Configure Environment Variables

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Fill in DB credentials, JWT secret, etc.

# Frontend (.env.local)
cp frontend/.env.example frontend/.env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Install Dependencies & Run

```bash
# Frontend
cd frontend
npm install
npm run dev

# Node.js Backend
cd backend
npm install
npm start

# Laravel (if used)
cd laravel
composer install
php artisan migrate
php artisan serve
```

The app should now be running at `http://localhost:3000`.

---

## 👥 Roles

| Role    | Capabilities                                              |
|---------|-----------------------------------------------------------|
| Student | Register, log in, take exams, view scores                 |
| Admin   | Create/manage exams & questions, view all student results |

---

## 📸 Screenshots

> Add screenshots of your app here!

---

## 🙋‍♂️ Author

Made by [Aparna] — [Veltech university]
