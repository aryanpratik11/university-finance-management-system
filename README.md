# 🎓 AcadmiVault – University Finance Management System

A full-stack web application to manage and streamline university financial operations, including student fee tracking, payroll management, expense/grant monitoring, and departmental budget allocations.

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
│   ├── controllers/         # Business logic
│   ├── routes/              # Express route definitions
│   ├── models/              # DB schema queries
│   ├── db/                  # DB connection using Supabase
│   └── index.js             # Express server setup
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard views
│   │   ├── components/      # Reusable UI
│   │   ├── context/         # Auth + global state
│   │   └── App.jsx          # Main component tree
│   └── vite.config.js       # Vite config
│
├── .env                     # Environment variables
└── README.md                # Project documentation
