import pg from "pg";
const { Pool } = pg;

import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.postgreDB_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function connectDB() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected.");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    throw error;
  }
}

export { pool };
