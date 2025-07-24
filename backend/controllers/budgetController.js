import { pool } from "../config/db.js";

export const getAvailableFunds = async (req, res) => {
    try {
        const result = await pool.query("SELECT total_amount FROM finance_balance LIMIT 1");
        const balance = result.rows[0]?.total_amount ?? 0;
        res.json({ balance });
    } catch (err) {
        console.error("Error fetching funds:", err);
        res.status(500).json({ error: "Failed to fetch available funds." });
    }
};

export const upsertAvailableFund = async (req, res) => {
    const { fiscal_year, total_amount } = req.body;

    if (!fiscal_year || total_amount == null) {
        return res.status(400).json({ error: "Fiscal year and total amount required." });
    }

    try {
        const existing = await pool.query(
            "SELECT * FROM available_funds WHERE fiscal_year = $1",
            [fiscal_year]
        );

        if (existing.rows.length > 0) {
            const result = await pool.query(
                `UPDATE available_funds 
         SET total_amount = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE fiscal_year = $2 
         RETURNING *`,
                [total_amount, fiscal_year]
            );
            return res.json({ message: "Available fund updated.", fund: result.rows[0] });
        } else {
            const result = await pool.query(
                `INSERT INTO available_funds (fiscal_year, total_amount) 
         VALUES ($1, $2) 
         RETURNING *`,
                [fiscal_year, total_amount]
            );
            return res.status(201).json({ message: "Available fund added.", fund: result.rows[0] });
        }
    } catch (err) {
        console.error("Error updating fund:", err);
        res.status(500).json({ error: "Failed to update available fund." });
    }
};


export const allocateDepartmentBudget = async (req, res) => {
    console.log(req.body);
    const { department_id, allocated } = req.body;
    const fiscal_year = new Date().getFullYear();

    if (!department_id || !fiscal_year || allocated == null) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const balanceResult = await pool.query("SELECT total_amount FROM finance_balance LIMIT 1");
        const availableFunds = balanceResult.rows[0]?.total_amount ?? 0;

        if (allocated > availableFunds) {
            return res.status(400).json({ error: "Insufficient funds in finance balance." });
        }

        let result;
        const existing = await pool.query(
            "SELECT * FROM department_budgets WHERE department_id = $1 AND fiscal_year = $2",
            [department_id, fiscal_year]
        );

        if (existing.rows.length > 0) {
            result = await pool.query(
                "UPDATE department_budgets SET allocated = allocated + $1, updated_at = CURRENT_TIMESTAMP WHERE department_id = $2 AND fiscal_year = $3 RETURNING *",
                [allocated, department_id, fiscal_year]
            );
        } else {
            result = await pool.query(
                "INSERT INTO department_budgets (department_id, fiscal_year, allocated) VALUES ($1, $2, $3) RETURNING *",
                [department_id, fiscal_year, allocated]
            );
        }

        await pool.query(
            "UPDATE finance_balance SET total_amount = total_amount - $1",
            [allocated]
        );

        return res.status(200).json({
            message: existing.rows.length > 0 ? "Budget updated." : "Budget allocated.",
            budget: result.rows[0]
        });

    } catch (err) {
        console.error("Budget allocation error:", err);
        res.status(500).json({ error: "Failed to allocate budget." });
    }
};


export const getAllDepartmentBudgets = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT db.id, d.name AS department_name, db.fiscal_year, db.allocated, db.spent
      FROM department_budgets db
      JOIN departments d ON d.id = db.department_id
      ORDER BY db.fiscal_year DESC, d.name
    `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching budgets:", err);
        res.status(500).json({ error: "Failed to fetch budgets." });
    }
};

export const getDepartmentBudgetSummary = async (req, res) => {
    const fiscalYear = new Date().getFullYear();

    try {
        const result = await pool.query(`
            SELECT d.id, d.name,
                   COALESCE(db.allocated, 0) AS allocated_budget,
                   COALESCE(db.spent, 0) AS money_spent
            FROM departments d
            LEFT JOIN department_budgets db
              ON d.id = db.department_id AND db.fiscal_year = $1
            ORDER BY d.name
        `, [fiscalYear]);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching department budget summary:", err);
        res.status(500).json({ error: "Failed to fetch budget summary." });
    }
};
