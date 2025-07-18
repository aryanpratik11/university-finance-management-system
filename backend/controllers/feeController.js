import { pool } from "../config/db.js";

export const addFeeStructure = async (req, res) => {
  const { name, description, amount, due_date } = req.body;

  if (!name || !amount || !due_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO fee_structures (name, description, amount, due_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, amount, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding fee structure:", err);
    res.status(500).json({ error: "Failed to create fee structure", details: err.message });
  }
};


export const getFeeStructures = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM fee_structures ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fee structures" });
  }
};

export const upFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, description, due_date } = req.body;

    // Check if the fee structure exists
    const check = await pool.query(
      `SELECT * FROM fee_structures WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    // Update the fee structure
    const updated = await pool.query(
      `UPDATE fee_structures
       SET name = $1, amount = $2, description = $3, due_date = $4
       WHERE id = $5
       RETURNING *`,
      [name, amount, description, due_date, id]
    );

    res.json({ message: "Fee structure updated", data: updated.rows[0] });
  } catch (error) {
    console.error("Update fee error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const deleteFeeStructure = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM fee_structures WHERE id=$1`, [id]);
    res.json({ message: "Fee structure deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete fee structure" });
  }
};


export const assignFeeSt = async (req, res) => {
  const { student_id, fee_structure_id, status, amount_paid } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO student_fee_records (student_id, fee_structure_id, status, amount_paid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, fee_structure_id, status || 'unpaid', amount_paid || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign fee", details: err.message });
  }
};

export const assignFeeBulk = async (req, res) => {
  console.log("Received payload:", req.body);

  const { department_id, batch, fee_structure_id, status, amount_paid } = req.body;

  if (!fee_structure_id || (!department_id && !batch)) {
    return res.status(400).json({
      error: "Provide fee_structure_id and either department_id, batch, or both"
    });
  }

  try {
    let studentQuery = `SELECT s.id FROM students s JOIN users u ON s.user_id = u.id`;
    const conditions = [];
    const params = [];

    if (department_id) {
      params.push(department_id);
      conditions.push(`u.department_id = $${params.length}`);
    }

    if (batch) {
      params.push(batch);
      conditions.push(`s.batch = $${params.length}`);
    }

    if (conditions.length > 0) {
      studentQuery += " WHERE " + conditions.join(" AND ");
    }

    console.log("Final Query:", studentQuery);
    console.log("With Params:", params);

    const studentsResult = await pool.query(studentQuery, params);

    if (studentsResult.rowCount === 0) {
      return res.status(404).json({ error: "No matching students found" });
    }

    const students = studentsResult.rows;
    console.log("Students Found:", students);

    let successCount = 0;
    const failed = [];

    for (const student of students) {
      try {
        await pool.query(
          `INSERT INTO student_fee_records (student_id, fee_structure_id, status, amount_paid)
           VALUES ($1, $2, $3, $4)`,
          [student.id, fee_structure_id, status || 'unpaid', amount_paid || 0]
        );
        successCount++;
      } catch (err) {
        console.error(`Insert failed for student ID ${student.id}:`, err.message);
        failed.push({ student_id: student.id, error: err.message });
      }
    }

    return res.status(201).json({
      message: `Fee assigned to ${successCount} students`,
      failed
    });

  } catch (err) {
    console.error("Bulk fee assignment failed:", err.message);
    res.status(500).json({ error: "Bulk fee assignment failed", details: err.message });
  }
};


export const assignFeeList = async (req, res) => {
  const { student_ids, fee_structure_id, status, amount_paid } = req.body;

  if (!Array.isArray(student_ids) || student_ids.length === 0 || !fee_structure_id) {
    return res.status(400).json({
      error: "Provide a non-empty array of student_ids and a valid fee_structure_id"
    });
  }

  try {
    const inserts = student_ids.map((id) => {
      return pool.query(
        `INSERT INTO student_fee_records (student_id, fee_structure_id, status, amount_paid)
         VALUES ($1, $2, $3, $4)`,
        [id, fee_structure_id, status || "unpaid", amount_paid || 0]
      );
    });

    await Promise.all(inserts);

    res.status(201).json({
      message: `Fee assigned to ${student_ids.length} students`,
      student_ids
    });
  } catch (err) {
    res.status(500).json({ error: "Custom fee assignment failed", details: err.message });
  }
};

export const getAssignedFees = async (req, res) => {
  try {
    const { student_id, department_id, batch, fee_structure_id, status } = req.query;

    let query = `
      SELECT sfr.*, s.user_id, s.batch, fs.name AS fee_title, u.name AS student_name, d.name AS department_name
      FROM student_fee_records sfr
      JOIN students s ON sfr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN departments d ON u.department_id = d.id
      JOIN fee_structures fs ON sfr.fee_structure_id = fs.id
    `;

    const conditions = [];
    const values = [];

    if (student_id) {
      values.push(student_id);
      conditions.push(`sfr.student_id = $${values.length}`);
    }

    if (department_id) {
      values.push(department_id);
      conditions.push(`u.department_id = $${values.length}`);
    }

    if (batch) {
      values.push(batch);
      conditions.push(`s.batch = $${values.length}`);
    }

    if (fee_structure_id) {
      values.push(fee_structure_id);
      conditions.push(`sfr.fee_structure_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      conditions.push(`sfr.status = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY sfr.created_at DESC";

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);

  } catch (err) {
    console.error("Failed to fetch assigned fee records:", err.message);
    res.status(500).json({ error: "Failed to retrieve assigned fee records" });
  }
};


export const getStudentFees = async (req, res) => {
  const { student_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT sf.*, fs.name AS fee_name, fs.amount AS total_amount
       FROM student_fee_records sf
       JOIN fee_structures fs ON sf.fee_structure_id = fs.id
       WHERE sf.student_id = $1`,
      [student_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student fees" });
  }
};

export const updateStudentFee = async (req, res) => {
  const { id } = req.params;
  const { status, amount_paid } = req.body;
  try {
    const result = await pool.query(
      `UPDATE student_fee_records SET status=$1, amount_paid=$2 WHERE id=$3 RETURNING *`,
      [status, amount_paid, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update fee info" });
  }
};


export const recordTransaction = async (req, res) => {
  const { student_fee_record_id, amount, method, remarks } = req.body;
  const recorded_by = req.user.id;

  if (!student_fee_record_id || !amount) {
    return res.status(400).json({ error: "student_fee_record_id and amount are required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO transactions (student_fee_record_id, amount, method, remarks, recorded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [student_fee_record_id, amount, method, remarks, recorded_by]
    );

    const feeStructure = await client.query(
      `SELECT fs.amount, sfr.amount_paid
       FROM student_fee_records sfr
       JOIN fee_structures fs ON sfr.fee_structure_id = fs.id
       WHERE sfr.id = $1`,
      [student_fee_record_id]
    );

    const { amount: totalAmount, amount_paid } = feeStructure.rows[0];
    const newPaid = amount_paid + amount;
    const status = newPaid >= totalAmount ? 'paid' : 'partial';

    await client.query(
      `UPDATE student_fee_records
       SET amount_paid = $1, status = $2
       WHERE id = $3`,
      [newPaid, status, student_fee_record_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Transaction recorded and fee status updated.",
      transaction: insertResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Transaction failed", details: err.message });
  } finally {
    client.release();
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*, 
        fs.name AS fee_name, 
        u.name AS student_name,
        sfr.amount_paid,
        sfr.status AS fee_status
      FROM transactions t
      JOIN student_fee_records sfr ON t.student_fee_record_id = sfr.id
      JOIN students s ON sfr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN fee_structures fs ON sfr.fee_structure_id = fs.id
      ORDER BY t.payment_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const getStudentTransactions = async (req, res) => {
  const { student_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
         t.*, 
         fs.name AS fee_name, 
         u.name AS student_name,
         sfr.amount_paid,
         sfr.status AS fee_status
       FROM transactions t
       JOIN student_fee_records sfr ON t.student_fee_record_id = sfr.id
       JOIN fee_structures fs ON sfr.fee_structure_id = fs.id
       JOIN students s ON sfr.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1
       ORDER BY t.payment_date DESC`,
      [student_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student transactions" });
  }
};