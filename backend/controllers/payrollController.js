import { pool } from "../config/db.js";

/**
 * Create a new payroll record
 */
export const createPayroll = async (req, res) => {
    const { staff_id, role, month, amount, paid_on } = req.body;
    const processed_by = req.user.id;

    if (!staff_id || !role || !month || !amount) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO payroll (staff_id, role, month, amount, paid_on, processed_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [staff_id, role, month, amount, paid_on, processed_by]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error("Create payroll error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Get all payroll records, optionally filtered by role
 */
export const getAllPayroll = async (req, res) => {
    const { role } = req.query;

    try {
        let query = `SELECT p.*, u.name as staff_name FROM payroll p
                 JOIN users u ON p.staff_id = u.id`;
        let params = [];

        if (role) {
            query += ` WHERE p.role = $1`;
            params.push(role);
        }

        query += ` ORDER BY p.paid_on DESC NULLS LAST`;

        const { rows } = await pool.query(query, params);

        res.json(rows);
    } catch (err) {
        console.error("Get all payroll error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Get payroll history for a specific user
 */
export const getUserPayroll = async (req, res) => {
    const staff_id = req.params.staff_id;

    try {
        const { rows } = await pool.query(
            `SELECT * FROM payroll
       WHERE staff_id = $1
       ORDER BY paid_on DESC NULLS LAST`,
            [staff_id]
        );

        res.json(rows);
    } catch (err) {
        console.error("Get user payroll error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
