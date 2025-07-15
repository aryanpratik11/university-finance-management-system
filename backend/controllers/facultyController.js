import { pool } from "../config/db.js";

export const getFacultyDashboard = async (req, res) => {
    const userId = req.user.id;

    const [payroll, grants, expenses] = await Promise.all([
        pool.query(
            "SELECT month, amount, paid_on FROM payroll WHERE staff_id = $1 ORDER BY paid_on DESC",
            [userId]
        ),
        pool.query(
            "SELECT * FROM grants WHERE faculty_id = $1 ORDER BY start_date DESC",
            [userId]
        ),
        pool.query(
            "SELECT * FROM expenses WHERE submitted_by = $1 ORDER BY submitted_at DESC",
            [userId]
        ),
    ]);

    res.json({
        payroll: payroll.rows,
        grants: grants.rows,
        expenses: expenses.rows,
    });
};

// Raise expense request
export const createExpenseRequest = async (req, res) => {
    const userId = req.user.id;
    const { department_id, amount, description } = req.body;

    const result = await pool.query(
        `INSERT INTO expenses (department_id, amount, description, submitted_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [department_id, amount, description, userId]
    );

    res.status(201).json(result.rows[0]);
};
