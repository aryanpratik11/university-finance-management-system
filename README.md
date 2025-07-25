# 🎓 AcadmiVault – University Finance Management System

A full-stack web application to manage and streamline university financial operations, including student fee tracking, payroll management, expense/grant monitoring, and departmental budget allocations.

---

## Deployment

**Frontend**: [[https://stayfinder-prototype.onrender.com](https://acadmivault-ufm.onrender.com)]

**Backend**: hosted on Render

**Database**: hosted on Superbase

---

## 🚀 Features

### 👨‍🎓 Student Module
- View assigned fees and payment history
- Apply for financial aid
- View disbursements
- Pay pending fees

### 👩‍🏫 Faculty & Staff Module
- Submit and track expenses
- View payroll records
- Track grant usage

### 🧾 Admin & Finance Manager Module
- Create & assign fee structures by department, batch, or custom list
- Record and approve transactions (manual + online)
- Manage payroll for staff/faculty
- Monitor departmental budgets
- Generate reports for revenue, expenses, grants, and more

---

## 🛠️ Tech Stack

| Layer         | Technology                       |
|---------------|----------------------------------|
| Frontend      | **React** + **Tailwind CSS**     |
| Backend       | **Node.js** + **Express (ESM)**  |
| Database      | **PostgreSQL** via Supabase      |
| Deployment    | **Render** (Frontend + Backend)  |
| Auth System   | JWT-based custom authentication  |
| Payments      | Razorpay Integration             |
| API Pattern   | RESTful endpoints                |

---

## 📁 Project Structure

```bash
university-finance-management-system/
│
├── backend/
│   ├── config/             # DB connection
│   ├── controllers/        # Logic for each route
│   ├── routes/             # Express route definitions
│   ├── middleware/         # Auth
│   └── index.js            # Express server entry point
│
├── database/
│   ├── schema.sql          # PostgreSQL schema definition
│
├── frontend/
│   ├── public/
│   │   ├── index.html      # Root HTML file
│   ├── src/
│   │   ├── pages/          # Dashboard & view pages
│   │   ├── components/     # UI components
│   │   ├── context/        # Auth + global state
│   │   ├── utils/          # Utility functions (e.g., loadRazorpay) 
│   │   └── App.js          # Main component tree
│   │   └── api.js          # Axios config for API calls
│   │   └── index.js        # Entry point for React app
│
├── .env                     # Environment variables
└── README.md                # Project documentation

---

## 📦 Setup Instructions

### 1️⃣ Backend

```bash
cd backend
npm install
npm run dev
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Disclaimer: Supabase Usage

This project uses **Supabase** (free tier) for database hosting to simplify deployment.

### Limitations:
- Limited concurrent connections (may affect multiple users).
- Rate limits on high-volume requests.
- Slight latency under load.
- Uses **Supavisor** (session pooler) to reduce connection issues.
