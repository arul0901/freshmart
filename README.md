# 🛒 FreshMart - Premium Groceries Platform

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![License-ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

FreshMart is a sophisticated, full-stack web ecosystem designed for premium grocery delivery. It features a stunning customer storefront, a robust management dashboard, and a centralized Node.js/Supabase backend.

---

## 📂 Project Structure

| Folder | Purpose | Tech Stack |
| :--- | :--- | :--- |
| [`frontend/`](./frontend) | Customer Storefront | React, Framer Motion, Lucide |
| [`admin/`](./admin) | Management Dashboard | React, Axios, Admin CSS |
| [`backend/`](./backend) | Centralized API & AI | Node.js, Express, TensorFlow.js, Supabase |

---

## 🚀 Getting Started

To launch the full FreshMart experience, you will need three terminal instances:

### 1️⃣ Backend API
```bash
cd backend
npm install
npm start
```
*API will be live at `http://localhost:3001`.*

### 2️⃣ Customer Frontend
```bash
cd frontend
npm install
npm run dev
```
*Storefront will be live at `http://localhost:5173`.*

### 3️⃣ Admin Panel
```bash
cd admin
npm install
npm run dev
```
*Admin portal will be live at `http://localhost:5174`.*

---

## 🤖 Exclusive Features

### **Custom Local AI Search**
FreshMart includes a proprietary image recognition system built with **TensorFlow.js**.
- **Privacy-First**: Image inference happens locally on the server without sending data to external paid APIs.
- **Visual Search**: Customers can upload photos to instantly find matching products in the inventory with high confidence.

### **SMTP Lifecycle Notifications**
Fully integrated order communication workflow powered by **Resend/SMTP**:
- Automated order confirmations upon success.
- Real-time status update notifications (Pending → Processing).
- Automated feedback requests once delivery is accepted.

---

## 🔑 Environment Setup

Each folder contains a `.env.example` file. To get started:
1. Copy `.env.example` to `.env` in each directory.
2. Fill in your **Supabase URL**, **Service Role Keys**, and **Resend API Keys**.

---

## 📜 Credits & License
Developed as a premium solution for modern grocery commerce. Licensed under the [ISC License](./LICENSE).
