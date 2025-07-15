import pool from "../config/db.js";

export const getAllInvoices = async (req, res) => {
  const { student, status, fromDate, toDate } = req.query;

  let query = `
    SELECT invoices.*, students.enrollment_no, students.program, users.name AS student_name
    FROM invoices
    JOIN students ON invoices.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (student) {
    query += ` AND students.enrollment_no = $${i++}`;
    params.push(student);
  }
  if (status) {
    query += ` AND invoices.status = $${i++}`;
    params.push(status);
  }
  if (fromDate) {
    query += ` AND invoices.due_date >= $${i++}`;
    params.push(fromDate);
  }
  if (toDate) {
    query += ` AND invoices.due_date <= $${i++}`;
    params.push(toDate);
  }

  const { rows } = await pool.query(query, params);
  res.json(rows);
};

// CREATE a new invoice
export const createInvoice = async (req, res) => {
  const { student_id, amount, due_date, created_by } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO invoices (student_id, amount, due_date, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [student_id, amount, due_date, created_by]
  );
  res.status(201).json(rows[0]);
};

// UPDATE invoice status
export const updateInvoiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { rows } = await pool.query(
    `UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Invoice not found" });
  res.json(rows[0]);
};

// DELETE an invoice
export const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM invoices WHERE id = $1`, [id]);
  res.json({ message: "Invoice deleted" });
};

// ==================== PAYMENTS ====================

// GET all payments
export const getAllPayments = async (req, res) => {
  const { student, fromDate, toDate } = req.query;

  let query = `
    SELECT payments.*, invoices.id AS invoice_id, students.enrollment_no, users.name AS student_name
    FROM payments
    JOIN invoices ON payments.invoice_id = invoices.id
    JOIN students ON invoices.student_id = students.id
    JOIN users ON students.user_id = users.id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (student) {
    query += ` AND students.enrollment_no = $${i++}`;
    params.push(student);
  }
  if (fromDate) {
    query += ` AND payments.payment_date >= $${i++}`;
    params.push(fromDate);
  }
  if (toDate) {
    query += ` AND payments.payment_date <= $${i++}`;
    params.push(toDate);
  }

  const { rows } = await pool.query(query, params);
  res.json(rows);
};

// CREATE a new payment
export const createPayment = async (req, res) => {
  const { invoice_id, amount, payment_method, received_by } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO payments (invoice_id, amount, payment_method, received_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [invoice_id, amount, payment_method, received_by]
  );

  // Also mark invoice as paid
  await pool.query(
    `UPDATE invoices SET status = 'paid' WHERE id = $1`,
    [invoice_id]
  );

  res.status(201).json(rows[0]);
};
