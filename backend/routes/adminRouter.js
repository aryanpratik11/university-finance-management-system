import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { addUsersBulk, deleteUser, filterUsers, getAllUsers, getDepartmentById, registerUser, updateUser } from "../controllers/userController.js";
import { createInvoice, createPayment, deleteInvoice, getAllInvoices, getAllPayments, updateInvoiceStatus } from "../controllers/transController.js";

const adminRouter = express.Router();

adminRouter.get("/allusers", protect, authorize("admin"), getAllUsers);
adminRouter.get("/users/filter", protect, authorize("admin"), filterUsers);
adminRouter.get("/departments/:id", protect, authorize("admin"), getDepartmentById);
adminRouter.post("/adduser", protect, authorize("admin"), registerUser);
adminRouter.post("/adduser/bulk", protect, authorize("admin"), addUsersBulk);
adminRouter.put("/upuser/:id", protect, authorize("admin"), updateUser);
adminRouter.delete("/deluser/:id", protect, authorize("admin"), deleteUser);

adminRouter.get("/allinvoices", protect, authorize("admin"), getAllInvoices);
adminRouter.post("/addinvoice", protect, authorize("admin"), createInvoice);
adminRouter.put("/upinvoice/:id", protect, authorize("admin"), updateInvoiceStatus);
adminRouter.delete("/delinvoice/:id", protect, authorize("admin"), deleteInvoice);

adminRouter.get("/allpays", protect, authorize("admin"), getAllPayments);
adminRouter.post("/addpay", protect, authorize("admin"), createPayment);

export default adminRouter;