import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getAidApplications, getDisbursements, getFees, payFee, submitAidApplication } from "../controllers/studentController.js";

const studentRouter = express.Router();

studentRouter.use(protect, authorize("student"));

studentRouter.get("/fees", getFees);
studentRouter.post("/fees/:id/pay", payFee);

studentRouter.get("/aid-applications", getAidApplications);
studentRouter.post("/aid-applications", submitAidApplication);

studentRouter.get("/disbursements", getDisbursements);

export default studentRouter;
