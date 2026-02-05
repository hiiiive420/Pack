import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const UtilityExpenseManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("ELECTRICITY_WATER_COMMUNICATION_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const emptyForm = {
    date: "",
    utilityCode: "",
    utilityName: "",
    accountNumber: "",
    period: "",
    meterReading: "",
    usedUnits: "",
    amount: "",
    total: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

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
    setRecords((await api.get("/utility-expenses")).data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.date) {
      alert("Date is required");
      return;
    }

    if (editingId) {
      await api.put(`/utility-expenses/${editingId}`, form);
      alert("Utility record updated");
    } else {
      await api.post("/utility-expenses", form);
      alert("Utility record added");
    }

    setForm(emptyForm);
    setEditingId(null);
    fetchRecords();
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      ...r,
      date: r.date?.slice(0, 10)
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/utility-expenses/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Utility Expenses">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Electricity, Water & Communication Management</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Utility Entry" : "New Utility Entry"}
          </h3>
          
          <div className="form-grid-4">
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <div>
              <label>Utility Code</label>
              <input 
                placeholder="Code" 
                value={form.utilityCode} 
                onChange={e => handleTextSanitization("utilityCode", e.target.value)} 
              />
            </div>

            <div>
              <label>Utility Name</label>
              <input 
                placeholder="e.g. Electricity" 
                value={form.utilityName} 
                onChange={e => handleTextSanitization("utilityName", e.target.value)} 
              />
            </div>

            <div>
              <label>Account Number</label>
              <input 
                placeholder="Acc No." 
                value={form.accountNumber} 
                onChange={e => handleTextSanitization("accountNumber", e.target.value)} 
              />
            </div>

            <div>
              <label>Billing Period</label>
              <input 
                placeholder="e.g. Jan 2024" 
                value={form.period} 
                onChange={e => handleTextSanitization("period", e.target.value)} 
              />
            </div>

            <div>
              <label>Meter Reading</label>
              <input 
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="Current reading" 
                value={form.meterReading} 
                onChange={e => handleNumericChange("meterReading", e.target.value)} 
              />
            </div>

            <div>
              <label>Units Used</label>
              <input 
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="Quantity" 
                value={form.usedUnits} 
                onChange={e => handleNumericChange("usedUnits", e.target.value)} 
              />
            </div>

            <div>
              <label>Base Amount</label>
              <input 
                type="number" 
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00" 
                value={form.amount} 
                onChange={e => handleNumericChange("amount", e.target.value)} 
              />
            </div>

            <div>
              <label>Total (Inc. Taxes)</label>
              <input 
                type="number" 
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00" 
                value={form.total} 
                onChange={e => handleNumericChange("total", e.target.value)} 
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Utility Record" : "Add Utility Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Expense Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Utility</th>
                  <th>Acc No.</th>
                  <th>Period</th>
                  <th>Reading</th>
                  <th>Units</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.utilityName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.utilityCode}</div>
                    </td>
                    <td>{r.accountNumber}</td>
                    <td>{r.period}</td>
                    <td>{r.meterReading}</td>
                    <td>{r.usedUnits}</td>
                    <td style={{ textAlign: "right" }}>{r.amount}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.total}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No utility records found.
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

export default UtilityExpenseManagement;