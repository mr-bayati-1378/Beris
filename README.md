# 🏥 Beris – Medical Equipment E-commerce Platform

Modern full-stack e-commerce application built with Next.js and Prisma, focused on scalability, security and modular architecture.

---

## 🚀 Overview

Beris is a production-ready medical equipment store featuring:

- Multi-role authentication (Admin / User)
- Product & category management (3-level hierarchy)
- Order management system
- Secure authentication with NextAuth
- Fully responsive UI
- Optimized SSR & SEO

---

## 🏗 Architecture

- Next.js 14 (App Router)
- Modular folder structure
- Server & Client component separation
- API layer abstraction
- Prisma ORM
- Role-based access control (RBAC)
- Secure password hashing with bcrypt

---

## 🛠 Tech Stack

### Frontend
Next.js • TypeScript • TailwindCSS • Framer Motion

### Backend
Next.js API Routes • Prisma ORM • NextAuth

### Database
SQLite (Dev) – Easily switchable to PostgreSQL / MySQL

---

## 📦 Core Features

- Full shopping flow (cart → checkout → order)
- Admin dashboard
- Dynamic category system
- Secure session handling
- Form validation
- SEO optimized metadata

---

## ⚙️ Local Setup

```bash
git clone https://github.com/mr-bayati-1378/beris.git
cd beris
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
