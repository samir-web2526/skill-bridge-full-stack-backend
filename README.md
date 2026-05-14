# Skill Bridge Backend

A modern, robust REST API for the Skill Bridge platform, enabling seamless connections between students and perfect tutors.

---

## 📖 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)
- [Contact](#contact)

---

## About The Project

Skill Bridge Backend is a comprehensive RESTful API built to power the Skill Bridge tutoring platform. It handles secure user authentication, role-based access control, database interactions for tutors and students, payment processing through Stripe, and email notifications. The architecture is modular and scalable, utilizing Express.js, TypeScript, and Prisma ORM.

---

## Features

- Role-based authorization (Admin, Student, Tutor)
- Secure authentication with JWT & Google Auth Library
- Advanced database management using Prisma ORM with PostgreSQL
- Secure payment integration via Stripe Webhooks
- Email notification system using Nodemailer
- Centralized error handling and API response formatting
- Request validation using Zod
- Clean architecture and modular folder structure

---

## Tech Stack

### Core
- Node.js
- Express.js
- TypeScript

### Database & ORM
- PostgreSQL
- Prisma

### Authentication & Security
- JSON Web Tokens (JWT)
- bcrypt (Password Hashing)
- Google Auth Library
- cors
- cookie-parser

### Utilities & Validation
- Zod
- Stripe
- Nodemailer

---

## Installation & Setup

### Clone the repository

```bash
git clone https://github.com/samir-web2526/skill-bridge-full-stack-backend.git
```

### Navigate to the project folder

```bash
cd skill-bridge-full-stack-backend
```

### Install dependencies

```bash
npm install
```

### Setup environment variables

Create a `.env` file in the root directory and add the required environment variables (see [Environment Variables](#environment-variables) section).

### Generate Prisma Client & Run Migrations

```bash
npm run generate
npm run migrate
```

### Run the development server

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file and configure the following variables:

```env
# Server
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database_name"

# JWT Auth
ACCESS_TOKEN_SECRET="your_access_token_secret"
ACCESS_TOKEN_EXPIRES_IN="1d"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
REFRESH_TOKEN_EXPIRES_IN="365d"
BCRYPT_SALT_ROUNDS=12

# Admin Seed Info
ADMIN_EMAIL="admin@skillbridge.com"
ADMIN_PASSWORD="securepassword"
ADMIN_NAME="Super Admin"
ADMIN_PHONE="0123456789"

# Stripe Payment
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# Email Config
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=465
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_password"
EMAIL_FROM="no-reply@skillbridge.com"

# Google Auth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

| Variable Name             | Description                                    |
| ------------------------- | ---------------------------------------------- |
| NODE_ENV                  | Environment (development/production)           |
| PORT                      | Port number for the server                     |
| DATABASE_URL              | PostgreSQL database connection URL             |
| ACCESS_TOKEN_SECRET       | Secret key for signing access tokens           |
| STRIPE_SECRET_KEY         | Secret key for Stripe API                      |
| EMAIL_USER                | SMTP email user                                |
| GOOGLE_CLIENT_ID          | Client ID for Google OAuth                     |

*(Only key variables described, see `.env` block for full list)*

---

## Folder Structure

```plaintext
skill-bridge-full-stack-backend/
│
├── prisma/
│   ├── schema/
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── builder/
│   │   ├── errorHelpers/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── payment/
│   │   │   ├── student/
│   │   │   └── user/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── config/
│   ├── seedAdmin/
│   └── server.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

## Dependencies

```json
"dependencies": {
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "google-auth-library": "^10.6.2",
    "http-status": "^2.1.0",
    "jsonwebtoken": "^9.0.3",
    "nodemailer": "^8.0.7",
    "pg": "^8.20.0",
    "stripe": "^22.1.0",
    "zod": "^4.4.3"
}
```

---

## Live API

🔗 Base URL: https://skill-bridge-full-stack-backend.vercel.app/api/v1/

---

## Contact

- Portfolio: https://portfolio-kappa-weld-92.vercel.app/
- Email: baishnabsamir26@gmail.com
