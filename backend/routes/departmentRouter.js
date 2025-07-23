import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { approveExpense, getDepartmentDashboard, rejectExpense } from "../controllers/departmentControllers.js";
import { deptApproveExpense, getAllExpenses, getDepartmentExpenses, updateExpenseStatus } from "../controllers/expenseController.js";

const departRouter = express.Router();

departRouter.get("/dashboard", protect, authorize("hod"), getDepartmentDashboard);
departRouter.get("/expenses", protect, authorize("hod"), getDepartmentExpenses);
departRouter.put("/expenses/:id/status", protect, authorize("hod"), deptApproveExpense);

export default departRouter;
