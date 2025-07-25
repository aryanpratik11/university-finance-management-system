import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import facultyRouter from "./routes/facultyRouter.js";
import finmanRouter from "./routes/finmanRouter.js";
import staffRouter from "./routes/staffRouter.js";
import studentRouter from "./routes/studentRouter.js";
import departRouter from "./routes/departmentRouter.js";
import paymentRouter from "./routes/paymentRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "https://acadmivault-ufm.onrender.com",
    credentials: true
}));

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/finance-manager", finmanRouter);
app.use("/api/staff", staffRouter);
app.use("/api/student", studentRouter);
app.use("/api/hod", departRouter);
app.use("/api/payment", paymentRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
});
