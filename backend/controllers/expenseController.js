import { pool } from "../config/db.js";

export const submitExpense = async (req, res) => {
    const { department_id, amount, description, submitted_by, receipt_url } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO expenses (department_id, amount, description, submitted_by, receipt_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [department_id, amount, description, submitted_by, receipt_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error submitting expense:", err);
        res.status(500).json({ error: "Failed to submit expense" });
    }
};

export const getMyExpenses = async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const result = await pool.query(
            `SELECT * FROM expenses WHERE submitted_by = $1 ORDER BY submitted_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching user expenses:", err);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

export const getDepartmentExpenses = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows: userRows } = await pool.query(
      "SELECT department_id FROM users WHERE id = $1",
      [userId]
    );
    const deptId = userRows[0]?.department_id;

    if (!deptId) return res.status(400).json({ error: "Department not found." });

    const { rows } = await pool.query(
      `SELECT e.*, u.name AS faculty_name
       FROM expenses e
       JOIN users u ON e.submitted_by = u.id
       WHERE e.department_id = $1`,
      [deptId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching pending expenses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deptApproveExpense = async (req, res) => {
    const expenseId = parseInt(req.params.id);
    const { status, dept_approved_by } = req.body;

    if (!['approved_dept', 'rejected_dept'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const result = await pool.query(
            `UPDATE expenses
       SET status = $1, dept_approved_by = $2, dept_approved_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
            [status, dept_approved_by, expenseId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating expense:", err);
        res.status(500).json({ error: "Department approval failed" });
    }
};

export const financeApproveExpense = async (req, res) => {
    const expenseId = parseInt(req.params.id);
    const { status, finance_approved_by } = req.body;

    if (!['approved_finance', 'rejected_finance'].includes(status)) {
        return res.status(400).json({ error: "Invalid finance status" });
    }

    try {
        const result = await pool.query(
            `UPDATE expenses
       SET status = $1, finance_approved_by = $2,
           finance_approved_at = CURRENT_TIMESTAMP,
           refunded_at = CASE WHEN $1 = 'approved_finance' THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $3 RETURNING *`,
            [status, finance_approved_by, expenseId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Finance approval error:", err);
        res.status(500).json({ error: "Finance approval failed" });
    }
};

export const getAllExpenses = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM expenses ORDER BY submitted_at DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching all expenses:", err);
        res.status(500).json({ error: "Failed to fetch all expenses" });
    }
};

export const updateExpenseStatus = async (req, res) => {
    const expenseId = req.params.id;
    const { status } = req.body; // 'dept_approved', 'approved', or 'rejected'
    const approverId = req.user.id;
    const userRole = req.user.role;

    try {
        const expense = await pool.query(`SELECT * FROM expenses WHERE id = $1`, [expenseId]);
        if (expense.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        const currentStatus = expense.rows[0].status;

        // Check if the user has authority to approve at the current stage
        if (status === 'dept_approved' && userRole !== 'department_manager') {
            return res.status(403).json({ error: "Only Department Heads can do this approval." });
        }

        if (status === 'approved' && !['admin', 'finance_manager'].includes(userRole)) {
            return res.status(403).json({ error: "Only Admins or Finance Managers can fully approve." });
        }

        if (status === 'rejected' && !['admin', 'finance_manager', 'department_manager'].includes(userRole)) {
            return res.status(403).json({ error: "Not authorized to reject." });
        }

        // Logic to prevent skipping stages
        if (status === 'approved' && currentStatus !== 'dept_approved') {
            return res.status(400).json({ error: "Expense must be approved by department head first." });
        }

        if (status === 'dept_approved' && currentStatus !== 'pending') {
            return res.status(400).json({ error: "Expense is not in pending state." });
        }

        const result = await pool.query(
            `UPDATE expenses
       SET status = $1,
           approved_by = $2,
           approved_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
            [status, approverId, expenseId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating expense status:", err);
        res.status(500).json({ error: "Failed to update expense status" });
    }
};
