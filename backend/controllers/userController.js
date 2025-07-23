import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    let student_id = null;

    if (user.role === "student") {
        const studentRes = await pool.query(
            "SELECT id FROM students WHERE user_id = $1",
            [user.id]
        );
        student_id = studentRes.rows[0]?.id;
    }

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
                is_active: user.is_active,
                ...(student_id && { student_id }),
            },
        });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logged Out" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "logout error" });
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
            if (!studentData || !studentData.enrollment_no || !studentData.batch) {
                return res.status(400).json({ error: "Missing student details" });
            }

            await pool.query(
                `INSERT INTO students (user_id, enrollment_no, batch)
         VALUES ($1, $2, $3)`,
                [user.id, studentData.enrollment_no, studentData.batch]
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

export const addUsersBulk = async (req, res) => {
    const client = await pool.connect();
    try {
        const { users } = req.body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: "No users provided" });
        }

        await client.query("BEGIN");

        for (const u of users) {
            const { name, email, password, role, department_id, studentData } = u;

            const { rows: existing } = await client.query(
                "SELECT id FROM users WHERE email = $1",
                [email]
            );
            if (existing.length > 0) {
                throw new Error(`User already exists: ${email}`);
            }

            const hashed = await bcrypt.hash(password, 10);

            const userResult = await client.query(
                `INSERT INTO users (name, email, password, role, department_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
                [name, email, hashed, role, department_id]
            );

            const userId = userResult.rows[0].id;

            if (role === "student") {
                if (!studentData || !studentData.enrollment_no || !studentData.batch) {
                    throw new Error(`Missing student details for ${email}`);
                }
                await client.query(
                    `INSERT INTO students (user_id, enrollment_no, batch)
           VALUES ($1, $2, $3)`,
                    [userId, studentData.enrollment_no, studentData.batch]
                );
            }
        }

        await client.query("COMMIT");
        res.json({ message: "All users created successfully" });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Bulk insert error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, role, department_id, studentData } = req.body;

    try {
        const { rows: existing } = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        await pool.query(
            `UPDATE users 
       SET name = $1, email = $2, role = $3, department_id = $4
       WHERE id = $5`,
            [name, email, role, department_id, userId]
        );

        const { rows: studentRows } = await pool.query(
            "SELECT * FROM students WHERE user_id = $1",
            [userId]
        );

        if (role === "student") {
            if (studentRows.length === 0) {
                if (!studentData || !studentData.enrollment_no || !studentData.batch) {
                    return res.status(400).json({ error: "Missing student details" });
                }
                await pool.query(
                    `INSERT INTO students (user_id, enrollment_no, batch)
           VALUES ($1, $2, $3)`,
                    [userId, studentData.enrollment_no, studentData.batch]
                );
            } else {
                await pool.query(
                    `UPDATE students 
           SET enrollment_no = $1, batch = $2
           WHERE user_id = $3`,
                    [studentData.enrollment_no, studentData.batch, userId]
                );
            }
        } else {
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
        const { rows: existing } = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        await pool.query(
            "DELETE FROM students WHERE user_id = $1",
            [userId]
        );

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

export const filterUsers = async (req, res) => {
    const { departmentId, category } = req.query;

    try {
        let result;

        if (departmentId) {
            result = await pool.query(
                `
        SELECT 
          u.*,
          s.batch
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        WHERE u.department_id = $1
          AND u.role IN ('hod', 'faculty', 'student')
        ORDER BY 
          CASE 
            WHEN u.role = 'hod' THEN 1
            WHEN u.role = 'faculty' THEN 2
            WHEN u.role = 'student' THEN 3
            ELSE 4
          END
        `,
                [departmentId]
            );
        } else if (category === "administration") {
            result = await pool.query(
                `
        SELECT * FROM users
        WHERE role IN ('admin', 'finance_manager', 'staff')
        ORDER BY role
        `
            );
        } else if (category === "others") {
            result = await pool.query(
                `
        SELECT 
          u.*,
          s.batch
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        WHERE u.role IN ('faculty', 'student')
          AND u.department_id IS NULL
        ORDER BY role
        `
            );
        } else {
            return res.status(400).json({ message: "Invalid filter" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getDepartmentById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM departments WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Department not found" });
    res.json(rows[0]);
};

export const getAllDepartment = async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM departments");
    if (rows.length === 0) return res.status(404).json({ message: "Departments not found" });
    res.json(rows);
};