import { pool } from "../config/db.js";

export const getDepartmentDashboard = async (req, res) => {
  try {
    // Find department for this HOD
    const { rows } = await pool.query(
      "SELECT * FROM departments WHERE head_id = $1",
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Department not found for this HOD" });
    }
    const department = rows[0];

    // Get department expenses
    const { rows: expenses } = await pool.query(
      "SELECT e.*, u.name as submitted_by_name FROM expenses e JOIN users u ON e.submitted_by = u.id WHERE e.department_id = $1",
      [department.id]
    );

    res.json({
      department: {
        id: department.id,
        name: department.name,
        budget: department.budget
      },
      expenses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


export const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE expenses
       SET status = 'approved',
           approved_by = $1,
           approved_at = NOW()
       WHERE id = $2`,
            [req.user.id, id]
        );

        res.json({ message: "Expense approved." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const rejectExpense = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE expenses
       SET status = 'rejected',
           approved_by = $1,
           approved_at = NOW()
       WHERE id = $2`,
            [req.user.id, id]
        );

        res.json({ message: "Expense rejected." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
