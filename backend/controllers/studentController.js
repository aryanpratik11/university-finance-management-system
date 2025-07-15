// controllers/studentController.js
import { pool } from "../config/db.js";

// GET /api/student/fees
export const getFees = async (req, res) => {
    const { id } = req.user;
    const { rows } = await pool.query(
        `SELECT * FROM fees WHERE student_id = $1 ORDER BY due_date`,
        [id]
    );
    res.json({ fees: rows });
};

// POST /api/student/fees/:id/pay
export const payFee = async (req, res) => {
    const feeId = req.params.id;
    const { id } = req.user;
    await pool.query(
        `UPDATE fees
     SET status = 'paid',
         paid_at = NOW()
     WHERE id = $1 AND student_id = $2`,
        [feeId, id]
    );
    res.json({ message: "Fee marked as paid." });
};

// GET /api/student/aid-applications
export const getAidApplications = async (req, res) => {
    const { id } = req.user;
    const { rows } = await pool.query(
        `SELECT * FROM student_aid_applications WHERE student_id = $1 ORDER BY submitted_at DESC`,
        [id]
    );
    res.json({ applications: rows });
};

// POST /api/student/aid-applications
export const submitAidApplication = async (req, res) => {
    const { id } = req.user;
    const { aid_type, amount_requested, description } = req.body;
    await pool.query(
        `INSERT INTO student_aid_applications (student_id, aid_type, amount_requested, description)
     VALUES ($1, $2, $3, $4)`,
        [id, aid_type, amount_requested, description]
    );
    res.json({ message: "Aid application submitted." });
};

// GET /api/student/disbursements
export const getDisbursements = async (req, res) => {
    const { id } = req.user;
    const { rows } = await pool.query(
        `SELECT d.*, a.aid_type
     FROM aid_disbursements d
     LEFT JOIN student_aid_applications a
     ON d.aid_application_id = a.id
     WHERE d.student_id = $1
     ORDER BY disbursed_at DESC`,
        [id]
    );
    res.json({ disbursements: rows });
};
