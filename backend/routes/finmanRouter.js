import express from "express";
import { protect, authorize } from "../middleware/auth.js";

const finmanRouter = express.Router();



export default finmanRouter;
