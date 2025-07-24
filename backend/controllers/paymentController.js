import Razorpay from "razorpay";
import { pool } from "../config/db.js";
import crypto from "crypto";


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrder = async (req, res) => {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    try {
        const options = {
            amount: amount * 100,
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ message: "Order creation failed" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { student_fee_record_id, razorpay_payment_id, amount, user_id } = req.body;
        console.log("student_fee_record_id:", student_fee_record_id);
        console.log("razorpay_payment_id:", razorpay_payment_id);
        console.log("amount:", amount);
        console.log("user_id:", user_id);


        if (!student_fee_record_id || !razorpay_payment_id || !amount || !user_id) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Insert into transactions table
        const insertQuery = `
      INSERT INTO transactions (
        student_fee_record_id, amount, method, payment_reference, status, initiated_by
      )
      VALUES ($1, $2, 'razorpay', $3, 'pending', $4)
      RETURNING id
    `;
        const { rows } = await pool.query(insertQuery, [
            student_fee_record_id,
            amount,
            razorpay_payment_id,
            user_id
        ]);

        const transactionId = rows[0].id;

        // Update student_fee_records.amount_paid and temporary status
        const updateRecordQuery = `
      UPDATE student_fee_records
      SET amount_paid = amount_paid + $1,
          status = CASE
            WHEN amount_paid + $1 >= (
              SELECT fs.amount
              FROM fee_structures fs
              WHERE fs.id = student_fee_records.fee_structure_id
            )
            THEN 'partial'
            ELSE 'partial'
          END
      WHERE id = $2
    `;
        await pool.query(updateRecordQuery, [amount, student_fee_record_id]);

        return res.status(200).json({ message: "Transaction recorded as pending", transactionId });
    } catch (error) {
        console.error("Payment verification failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const approveTransaction = async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_id, admin_user_id } = req.body;

    if (!transaction_id || !admin_user_id) {
      console.log("Missing required fields.");
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Begin transaction
    await client.query("BEGIN");

    // Step 1: Approve the transaction
    const approveQuery = `
      UPDATE transactions
      SET status = 'success',
          approved_by = $1,
          approved_at = now()
      WHERE id = $2
      RETURNING student_fee_record_id, amount
    `;
    const { rows } = await client.query(approveQuery, [admin_user_id, transaction_id]);

    if (rows.length === 0) {
      console.log("❌ Transaction not found in DB.");
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Transaction not found" });
    }

    const { student_fee_record_id, amount } = rows[0];

    // Step 2: Mark fee record as paid (if amount criteria is met)
    const markPaidQuery = `
      UPDATE student_fee_records
      SET status = 'paid'
      WHERE id = $1
        AND amount_paid >= (
          SELECT amount
          FROM fee_structures
          WHERE id = student_fee_records.fee_structure_id
        )
    `;
    await client.query(markPaidQuery, [student_fee_record_id]);

    // Step 3: Add transaction amount to finance_balance
    const updateBalanceQuery = `
      UPDATE finance_balance
      SET total_amount = total_amount + $1
    `;
    await client.query(updateBalanceQuery, [amount]);

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ Transaction approved and balance updated.");
    return res.status(200).json({ message: "Transaction approved and balance updated" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("🔥 Admin approval failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};