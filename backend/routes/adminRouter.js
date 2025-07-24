import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { addUsersBulk, deleteUser, filterUsers, getAllDepartment, getAllUsers, getDepartmentById, registerUser, updateUser } from "../controllers/userController.js";
import { addFeeStructure, assignFeeBulk, assignFeeList, assignFeeSt, deleteFeeStructure, getAllTransactions, getAssignedFees, getFeeStructures, getStudentFees, getStudentTransactions, recordTransaction, revokeAssignedFee, updateStudentFee, upFeeStructure } from "../controllers/feeController.js";
import { approveTransaction } from "../controllers/paymentController.js";
import { generatePayrollsCurrentMonth, getAllPayrolls, payPayroll, updatePayroll } from "../controllers/payrollController.js";
import { getAllExpenses, updateExpenseStatus } from "../controllers/expenseController.js";
import { allocateDepartmentBudget, getAllDepartmentBudgets, getAvailableFunds, getDepartmentBudgetSummary, upsertAvailableFund } from "../controllers/budgetController.js";
import { addIncomeSource, getAllIncomeSources } from "../controllers/incomeController.js";

const adminRouter = express.Router();

adminRouter.post("/adduser", protect, authorize("admin"), registerUser);
adminRouter.get("/allusers", protect, authorize("admin"), getAllUsers);
adminRouter.post("/adduser/bulk", protect, authorize("admin"), addUsersBulk);
adminRouter.put("/upuser/:id", protect, authorize("admin"), updateUser);
adminRouter.delete("/deluser/:id", protect, authorize("admin"), deleteUser);
adminRouter.get("/users/filter", protect, authorize("admin"), filterUsers);

adminRouter.get("/alldepartments", getAllDepartment);
adminRouter.get("/departments/:id", protect, authorize("admin"), getDepartmentById);

adminRouter.post("/addfee", protect, authorize("admin", "finance_manager"), addFeeStructure);
adminRouter.get("/allfee", getFeeStructures);
adminRouter.put("/upfee/:id", protect, authorize("admin", "finance_manager"), upFeeStructure);
adminRouter.delete("/delfee/:id", protect, authorize("admin", "finance_manager"), deleteFeeStructure);

adminRouter.post("/assignfee", protect, authorize("admin", "finance_manager"), assignFeeSt);
adminRouter.post("/assignfee/bulk", protect, authorize("admin", "finance_manager"), assignFeeBulk);
adminRouter.post("/assignfee/list", protect, authorize("admin", "finance_manager"), assignFeeList);
adminRouter.delete("/revokefee/:id", protect, authorize("admin", "finance_manager"), revokeAssignedFee);
adminRouter.get("/assignedfees", protect, authorize("admin", "finance_manager"), getAssignedFees);

adminRouter.get("/allfeest/:student_id", protect, authorize("admin", "finance_manager"), getStudentFees);
adminRouter.put("/upfeest/:id", protect, authorize("admin", "finance_manager"), updateStudentFee);

adminRouter.post("/addtransaction", protect, authorize("admin", "finance_manager"), recordTransaction);
adminRouter.get("/alltrans", protect, authorize("admin", "finance_manager"), getAllTransactions);
adminRouter.get("/alltransst/:student_id", protect, authorize("admin", "finance_manager"), getStudentTransactions);
adminRouter.post("/approvepayment", protect, authorize("admin", "finance_manager"), approveTransaction);

adminRouter.post("/generatepayroll", protect, authorize("admin", "finance_manager"), generatePayrollsCurrentMonth);
adminRouter.get("/allpayrolls", protect, authorize("admin", "finance_manager"), getAllPayrolls);
adminRouter.put("/uppayroll/:payroll_id", protect, authorize("admin", "finance_manager"), updatePayroll);
adminRouter.post("/pay/:payroll_id", protect, authorize("admin", "finance_manager"), payPayroll);

adminRouter.get("/expenses", protect, authorize("admin", "finance_manager"), getAllExpenses);
adminRouter.put("/expenses/:id/status", protect, authorize("admin", "finance_manager"), updateExpenseStatus);

adminRouter.put("/budgets", protect, authorize("admin"), allocateDepartmentBudget);
adminRouter.get("/budgets", protect, authorize("admin"), getAllDepartmentBudgets);
adminRouter.get("/budget-summary", getDepartmentBudgetSummary);

adminRouter.get("/available-balance", protect, authorize("admin", "finance_manager"), getAvailableFunds);
adminRouter.post("/available-balance", protect, authorize("admin", "finance_manager"), upsertAvailableFund);

adminRouter.post("/income", protect, authorize("admin", "finance_manager"), addIncomeSource);
adminRouter.get("/allincomes", protect, authorize("admin", "finance_manager"), getAllIncomeSources);

export default adminRouter;