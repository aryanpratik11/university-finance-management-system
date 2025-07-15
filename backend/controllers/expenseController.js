// src/controllers/financeController.js
import { pool } from "../config/db.js";

// GET /api/finance/expenses
export const getPendingExpenses = async (req, res) => {
    try {
        const query = `
      SELECT e.id, e.amount, e.description, e.status, e.submitted_at,
             u.name AS faculty_name, d.name AS department_name
      FROM expenses e
      JOIN users u ON e.submitted_by = u.id
      JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'pending'
      ORDER BY e.submitted_at DESC;
    `;

        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

// POST /api/finance/expenses/:id/approve
export const approveExpense = async (req, res) => {
    const { id } = req.params;
    const approverId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE expenses
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *;`,
            [approverId, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Expense not found or already processed" });
        }

        res.json({ message: "Expense approved" });
    } catch (err) {
        console.error("Error approving expense:", err);
        res.status(500).json({ error: "Failed to approve expense" });
    }
};

// POST /api/finance/expenses/:id/reject
export const rejectExpense = async (req, res) => {
    const { id } = req.params;
    const approverId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE expenses
       SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING *;`,
            [approverId, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Expense not found or already processed" });
        }

        res.json({ message: "Expense rejected" });
    } catch (err) {
        console.error("Error rejecting expense:", err);
        res.status(500).json({ error: "Failed to reject expense" });
    }
};

export const getPayrollSummary = async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT u.name, p.month, p.amount, p.paid_on FROM payroll p JOIN users u ON p.user_id = u.id ORDER BY p.paid_on DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching payroll summary:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const getBudgets = async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT d.name AS department, b.budget_amount, b.spent_amount FROM budgets b JOIN departments d ON b.department_id = d.id"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching budgets:", err);
        res.status(500).json({ error: "Server error" });
    }
};
