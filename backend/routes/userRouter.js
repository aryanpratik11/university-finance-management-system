import express from "express";
import { loginUser, logoutUser, toggleUserActiveStatus } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

userRouter.patch('/active/:id', toggleUserActiveStatus);

export default userRouter;