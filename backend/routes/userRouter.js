import express from "express";
import { loginUser, logoutUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

export default userRouter;