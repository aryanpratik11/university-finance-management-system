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
    const { name, email, password, role, department_id } = req.body;

    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (rows.length > 0) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
        "INSERT INTO users (name, email, password, role, department_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role",
        [name, email, hashed, role, department_id]
    );

    res.status(201).json(result.rows[0]);
};