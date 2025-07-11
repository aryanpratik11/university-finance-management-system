import express from "express";
import bodyParser from "body-parser";
import PDFDocument from 'pdfkit';
import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "college_finance",
  password: "1175",
  port: 5432,
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

pool.connect();

app.use(express.static("public"));
app.set('view engine', 'ejs');



app.get('/', async (req, res) => {
  try {
    const studentCountResult = await pool.query('SELECT COUNT(*) FROM students');
    const studentCount = studentCountResult.rows[0].count;

    const facultyCountResult = await pool.query('SELECT COUNT(*) FROM staff WHERE staffid::text LIKE $1', ['10%']);
    const facultyCount = facultyCountResult.rows[0].count;

    const otherStaffCountResult = await pool.query('SELECT COUNT(*) FROM staff WHERE staffid::text NOT LIKE $1', ['10%']);
    const otherStaffCount = otherStaffCountResult.rows[0].count;

    const totalExpensesResult = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM departmentexpenses');
    const totalExpenses = totalExpensesResult.rows[0].total_expenses;

    const totalFeesRevenueResult = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total_fees_revenue FROM fees');
    const totalFeesRevenue = parseInt(totalFeesRevenueResult.rows[0].total_fees_revenue);

    const totalFundsAmountResult = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total_funds_amount FROM funds');
    const totalFundsAmount = parseInt(totalFundsAmountResult.rows[0].total_funds_amount);

    const totalRevenue = totalFeesRevenue + totalFundsAmount;

    res.render('index', {
      student_count: studentCount,
      faculty_count: facultyCount,
      other_staff_count: otherStaffCount,
      total_expenses: totalExpenses,
      total_revenue: totalRevenue
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});
app.get('/students', (req, res) => { res.render('students'); });
app.get('/fees', (req, res) => { res.render('fees'); });
app.get('/funds', (req, res) => { res.render('funds'); });
app.get('/transactions', (req, res) => { res.render('transactions'); });
app.get('/staff', (req, res) => { res.render('staff'); });
app.get('/salaries', (req, res) => { res.render('salaries'); });
app.get('/departments', (req, res) => { res.render('departments'); });
app.get('/departmentExpenses', (req, res) => { res.render('dexpenses'); });



app.post('/students/insert', async (req, res) => {
  try {
    const { studentid, name, department, batchnumber } = req.body;
    const sql = 'INSERT INTO students (studentid, name, department, batchnumber) VALUES ($1, $2, $3, $4)';
    const values = [studentid, name, department, batchnumber];
    await pool.query(sql, values);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting student:', error);
    res.status(500).send('Error inserting student');
  }
});
app.post('/students/delete', async (req, res) => {
  try {
    const { studentid } = req.body;
    const sql = 'DELETE FROM students WHERE studentid = $1';
    const values = [studentid];
    const result = await pool.query(sql, values);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).send('Error deleting student');
  }
});
app.post('/students/modify', async (req, res) => {
  try {
    const { studentid, name, department, batchnumber } = req.body;
    const result = await pool.query('UPDATE students SET name = $1, department = $2, batchnumber = $3 WHERE studentid = $4 RETURNING *', [name, department, batchnumber, studentid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying student:', error);
    res.status(500).send('Error modifying student');
  }
});
app.post('/students/retrieve', async (req, res) => {
  try {
    const { studentid } = req.body;
    const result = await pool.query('SELECT * FROM students WHERE studentid = $1', [studentid]);
    res.render('studentshow', { students: result.rows });
  } catch (error) {
    console.error('Error retrieving student:', error);
    res.status(500).send('Error retrieving student');
  }
});
app.get('/students/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY studentid ASC;');
    res.render('studentshow', { students: result.rows });
  } catch (error) {
    console.error('Error retrieving all students:', error);
    res.status(500).send('Error retrieving all students');
  }
});



app.post('/fees/insert', async (req, res) => {
  try {
    const { feeid, studentid, amount, feetype, description, dateadded, transactionid } = req.body;
    const result = await pool.query('INSERT INTO fees (feeid, studentid, amount, feetype, description, dateadded, transactionid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [feeid, studentid, amount, feetype, description, dateadded, transactionid]);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting fee:', error);
    res.status(500).send('Error inserting fee');
  }
});
app.post('/fees/modify', async (req, res) => {
  try {
    const { feeid, studentid, amount, feetype, description, dateadded, transactionid } = req.body;
    const result = await pool.query('UPDATE fees SET studentid = $1, amount = $2, feetype = $3, description = $4, dateadded = $5, transactionid = $6 WHERE feeid = $7 RETURNING *', [studentid, amount, feetype, description, dateadded, transactionid, feeid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying fee:', error);
    res.status(500).send('Error modifying fee');
  }
});
app.post('/fees/delete', async (req, res) => {
  try {
    const { feeid } = req.body;
    const result = await pool.query('DELETE FROM fees WHERE feeid = $1 RETURNING *', [feeid]);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).send('Error deleting fee');
  }
});
app.post('/fees/retrieve', async (req, res) => {
  try {
    const { feeid } = req.body;
    const result = await pool.query('SELECT fees.*, students.name AS student_name, students.department AS student_department FROM fees INNER JOIN students ON fees.studentid = students.studentid WHERE feeid = $1', [feeid]);
    res.render('feesshow', { fees: result.rows });
  } catch (error) {
    console.error('Error retrieving fee:', error);
    res.status(500).send('Error retrieving fee');
  }
});
app.get('/fees/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT fees.*, students.name AS student_name, students.department AS student_department FROM fees INNER JOIN students ON fees.studentid = students.studentid');
    res.render('feesshow', { fees: result.rows });
  } catch (error) {
    console.error('Error retrieving all fees:', error);
    res.status(500).send('Error retrieving all fees');
  }
});



app.post('/funds/insert', async (req, res) => {
  try {
    const { fundid, source, amount, description, date_received, transactionid } = req.body;
    const result = await pool.query('INSERT INTO funds (fundid, source, amount, description, datereceived, transactionid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [fundid, source, amount, description, date_received, transactionid]);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting fund data:', error);
    res.status(500).send('Error inserting fund data');
  }
});
app.post('/funds/delete', async (req, res) => {
  try {
    const { fundid } = req.body;
    const result = await pool.query('DELETE FROM funds WHERE fundid = $1 RETURNING *', [fundid]);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting fund data:', error);
    res.status(500).send('Error deleting fund data');
  }
});
app.post('/funds/modify', async (req, res) => {
  try {
    const { fundid, amount, source, description, datereceived } = req.body;
    const result = await pool.query('UPDATE funds SET amount = $1, source = $2, description = $3, datereceived = $4 WHERE fundid = $5 RETURNING *', [amount, source, description, datereceived, fundid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying fund:', error);
    res.status(500).send('Error modifying fund');
  }
});
app.post('/funds/retrieve', async (req, res) => {
  try {
    const { fundid } = req.body;
    const result = await pool.query('SELECT f.*, t.transactionid FROM funds f JOIN transactions t ON f.transactionid = t.transactionid WHERE fundid = $1', [fundid]);
    res.render('fundsshow', { funds: result.rows });
  } catch (error) {
    console.error('Error retrieving fund:', error);
    res.status(500).send('Error retrieving fund');
  }
});
app.get('/funds/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT f.*, t.transactionid FROM funds f JOIN transactions t ON f.transactionid = t.transactionid');
    res.render('fundsshow', { funds: result.rows });
  } catch (error) {
    console.error('Error retrieving all funds:', error);
    res.status(500).send('Error retrieving all funds');
  }
});



app.post('/transactions/insert', async (req, res) => {
  try {
    const { transactionid, amount, transactiontype, description, dateadded } = req.body;
    const result = await pool.query('INSERT INTO transactions (transactionid, amount, transactiontype, description, dateadded) VALUES ($1, $2, $3, $4, $5) RETURNING *', [transactionid, amount, transactiontype, description, dateadded]);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting transaction:', error);
    res.status(500).send('Error inserting transaction');
  }
});
app.post('/transactions/delete', async (req, res) => {
  try {
    const { transactionid } = req.body;
    const result = await pool.query('DELETE FROM transactions WHERE transactionid = $1 RETURNING *', [transactionid]);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).send('Error deleting transaction');
  }
});
app.post('/transactions/modify', async (req, res) => {
  try {
    const { transactionid, amount, transactiontype, description, dateadded } = req.body;
    const result = await pool.query('UPDATE transactions SET amount = $1, transactiontype = $2, description = $3, dateadded = $4 WHERE transactionid = $5 RETURNING *', [amount, transactiontype, description, dateadded, transactionid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying transaction:', error);
    res.status(500).send('Error modifying transaction');
  }
});
app.post('/transactions/retrieve', async (req, res) => {
  try {
    const { transactionid } = req.body;
    const result = await pool.query('SELECT * FROM transactions WHERE transactionid = $1', [transactionid]);
    res.render('transacshow', { transactions: result.rows });
  } catch (error) {
    console.error('Error retrieving transaction:', error);
    res.status(500).send('Error retrieving transaction');
  }
});
app.get('/transactions/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions');
    res.render('transacshow', { transactions: result.rows });
  } catch (error) {
    console.error('Error retrieving all transactions:', error);
    res.status(500).send('Error retrieving all transactions');
  }
});



app.post('/staff/insert', async (req, res) => {
  try {
    const { staffid, name, departmentid } = req.body;
    const result = await pool.query('INSERT INTO staff (staffid, name, departmentid) VALUES ($1, $2, $3) RETURNING *', [staffid, name, departmentid]);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting staff:', error);
    res.status(500).send('Error inserting staff');
  }
});
app.post('/staff/delete', async (req, res) => {
  try {
    const { staffid } = req.body;
    const result = await pool.query('DELETE FROM staff WHERE staffid = $1 RETURNING *', [staffid]);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).send('Error deleting staff');
  }
});
app.post('/staff/modify', async (req, res) => {
  try {
    const { staffid, name, departmentid } = req.body;
    const result = await pool.query('UPDATE staff SET name = $1, departmentid = $2 WHERE staffid = $3 RETURNING *', [name, departmentid, staffid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying staff:', error);
    res.status(500).send('Error modifying staff');
  }
});
app.post('/staff/retrieve', async (req, res) => {
  try {
    const { staffid } = req.body;
    const result = await pool.query('SELECT s.staffid, s.name AS staff_name, d.departmentid, d.departmentname AS department_name FROM staff s INNER JOIN departments d ON s.departmentid = d.departmentid WHERE s.staffid = $1', [staffid]);
    res.render('staffshow', { staff: result.rows });
  } catch (error) {
    console.error('Error retrieving staff:', error);
    res.status(500).send('Error retrieving staff');
  }
});
app.get('/staff/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT s.staffid, s.name AS staff_name, d.departmentid, d.departmentname AS department_name FROM staff s INNER JOIN departments d ON s.departmentid = d.departmentid');
    res.render('staffshow', { staff: result.rows });
  } catch (error) {
    console.error('Error retrieving all staff:', error);
    res.status(500).send('Error retrieving all staff');
  }
});



app.post('/salaries/insert', async (req, res) => {
  try {
    const { salaryid, staffid, amount, description, dateadded, transactionid } = req.body;
    const result = await pool.query('INSERT INTO salaries (salaryid, staffid, amount, description, dateadded, transactionid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [salaryid, staffid, amount, description, dateadded, transactionid]);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting salary:', error);
    res.status(500).send('Error inserting salary');
  }
});
app.post('/salaries/modify', async (req, res) => {
  try {
    const { salaryid, staffid, amount, description, dateadded, transactionid } = req.body;
    const result = await pool.query('UPDATE salaries SET staffid = $1, amount = $2, description = $3, dateadded = $4, transactionid = $5 WHERE salaryid = $6 RETURNING *', [staffid, amount, description, dateadded, transactionid, salaryid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying salary:', error);
    res.status(500).send('Error modifying salary');
  }
});
app.post('/salaries/delete', async (req, res) => {
  try {
    const { salaryid } = req.body;
    const result = await pool.query('DELETE FROM salaries WHERE salaryid = $1 RETURNING *', [salaryid]);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting salary:', error);
    res.status(500).send('Error deleting salary');
  }
});
app.get('/salaries/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT s.*, st.name AS staff_name, d.departmentname FROM salaries s JOIN staff st ON s.staffid = st.staffid JOIN departments d ON st.departmentid = d.departmentid');
    res.render('salaryshow', { salaries: result.rows });
  } catch (error) {
    console.error('Error retrieving all salaries:', error);
    res.status(500).send('Error retrieving all salaries');
  }
});
app.post('/salaries/retrieve', async (req, res) => {
  try {
    const { staffid } = req.body;
    const result = await pool.query('SELECT s.*, st.name AS staff_name, d.departmentname FROM salaries s JOIN staff st ON s.staffid = st.staffid JOIN departments d ON st.departmentid = d.departmentid WHERE s.staffid = $1', [staffid]);
    res.render('salaryshow', { salaries: result.rows });
  } catch (error) {
    console.error('Error retrieving salary:', error);
    res.status(500).send('Error retrieving salary');
  }
});



app.post('/departments/insert', async (req, res) => {
  try {
    const { departmentid, departmentname, budget } = req.body;
    const result = await pool.query('INSERT INTO departments (departmentid, departmentname, budget) VALUES ($1, $2, $3) RETURNING *', [departmentid, departmentname, budget]);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting department:', error);
    res.status(500).send('Error inserting department');
  }
});
app.post('/departments/delete', async (req, res) => {
  try {
    const { departmentid } = req.body;
    const result = await pool.query('DELETE FROM departments WHERE departmentid = $1 RETURNING *', [departmentid]);
    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).send('Error deleting department');
  }
});
app.post('/departments/modify', async (req, res) => {
  try {
    const { departmentid, departmentname, budget } = req.body;
    const result = await pool.query('UPDATE departments SET departmentname = $1, budget = $2 WHERE departmentid = $3 RETURNING *', [departmentname, budget, departmentid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying department:', error);
    res.status(500).send('Error modifying department');
  }
});
app.post('/departments/retrieve', async (req, res) => {
  try {
    const { departmentid } = req.body;
    const result = await pool.query('SELECT * FROM departments WHERE departmentid = $1', [departmentid]);
    res.render('deptshow', { data: result.rows });
  } catch (error) {
    console.error('Error retrieving department:', error);
    res.status(500).send('Error retrieving department');
  }
});
app.get('/departments/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments');
    res.render('deptshow', { data: result.rows });
  } catch (error) {
    console.error('Error retrieving all departments:', error);
    res.status(500).send('Error retrieving all departments');
  }
});



async function calculateRemainingPurse(departmentid) {
  try {
    const totalExpensesResult = await pool.query('SELECT SUM(amount) AS total_expenses FROM departmentexpenses WHERE departmentid = $1', [departmentid]);
    const totalExpenses = totalExpensesResult.rows[0].total_expenses || 0;

    const departmentBudgetResult = await pool.query('SELECT budget FROM departments WHERE departmentid = $1', [departmentid]);
    const departmentBudget = departmentBudgetResult.rows[0].budget || 0;

    return departmentBudget - totalExpenses;
  } catch (error) {
    console.error('Error calculating remaining purse:', error);
    throw error;
  }
}
async function updateRemainingPurse(departmentid, remainingPurse) {
  try {
    await pool.query('UPDATE departmentexpenses SET remaining_purse = $1 WHERE departmentid = $2', [remainingPurse, departmentid]);
  } catch (error) {
    console.error('Error updating remaining purse:', error);
    throw error;
  }
}
app.post('/dexpenses/insert', async (req, res) => {
  try {
    const { expenseid, departmentid, amount, description, dateadded, transactionid } = req.body;
    const result = await pool.query('INSERT INTO departmentexpenses (expenseid, departmentid, amount, description, dateadded, transactionid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [expenseid, departmentid, amount, description, dateadded, transactionid]);
    // Calculate remaining purse
    const remainingPurse = await calculateRemainingPurse(departmentid);
    await updateRemainingPurse(departmentid, remainingPurse);
    console.log('Data inserted successfully');
    res.send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting department expense:', error);
    res.status(500).send('Error inserting department expense');
  }
});
app.post('/dexpenses/modify', async (req, res) => {
  try {
    const { expenseid, departmentid, amount, description, dateadded, transactionid } = req.body;
    const result = await pool.query('UPDATE departmentexpenses SET departmentid = $1, amount = $2, description = $3, dateadded = $4, transactionid = $5 WHERE expenseid = $6 RETURNING *', [departmentid, amount, description, dateadded, transactionid, expenseid]);
    console.log('Data updated successfully');
    res.send('Data updat successfully');
  } catch (error) {
    console.error('Error modifying department expense:', error);
    res.status(500).send('Error modifying department expense');
  }
});
app.post('/dexpenses/delete', async (req, res) => {
  try {
    const { expenseid, departmentid } = req.body;
    const result = await pool.query('DELETE FROM departmentexpenses WHERE expenseid = $1 RETURNING *', [expenseid]);

    // Calculate remaining purse and add the deducted value back
    const remainingPurse = await calculateRemainingPurse(departmentid);
    await updateRemainingPurse(departmentid, remainingPurse);

    if (result.rowCount === 1) {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    } else {
      console.log('No data found for deletion');
      res.status(404).send('No data found for deletion');
    }
  } catch (error) {
    console.error('Error deleting department expense:', error);
    res.status(500).send('Error deleting department expense');
  }
});
app.post('/dexpenses/retrieve', async (req, res) => {
  try {
    const { expenseid } = req.body;
    const result = await pool.query('SELECT d.*, de.departmentname FROM departmentexpenses d INNER JOIN departments de ON d.departmentid = de.departmentid WHERE expenseid = $1', [expenseid]);
    res.render('dexpensesshow', { data: result.rows });
  } catch (error) {
    console.error('Error retrieving department expense:', error);
    res.status(500).send('Error retrieving department expense');
  }
});
app.get('/dexpenses/retrieveAll', async (req, res) => {
  try {
    const result = await pool.query('SELECT d.*, de.departmentname FROM departmentexpenses d INNER JOIN departments de ON d.departmentid = de.departmentid ORDER BY expenseid ASC');
    res.render('dexpensesshow', { data: result.rows });
  } catch (error) {
    console.error('Error retrieving all department expenses:', error);
    res.status(500).send('Error retrieving all department expenses');
  }
});



app.post('/generate-pdf', (req, res) => {
  const { content } = req.body;

  const doc = new PDFDocument();

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="receipt.pdf"');

  // Pipe PDF to response
  doc.pipe(res);

  // Add content to PDF
  doc.text(content);

  // End the document
  doc.end();
});



app.listen(port, () => {
  console.log("port is running");
});