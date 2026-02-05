import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClerkDashboard from "./pages/ClerkDashboard";
import ProgrammeManagement from "./pages/ProgrammeManagement";
import ProjectManagement from "./pages/ProjectManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import BatchManagement from "./pages/BatchManagement";
import SubjectManagement from "./pages/SubjectManagement";
import TopicManagement from "./pages/TopicManagement";
import PayeeManagement from "./pages/PayeeManagement";
import PayeeList from "./pages/PayeeList";
import PayeeView from "./pages/PayeeView";
import AuditLog from "./pages/AuditLog";
import ElectricalMaintenance from "./pages/ElectricalMaintenance";
import SuppliesRegister from "./pages/SuppliesRegister";
import ExamScheduleManagement from "./pages/ExamScheduleManagement";
import HonorariumManagement from "./pages/HonorariumManagement";
import LoanLedgerManagement from "./pages/LoanLedgerManagement";
import FuelAllowanceManagement from "./pages/FuelAllowanceManagement";
import OvertimeLedgerManagement from "./pages/OvertimeLedgerManagement";
import TravelingClaimManagement from "./pages/TravellingClaimManagement";
import HolidayPaymentManagement from "./pages/HolidayPaymentManagement";
import AdvanceSettlementManagement from "./pages/AdvanceSettlementManagement";  
import MiscellaneousManagement from "./pages/MiscellaneousManagement";
import ResearchGrantManagement from "./pages/ResearchGrantManagement";
import PettyCashManagement from "./pages/PettyCashManagement";
import ConstructionPaymentsManagement from "./pages/ConstructionPaymentsManagement";
import LedgerSheetManagement from "./pages/LedgerSheetManagement";
import UtilityExpenseManagement from "./pages/UtilityExpenseManagement";
import VisitingPaymentManagement from "./pages/VisitingPaymentManagement";
import AgraharaInsuranceManagement from "./pages/AgraharaInsuranceManagement";
import UniversityDevelopmentFundManagement from "./pages/UniversityDevelopmentFundManagement";  
import CourseFeeManagement from "./pages/CourseFeeManagement";  
import RepairServicePaymentsManagement from "./pages/RepairServicePaymentsManagement";  
import CGUProgramsManagement from "./pages/CGUProgramsManagement";
import SDCProgramsManagement from "./pages/SDCProgramsManagement";  
import ResearchConferenceManagement from "./pages/ResearchConferencesManagement";
import ForeignStudentsPaymentManagement from "./pages/ForeignStudentsPaymentManagement";
import UserManagement from "./pages/UserManagement";
import ExpenditureCodeManagement from "./pages/ExpenditureCodeManagement";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {/* 1️⃣ Public */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        {/* 2️⃣ Admin Routes */}
        {user?.role === "ADMIN" && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/audit-logs" element={<AuditLog />} />
            <Route
              path="/programmes"
              element={<ProgrammeManagement />}
            />
            <Route
              path="/project"
              element={<ProjectManagement />}
            />
            <Route
              path="/departments"
              element={<DepartmentManagement />}
            />
            <Route path="/expenditure-codes" element={<ExpenditureCodeManagement />} />
          </>
        )}

        {/* 3️⃣ Clerk Routes */}
        {user?.role === "CLERK" && (
          <Route path="/" element={<ClerkDashboard />} />
        )}

        {/* 4️⃣ Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route
  path="/batches"
  element={<BatchManagement />}
/>
<Route path="/subjects" element={<SubjectManagement />} />
<Route path="/topics" element={<TopicManagement />} />
<Route path="/payees" element={<PayeeManagement />} />
<Route path="/payeesList" element={<PayeeList />} />
<Route path="/payees/view/:id" element={<PayeeView />} />
<Route path="/payees/edit/:id" element={<PayeeManagement />} />
<Route path="/payees/new" element={<PayeeManagement />} />

<Route path="/electrical-maintenance" element={<ElectricalMaintenance />} />
<Route path="/supplies-register" element={<SuppliesRegister />} />
<Route
  path="/exam-schedule-management"
  element={<ExamScheduleManagement />}
  
/>
<Route
  path="/honorarium-management"
  element={<HonorariumManagement />}
/>
<Route
  path="/loan-ledger-management"
  element={<LoanLedgerManagement />}
/>
<Route path="/fuel-allowance-management" element={<FuelAllowanceManagement />} />
<Route
  path="/overtime-ledger-management"
  element={<OvertimeLedgerManagement />}
/>
<Route path="/traveling-claim-management" element={<TravelingClaimManagement />} />
<Route path="/holiday-payment-management" element={<HolidayPaymentManagement />} />
<Route path="/advance-settlement-management" element={<AdvanceSettlementManagement />} />
<Route path="/miscellaneous-management" element={<MiscellaneousManagement />} />
<Route path="/research-grant-management" element={<ResearchGrantManagement />} />
<Route path="/petty-cash-management" element={<PettyCashManagement />} />
<Route path="/construction-payments-management" element={<ConstructionPaymentsManagement />} />
<Route path="/ledger-sheet-management" element={<LedgerSheetManagement />} />
<Route path="/utility-expense-management" element={<UtilityExpenseManagement />} />
<Route path="/visiting-payment-management" element={<VisitingPaymentManagement />} />
<Route path="/agrahara-insurance-management" element={<AgraharaInsuranceManagement />} />
<Route path="/university-development-fund-management" element={<UniversityDevelopmentFundManagement />} />
<Route path="/course-fee-management" element={<CourseFeeManagement />} />
<Route path="/repair-service-payments-management" element={<RepairServicePaymentsManagement />} />
<Route path="/cgu-programs-management" element={<CGUProgramsManagement />} />
<Route path="/sdc-programs-management" element={<SDCProgramsManagement />} />
<Route path="/research-conference-management" element={<ResearchConferenceManagement />} />
<Route path="/foreign-students-payment-management" element={<ForeignStudentsPaymentManagement />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
