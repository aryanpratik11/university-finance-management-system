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
  head_id INTEGER REFERENCES users(id)
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  enrollment_no VARCHAR(50) UNIQUE,
  program VARCHAR(100),
  batch INTEGER
);

CREATE TABLE grants (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  funding_agency VARCHAR(150),
  title VARCHAR(200),
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(30) DEFAULT 'pending',
  recorded_by INTEGER REFERENCES users(id),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  department_id INTEGER REFERENCES departments(id),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(30) DEFAULT 'pending_dept', 
  submitted_by INTEGER REFERENCES users(id),
  dept_approved_by INTEGER REFERENCES users(id),
  finance_approved_by INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dept_approved_at TIMESTAMP,
  finance_approved_at TIMESTAMP,
  refunded_at TIMESTAMP
);

CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  month VARCHAR(15),
  amount NUMERIC(12,2) NOT NULL,
  paid_on DATE,
  status VARCHAR(20) DEFAULT 'unpaid',
  paid_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_by INTEGER REFERENCES users(id)
);

CREATE TABLE fee_structures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_aid_applications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  aid_type VARCHAR(50),            -- e.g., scholarship, fee waiver
  amount_requested NUMERIC(12,2),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

CREATE TABLE aid_disbursements (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  aid_application_id INTEGER REFERENCES student_aid_applications(id),
  amount NUMERIC(12,2) NOT NULL,
  disbursed_at TIMESTAMP
);

-- 🟢 transactions
CREATE TYPE transaction_status AS ENUM ('success', 'fail', 'pending');

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    student_fee_record_id INTEGER REFERENCES student_fee_records(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP DEFAULT now(),
    method VARCHAR(50),
    payment_reference VARCHAR(100);
    remarks TEXT,
    status transaction_status NOT NULL,
    initiated_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP;
);

-- 🟢 student_fee_records
CREATE TABLE student_fee_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id INTEGER REFERENCES fee_structures(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
    amount_paid NUMERIC(10,2) DEFAULT 0,
    due_date DATE,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE department_budgets (
  id SERIAL PRIMARY KEY,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  fiscal_year VARCHAR(10) NOT NULL,
  allocated NUMERIC(12, 2) NOT NULL,
  spent NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE finance_balance (
  id SERIAL PRIMARY KEY,
  total_amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE income_sources (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(100) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
