import express from "express";
import { getFacultyDashboard, createExpenseRequest } from "../controllers/facultyController.js";
import { authorize, protect } from "../middleware/auth.js";

const facultyRouter = express.Router();

facultyRouter.get("/dashboard", protect, authorize("faculty"), getFacultyDashboard);
facultyRouter.post("/expenses", protect, authorize("faculty"), createExpenseRequest);

export default facultyRouter;