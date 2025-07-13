import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", protect, authorize("admin", "finance_manager"), registerUser);

export default userRouter;