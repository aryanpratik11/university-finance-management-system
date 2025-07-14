import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { deleteUser, getAllUsers, registerUser, updateUser } from "../controllers/userController.js";

const adminRouter = express.Router();

adminRouter.get("/allusers", protect, authorize("admin"), getAllUsers);
adminRouter.post("/adduser", protect, authorize("admin"), registerUser);
adminRouter.put("/upuser/:id", protect, authorize("admin"), updateUser);
adminRouter.delete("/deluser/:id",protect, authorize("admin"), deleteUser );

export default adminRouter;