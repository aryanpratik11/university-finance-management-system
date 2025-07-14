import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, password, role, department_id, studentData } = req.body;

    try {
        const { rows: existing } = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department_id`,
            [name, email, hashed, role, department_id]
        );

        const user = userResult.rows[0];

        if (role === "student") {
            if (!studentData || !studentData.enrollment_no || !studentData.program || !studentData.admission_date) {
                return res.status(400).json({ error: "Missing student details" });
            }

            await pool.query(
                `INSERT INTO students (user_id, enrollment_no, program, admission_date)
         VALUES ($1, $2, $3, $4)`,
                [user.id, studentData.enrollment_no, studentData.program, studentData.admission_date]
            );
        }

        res.status(201).json({ message: "User created successfully", user });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAllUsers = async (req, res) => {
    const { rows } = await pool.query("SELECT id, name, email, role, department_id FROM users");
    res.json(rows);
};

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, role, department_id, studentData } = req.body;

    try {
        // 1. Check if user exists
        const { rows: existing } = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Update users table
        await pool.query(
            `UPDATE users 
       SET name = $1, email = $2, role = $3, department_id = $4
       WHERE id = $5`,
            [name, email, role, department_id, userId]
        );

        // 3. Handle student record
        const { rows: studentRows } = await pool.query(
            "SELECT * FROM students WHERE user_id = $1",
            [userId]
        );

        if (role === "student") {
            if (studentRows.length === 0) {
                // Insert new student record if missing
                if (!studentData || !studentData.enrollment_no || !studentData.program || !studentData.admission_date) {
                    return res.status(400).json({ error: "Missing student details" });
                }
                await pool.query(
                    `INSERT INTO students (user_id, enrollment_no, program, admission_date)
           VALUES ($1, $2, $3, $4)`,
                    [userId, studentData.enrollment_no, studentData.program, studentData.admission_date]
                );
            } else {
                // Update existing student record
                await pool.query(
                    `UPDATE students 
           SET enrollment_no = $1, program = $2, admission_date = $3
           WHERE user_id = $4`,
                    [studentData.enrollment_no, studentData.program, studentData.admission_date, userId]
                );
            }
        } else {
            // If role is no longer student, remove student record
            if (studentRows.length > 0) {
                await pool.query(
                    "DELETE FROM students WHERE user_id = $1",
                    [userId]
                );
            }
        }

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // 1. Check if user exists
        const { rows: existing } = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Remove student record if exists
        await pool.query(
            "DELETE FROM students WHERE user_id = $1",
            [userId]
        );

        // 3. Delete user
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userId]
        );

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Server error" });
    }
};
