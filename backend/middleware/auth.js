import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Not authorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [decoded.id]
        );
        if (rows.length === 0) return res.status(401).json({ error: "User not found" });

        req.user = rows[0];
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ error: "Token failed" });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        console.log("authorize(): req.user =", req.user);
        console.log("authorize(): allowed roles =", roles);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};