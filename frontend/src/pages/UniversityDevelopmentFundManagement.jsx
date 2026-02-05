import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const UniversityDevelopmentFundManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("UNIVERSITY_DEVELOPMENT_FUND_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    balance: "",
    profitShareForYear: "",
    total: "",
    date: "",
    description: "",
    paymentBeneficiary: "",
    amountExpense: "",
    currentBalance: "",
    signature: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    // Blocks negative sign, plus sign, and scientific 'e' notation
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (field, val) => {
    // Rejects negative values from being stored in state
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    // Strips injection characters while allowing alphanumeric and basic punctuation
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/university-development-funds");
    setRecords(res.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.date || !form.description || !form.amountExpense) {
      alert("Date, Description and Amount are required");
      return;
    }

    if (editingId) {
      await api.put(`/university-development-funds/${editingId}`, form);
      alert("Record updated");
    } else {
      await api.post("/university-development-funds", form);
      alert("Record added");
    }

    setForm(emptyForm);
    setEditingId(null);
    fetchRecords();
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      balance: r.balance,
      profitShareForYear: r.profitShareForYear,
      total: r.total,
      date: r.date?.slice(0, 10),
      description: r.description,
      paymentBeneficiary: r.paymentBeneficiary,
      amountExpense: r.amountExpense,
      currentBalance: r.currentBalance,
      signature: r.signature
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/university-development-funds/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="University Development Fund">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">University Development Fund</h2>

        {/* SUMMARY & ENTRY CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Fund Record" : "Add Fund Record"}
          </h3>

          {/* Top Summary Row */}
          <div className="form-grid-4" style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px dashed #e2e8f0" }}>
            <div>
              <label>Initial Balance</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.balance}
                onChange={(e) => handleNumericChange("balance", e.target.value)}
              />
            </div>
            <div>
              <label>Profit Share (Year)</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.profitShareForYear}
                onChange={(e) => handleNumericChange("profitShareForYear", e.target.value)}
              />
            </div>
            <div>
              <label>Total Fund</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.total}
                onChange={(e) => handleNumericChange("total", e.target.value)}
              />
            </div>
          </div>

          {/* Transaction Row */}
          <div className="form-grid-4">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label>Description</label>
              <input
                type="text"
                placeholder="Reason for expense"
                value={form.description}
                onChange={(e) => handleTextSanitization("description", e.target.value)}
              />
            </div>
            <div>
              <label>Payment Beneficiary</label>
              <input
                type="text"
                placeholder="Paid to..."
                value={form.paymentBeneficiary}
                onChange={(e) => handleTextSanitization("paymentBeneficiary", e.target.value)}
              />
            </div>
            <div>
              <label>Amount Expense</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.amountExpense}
                onChange={(e) => handleNumericChange("amountExpense", e.target.value)}
              />
            </div>
            <div>
              <label>Current Balance</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.currentBalance}
                onChange={(e) => handleNumericChange("currentBalance", e.target.value)}
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Record" : "Add Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Fund Ledger Records</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Beneficiary</th>
                  <th style={{ textAlign: "right" }}>Expense</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.description}</td>
                    <td>{r.paymentBeneficiary}</td>
                    <td style={{ textAlign: "right", color: "#ef4444", fontWeight: 500 }}>
                      {r.amountExpense}
                    </td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>
                      {r.currentBalance}
                    </td>
                    <td className="action-cell ">
                      <button className="icon-btn" onClick={() => editRecord(r)}>
                        ✏️
                      </button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>
                      No fund records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UniversityDevelopmentFundManagement;