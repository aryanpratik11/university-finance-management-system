import { pool } from "../config/db.js";

export const generatePayrollsCurrentMonth = async (req, res) => {
    const processed_by_user_id = req.user.id;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    // e.g. "2025-07"

    try {
        const usersRes = await pool.query(`
      SELECT id, role FROM users
      WHERE is_active = true AND role IN ('staff', 'faculty')
    `);

        const users = usersRes.rows;

        for (let user of users) {
            const { id: staff_id, role } = user;

            // Check if already has payroll for this month
            const check = await pool.query(
                `SELECT 1 FROM payroll WHERE staff_id = $1 AND month = $2`,
                [staff_id, currentMonth]
            );

            if (check.rowCount > 0) continue; // already exists

            // Get last month's payroll if exists
            const prev = await pool.query(
                `SELECT amount FROM payroll WHERE staff_id = $1 ORDER BY id DESC LIMIT 1`,
                [staff_id]
            );

            const amount = prev.rowCount > 0 ? prev.rows[0].amount : 0;

            // Create payroll for this month
            await pool.query(
                `INSERT INTO payroll (staff_id, role, month, amount, processed_by)
         VALUES ($1, $2, $3, $4, $5)`,
                [staff_id, role, currentMonth, amount, processed_by_user_id]
            );
        }

        return res.status(200).json({
            success: true,
            message: "Payrolls generated for current month",
            month: currentMonth,
        });
    } catch (err) {
        console.error("Payroll generation error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during payroll generation",
        });
    }
};

export const getAllPayrolls = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT * FROM payroll ORDER BY id DESC
    `);
        return res.status(200).json({ payrolls: result.rows });
    } catch (err) {
        console.error("Failed to fetch payrolls", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updatePayroll = async (req, res) => {
    const { payroll_id } = req.params;
    const { month, amount, status } = req.body;
    const paid_by = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE payroll
       SET  month = COALESCE($1, month),
            amount = COALESCE($2, amount),
            status = COALESCE($3, status),
            paid_by = $4,
            updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
            [month, amount, status, paid_by, payroll_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Payroll not found" });
        }

        return res.status(200).json({ message: "Payroll updated", payroll: result.rows[0] });
    } catch (err) {
        console.error("Error updating payroll:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const payPayroll = async (req, res) => {
    const { payroll_id } = req.params;
    const paid_by = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `SELECT * FROM payroll WHERE id = $1`,
            [payroll_id]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Payroll record not found" });
        }

        const payroll = result.rows[0];

        if (payroll.status === "paid") {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Payroll already paid" });
        }

        const updateRes = await client.query(
            `UPDATE payroll
             SET status = 'paid',
                 paid_on = CURRENT_DATE,
                 paid_by = $1,
                 updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [paid_by, payroll_id]
        );

        await client.query(
            `UPDATE finance_balance
             SET total_amount = total_amount - $1`,
            [payroll.amount]
        );

        await client.query('COMMIT');

        return res.status(200).json({
            message: "Payroll marked as paid and amount deducted",
            payroll: updateRes.rows[0],
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Payroll payment error:", err);
        return res.status(500).json({ error: "Server error during payroll payment" });
    } finally {
        client.release();
    }
};

export const getPayrollForUser = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT 
         id, 
         month, 
         amount, 
         paid_on, 
         status, 
         role,
         updated_at,
         processed_by,
         paid_by
       FROM payroll
       WHERE staff_id = $1
       ORDER BY month DESC`,
            [userId]
        );

        res.json({ payroll: result.rows });
    } catch (err) {
        console.error("Error fetching payroll for user:", err);
        res.status(500).json({ message: "Failed to fetch payroll records." });
    }
};

