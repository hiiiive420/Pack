import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ResearchConferencesManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("RESEARCH_CONFERENCES_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expenditureCodes, setExpenditureCodes] = useState([]);

  const emptyForm = {
    date: "",
    conferenceCode: "",
    conferenceName: "",
    expenditureCode: "",
    typeOfExpenditure: "",
    approvedAmount: "",
    supplierName: "",
    actualAmount: ""
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
    // Immediate rejection of negative values in state
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    // Strips potential injection characters like @, #, $, etc. 
    // Allows alphanumeric, spaces, dots, hyphens, and slashes.
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const [rc, ec] = await Promise.all([
      api.get("/research-conferences"),
      api.get("/expenditure-codes")
    ]);

    setRecords(rc.data);
    setExpenditureCodes(ec.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.date || !form.conferenceCode || !form.conferenceName) {
      alert("Date, Conference Code and Name are required");
      return;
    }

    if (editingId) {
      await api.put(`/research-conferences/${editingId}`, form);
      alert("Conference record updated");
    } else {
      await api.post("/research-conferences", form);
      alert("Conference record added");
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
    await api.delete(`/research-conferences/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Research Conferences">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">International & Annual Research Conferences</h2>

        {/* ENTRY CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Conference Entry" : "New Conference Entry"}
          </h3>
          
          <div className="form-grid-4">
            <div>
              <label>Date</label>
              <input 
                type="date" 
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} 
              />
            </div>

            <div>
              <label>Conference Code</label>
              <input 
                placeholder="e.g. IRC-2024"
                value={form.conferenceCode}
                onChange={e => handleTextSanitization("conferenceCode", e.target.value)} 
              />
            </div>

            <div>
              <label>Conference Name</label>
              <input 
                placeholder="Full conference title"
                value={form.conferenceName}
                onChange={e => handleTextSanitization("conferenceName", e.target.value)} 
              />
            </div>

            <div>
              <label>Expenditure Code</label>
              <select
                value={form.expenditureCode}
                onChange={(e) => {
                  const selected = expenditureCodes.find(
                    x => x.code === e.target.value
                  );
                  if (!selected) return;

                  setForm({
                    ...form,
                    expenditureCode: selected.code,
                    typeOfExpenditure: selected.name
                  });
                }}
              >
                <option value="">Select Expenditure Code</option>
                {expenditureCodes.map(ec => (
                  <option key={ec._id} value={ec.code}>
                    {ec.code} – {ec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Type of Expenditure</label>
              <input
                value={form.typeOfExpenditure}
                disabled
                style={{ background: "#f1f5f9" }}
                placeholder="Auto-filled"
              />
            </div>

            <div>
              <label>Approved Amount</label>
              <input 
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="Budgeted LKR"
                value={form.approvedAmount}
                onChange={e => handleNumericChange("approvedAmount", e.target.value)} 
              />
            </div>

            <div>
              <label>Supplier / Payable</label>
              <input 
                placeholder="Entity name"
                value={form.supplierName}
                onChange={e => handleTextSanitization("supplierName", e.target.value)} 
              />
            </div>

            <div>
              <label>Actual Amount</label>
              <input 
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="Spent LKR"
                value={form.actualAmount}
                onChange={e => handleNumericChange("actualAmount", e.target.value)} 
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Conference Record" : "Add Conference Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Conference Expenditure Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Code</th>
                  <th>Conference Name</th>
                  <th>Exp. Code</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Approved</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: "right" }}>Actual</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.conferenceCode}</td>
                    <td>{r.conferenceName}</td>
                    <td>{r.expenditureCode}</td>
                    <td style={{ fontSize: "0.85rem" }}>{r.typeOfExpenditure}</td>
                    <td style={{ textAlign: "right" }}>{r.approvedAmount}</td>
                    <td>{r.supplierName}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.actualAmount}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No conference records found.
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

export default ResearchConferencesManagement;