import { pool } from "../config/db.js";

export const addIncomeSource = async (req, res) => {
    const { source_name, description, amount, received_date, recorded_by } = req.body;

    console.log(req.body);

    if (!source_name || !amount || !received_date || !recorded_by) {
        return res.status(400).json({ error: "source_name, amount, received_date, and recorded_by are required." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO income_sources (source_name, amount, received_date, description, recorded_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [source_name, amount, received_date, description, recorded_by]
        );

        await pool.query(
            `UPDATE finance_balance
             SET total_amount = total_amount + $1
             WHERE id = 1`,
            [amount]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error adding income_sources source:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getAllIncomeSources = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
         income_sources.id, income_sources.source_name, income_sources.amount, income_sources.received_date, 
         income_sources.recorded_by, users.name AS recorded_by_name 
       FROM income_sources 
       LEFT JOIN users ON income_sources.recorded_by = users.id 
       ORDER BY income_sources.received_date DESC`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching income_sources sources:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
