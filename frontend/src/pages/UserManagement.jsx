import { useState, useEffect, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/dashboard.css";

const PAGE_SIZE = 6;

const MODULES = [
  "TRAVEL_MANAGEMENT",
  "LECTURE_TRANSACTION",
  "SUPPLIES_REGISTER",
  "MAINTENANCE_MANAGEMENT",
  "EXAM_SCHEDULE",
  "HONORARIUM_REGISTER",
  "LOAN_LEDGER_MANAGEMENT",
  "FUEL_ALLOWANCE_MANAGEMENT",
  "OVERTIME_LEDGER_MANAGEMENT",
  "TRAVELLING_CLAIM_MANAGEMENT",
  "HOLIDAY_PAYMENT_MANAGEMENT",
  "ADVANCE_SETTLEMENT_MANAGEMENT",
  "MISCELLANEOUS_MANAGEMENT",
  "RESEARCH_GRANT_MANAGEMENT",
  "PETTY_CASH_MANAGEMENT",
  "CONSTRUCTION_PAYMENTS_MANAGEMENT",
  "ELECTRICITY_WATER_COMMUNICATION_MANAGEMENT",
  "VISITING_PAYMENT_MANAGEMENT",
  "AGAHARA_INSURANCE_MANAGEMENT",
  "UNIVERSITY_DEVELOPMENT_FUND_MANAGEMENT",
  "COURSE_FEE_MANAGEMENT",
  "REPAIR_SERVICE_PAYMENTS_MANAGEMENT",
  "CGU_PROGRAMS_MANAGEMENT",
  "SDC_PROGRAMS_MANAGEMENT",
  "RESEARCH_CONFERENCES_MANAGEMENT",
  "FOREIGN_STUDENTS_PAYMENT_MANAGEMENT"
];

const UserManagement = () => {
  const { user, logout } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: []
  });

  const [users, setUsers] = useState([]);
  const [assignedModules, setAssignedModules] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
    fetchAssignedModules();
  }, []);

  const fetchUsers = async () => {
    setUsers((await api.get("/users")).data);
  };

  const fetchAssignedModules = async () => {
    setAssignedModules((await api.get("/users/assigned-modules")).data);
  };

  const togglePermission = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const submit = async () => {
    await api.post("/users/create", form);
    setForm({ name: "", email: "", password: "", permissions: [] });
    fetchUsers();
    fetchAssignedModules();
  };

  /* ---------- PAGINATION LOGIC ---------- */
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <DashboardLayout user={user} logout={logout} title="User Management">

      {/* ================= CREATE CLERK ================= */}
      <div className="card" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h3>Create Clerk Account</h3>

        <div className="form-grid">
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <h4 style={{ marginTop: 20 }}>Assign Permissions</h4>

        <div className="permission-box">
          {MODULES.map(m => (
            <label key={m}>
              <input
                type="checkbox"
                disabled={assignedModules[m]}
                checked={form.permissions.includes(m)}
                onChange={() => togglePermission(m)}
              />{" "}
              {m.replaceAll("_", " ")}
            </label>
          ))}
        </div>

        <button className="primary-btn" onClick={submit} style={{ marginTop: 16 }}>
          Create User
        </button>
      </div>

      {/* ================= USER LIST ================= */}
      <div className="card " style={{ marginTop: 20, fontFamily: "'Inter', sans-serif" }}>
        <h3>Clerk Accounts</h3>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Modules</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                  No users found
                </td>
              </tr>
            )}

            {currentUsers.map((u, i) => (
              <tr
                key={u._id}
                style={{
                  background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC"
                }}
              >
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ fontSize: 13 }}>
                  {u.permissions.join(", ") || "—"}
                </td>
                <td>
                  <span style={{
                    fontWeight: 600,
                    color: u.isActive ? "#16A34A" : "#DC2626"
                  }}>
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ---------- PAGINATION CONTROLS ---------- */}
        {totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16
          }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>
              Page {page} of {totalPages}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>

              <button
                className="primary-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
};

export default UserManagement;
