import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);

export default userRouter;