import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { approveExpense, getBudgets, getPayrollSummary, getPendingExpenses, rejectExpense } from "../controllers/expenseController.js";

const finmanRouter = express.Router();

finmanRouter.get("/expenses", protect, authorize("finance_manager"), getPendingExpenses);
finmanRouter.put("/expenses/:id/approve", protect, authorize("finance_manager"), approveExpense);
finmanRouter.put("/expenses/:id/reject", protect, authorize("finance_manager"), rejectExpense);

finmanRouter.get("/payroll-summary", protect, authorize("finance_manager"), getPayrollSummary);

finmanRouter.get("/budgets", protect, authorize("finance_manager"), getBudgets);

export default finmanRouter;
