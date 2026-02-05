import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import programmeRoutes from "./routes/programme.routes.js";
import projectRoutes from "./routes/project.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import payeeRoutes from "./routes/payee.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import electricalRoutes from "./routes/electricalMeter.routes.js";
import suppliesRegisterRoutes from "./routes/suppliesRegister.routes.js";
import examScheduleRoutes from "./routes/examSchedule.routes.js";
import honorariumRoutes from "./routes/honorarium.routes.js";
import loanLedgerRoutes from "./routes/loanLedger.routes.js";
import fuelAllowanceRoutes from "./routes/fuelAllowance.routes.js";
import overtimeLedgerRoutes from "./routes/overtimeLedger.routes.js";
import travellingClaimRoutes from "./routes/travellingClaim.routes.js";
import holidayPaymentRoutes from "./routes/holidayPayment.routes.js"; 
import advanceSettlementRoutes from "./routes/advanceSettlement.routes.js";
import miscellaneousRoutes from "./routes/miscellaneous.routes.js";
import researchGrantRoutes from "./routes/researchGrant.routes.js";
import pettyCashRoutes from "./routes/pettyCash.routes.js";
import constructionPaymentsRoutes from "./routes/constructionPayment.routes.js";
import ledgerSheetRoutes from "./routes/ledgerSheet.routes.js";
import utilityExpenseRoutes from "./routes/utilityExpense.routes.js"; 
import visitingPaymentRoutes from "./routes/visitingPayment.routes.js";
import agraharaInsuranceRoutes from "./routes/agraharaInsurance.routes.js";
import universityDevelopmentFundRoutes from "./routes/universityDevelopmentFund.routes.js";
import courseFeeRoutes from "./routes/courseFee.routes.js";
import repairServicePaymentRoutes from "./routes/repairServicePayment.routes.js"; 
import cguProgramRoutes from "./routes/cguProgram.routes.js";
import sdcProgramRoutes from "./routes/sdcProgram.routes.js";
import researchConferenceRoutes from "./routes/researchConference.routes.js"; 
import foreignStudentPaymentRoutes from "./routes/foreignStudentPayment.routes.js";
import expenditureCodeRoutes from "./routes/expenditureCode.routes.js";


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/payees", payeeRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/electrical-meters", electricalRoutes);
app.use("/api/supplies-register", suppliesRegisterRoutes);
app.use("/api/exam-schedules", examScheduleRoutes);
app.use("/api/honorariums", honorariumRoutes);
app.use("/api/loan-ledgers", loanLedgerRoutes);
app.use("/api/fuel-allowances", fuelAllowanceRoutes);
app.use("/api/overtime-ledgers", overtimeLedgerRoutes);
app.use("/api/travelling-claims", travellingClaimRoutes);
app.use("/api/holiday-payments", holidayPaymentRoutes);
app.use("/api/advance-settlements", advanceSettlementRoutes);
app.use("/api/miscellaneous", miscellaneousRoutes);
app.use("/api/research-grants", researchGrantRoutes);
app.use("/api/petty-cash", pettyCashRoutes);
app.use("/api/construction-payments", constructionPaymentsRoutes);
app.use("/api/ledger-sheets", ledgerSheetRoutes);
app.use("/api/utility-expenses", utilityExpenseRoutes);
app.use("/api/visiting-payments", visitingPaymentRoutes);
app.use("/api/agrahara-insurances", agraharaInsuranceRoutes);
app.use(
  "/api/university-development-funds",
  universityDevelopmentFundRoutes
);
app.use("/api/course-fees", courseFeeRoutes);
app.use("/api/repair-service-payments", repairServicePaymentRoutes);
app.use("/api/cgu-programs", cguProgramRoutes);
app.use("/api/sdc-programs", sdcProgramRoutes);
app.use("/api/research-conferences", researchConferenceRoutes);
app.use("/api/foreign-students-payments", foreignStudentPaymentRoutes);
app.use("/api/expenditure-codes", expenditureCodeRoutes);













app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
