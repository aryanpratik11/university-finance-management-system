import express from "express";
import { getFacultyDashboard, createExpenseRequest } from "../controllers/facultyController.js";
import { authorize, protect } from "../middleware/auth.js";
import { getMyExpenses, submitExpense } from "../controllers/expenseController.js";

const facultyRouter = express.Router();

facultyRouter.get("/dashboard", protect, authorize("faculty"), getFacultyDashboard);
facultyRouter.post("/expenses", protect, authorize("faculty"), submitExpense);
facultyRouter.get("/expenses", protect, authorize("faculty"), getMyExpenses);

export default facultyRouter;