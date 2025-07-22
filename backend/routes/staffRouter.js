import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import { getPayrollForUser } from "../controllers/payrollController.js";

const staffRouter = express.Router();

staffRouter.get("/payroll/:user_id", protect, authorize("staff"), getPayrollForUser);

export default staffRouter;