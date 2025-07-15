import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { approveExpense, getDepartmentDashboard, rejectExpense } from "../controllers/departmentControllers.js";

const departRouter = express.Router();

departRouter.get("/dashboard", protect, authorize("hod"), getDepartmentDashboard);
departRouter.put("/expenses/:id/approve", protect, authorize("hod"), approveExpense);
departRouter.put("/expenses/:id/reject", protect, authorize("hod"), rejectExpense);

export default departRouter;
