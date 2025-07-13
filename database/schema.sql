CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL, -- admin, finance_manager, department_manager, staff, faculty, student, donor, auditor
  department_id INTEGER REFERENCES departments(id)
);

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  budget NUMERIC(15,2) DEFAULT 0
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE, -- One-to-one
  enrollment_no VARCHAR(50) UNIQUE,
  program VARCHAR(100),
  admission_date DATE
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'unpaid', -- unpaid/paid/overdue
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method VARCHAR(30),
  received_by INTEGER REFERENCES users(id) -- who recorded the payment
);

CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  donor_id INTEGER REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  purpose VARCHAR(255),
  recorded_by INTEGER REFERENCES users(id)
);

CREATE TABLE grants (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  funding_agency VARCHAR(150),
  start_date DATE,
  end_date DATE,
  status VARCHAR(30), -- pending/active/closed
  recorded_by INTEGER REFERENCES users(id)
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  department_id INTEGER REFERENCES departments(id),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'pending', -- pending/approved/rejected
  submitted_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP
);

CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  month VARCHAR(15),
  amount NUMERIC(12,2) NOT NULL,
  paid_on DATE,
  processed_by INTEGER REFERENCES users(id)
);