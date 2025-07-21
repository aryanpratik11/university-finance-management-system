import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getAidApplications, getDisbursements, getFees, payFee, submitAidApplication } from "../controllers/studentController.js";
import { getStudentAidApplications, getStudentDisbursements, getStudentFees } from "../controllers/feeController.js";

const studentRouter = express.Router();

studentRouter.get("/allfeest/:id", getStudentFees);
studentRouter.get("/aid-applications/:id", getStudentAidApplications);
studentRouter.get("/disbursements/:id", getStudentDisbursements);

export default studentRouter;
