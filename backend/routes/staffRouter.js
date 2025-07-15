import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import { getUserPayroll } from "../controllers/payrollController.js";

const staffRouter = express.Router();

staffRouter.get("/payroll", protect, authorize("staff"), async (req, res, next) => {
    try {
        // Internally call getUserPayroll using req.user.id
        req.params.staff_id = req.user.id;
        await getUserPayroll(req, res);
    } catch (err) {
        next(err);
    }
});

export default staffRouter;