import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ResearchGrantManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("RESEARCH_GRANT_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expenditureCodes, setExpenditureCodes] = useState([]);
  const [errors, setErrors] = useState({}); // Track validation errors

  const emptyForm = {
    date: "",
    researchNumber: "",
    researcherName: "",
    expenditureCode: "",
    expenditureType: "",
    approvedAmount: "",
    description: "",
    amount: "",
    cummulatedAmount: ""
  };

  const [form, setForm] = useState(emptyForm);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [r, ec] = await Promise.all([
      api.get("/research-grants"),
      api.get("/expenditure-codes")
    ]);

    setRecords(r.data);
    setExpenditureCodes(ec.data);
  };

  // --- VALIDATION LOGIC FOR TYPING ---
  const handleAmountChange = (field, value) => {
    // Allows only positive numbers and one decimal point. Removes symbols/letters/negatives.
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    const finalValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanValue;

    setForm({ ...form, [field]: finalValue });
    
    // Clear error for this field if value exists
    if (finalValue && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    // Check all required fields
    const newErrors = {
      date: !form.date,
      researchNumber: !form.researchNumber,
      researcherName: !form.researcherName,
      expenditureCode: !form.expenditureCode,
      approvedAmount: !form.approvedAmount || parseFloat(form.approvedAmount) <= 0,
      amount: !form.amount || parseFloat(form.amount) <= 0,
      cummulatedAmount: !form.cummulatedAmount || parseFloat(form.cummulatedAmount) < 0
    };

    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      alert("Please fill all required fields with valid amounts.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/research-grants/${editingId}`, form);
        alert("Research grant record updated");
      } else {
        await api.post("/research-grants", form);
        alert("Research grant record added");
      }

      setForm(emptyForm);
      setEditingId(null);
      setErrors({});
      await loadAll();
    } catch (err) {
      alert("Operation failed");
    }
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setErrors({});

    let recoveredCode = r.expenditureCode || "";
    let recoveredType = r.expenditureType || "";

    if (!recoveredCode && recoveredType) {
      const matched = expenditureCodes.find(ec => ec.name === recoveredType);
      if (matched) {
        recoveredCode = matched.code;
        recoveredType = matched.name;
      }
    }

    setForm({
      date: r.date?.slice(0, 10),
      researchNumber: r.researchNumber,
      researcherName: r.researcherName,
      expenditureCode: recoveredCode,
      expenditureType: recoveredType,
      approvedAmount: r.approvedAmount || "",
      description: r.description || "",
      amount: r.amount,
      cummulatedAmount: r.cummulatedAmount
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/research-grants/${id}`);
    loadAll();
  };

  // Helper for inline error styles
  const getInputStyle = (isError, extraStyles = {}) => ({
    border: isError ? "2px solid #ef4444" : "1px solid #CBD5E1",
    ...extraStyles
  });

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Research Grant Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">University Research Grants</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Grant Entry" : "New Grant Entry"}
          </h3>
          
          <div className="form-grid-4">
            <div>
              <label>Date <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                type="date" 
                style={getInputStyle(errors.date)}
                value={form.date}
                onChange={e => {
                  setForm({ ...form, date: e.target.value });
                  if(errors.date) setErrors({...errors, date: false});
                }} 
              />
            </div>

            <div>
              <label>Research Number <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                placeholder="Ref No."
                style={getInputStyle(errors.researchNumber)}
                value={form.researchNumber}
                onChange={e => {
                  setForm({ ...form, researchNumber: e.target.value });
                  if(errors.researchNumber) setErrors({...errors, researchNumber: false});
                }} 
              />
            </div>

            <div>
              <label>Researcher Name <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                placeholder="Full Name"
                style={getInputStyle(errors.researcherName)}
                value={form.researcherName}
                onChange={e => {
                  setForm({ ...form, researcherName: e.target.value });
                  if(errors.researcherName) setErrors({...errors, researcherName: false});
                }} 
              />
            </div>

            <div>
              <label>Expenditure Code <span style={{color: '#ef4444'}}>*</span></label>
              <select
                style={getInputStyle(errors.expenditureCode, { width: "100%", height: "46px", padding: "0 14px", borderRadius: "10px", background: "#fff" })}
                value={form.expenditureCode}
                onChange={(e) => {
                  const selected = expenditureCodes.find(ec => ec.code === e.target.value);
                  if (!selected) return;
                  setForm({
                    ...form,
                    expenditureCode: selected.code,
                    expenditureType: selected.name
                  });
                  setErrors({...errors, expenditureCode: false});
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
              <label>Expenditure Type</label>
              <input value={form.expenditureType} disabled style={{ background: "#f8fafc" }} />
            </div>

            <div>
              <label>Approved Amount (LKR) <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="text"
                style={getInputStyle(errors.approvedAmount)}
                placeholder="0.00"
                value={form.approvedAmount}
                onChange={e => handleAmountChange('approvedAmount', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Description</label>
              <input 
                placeholder="Detailed description of expenditure"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} 
              />
            </div>

            <div>
              <label>Current Amount (LKR) <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                type="text"
                style={getInputStyle(errors.amount)}
                placeholder="0.00"
                value={form.amount}
                onChange={e => handleAmountChange('amount', e.target.value)} 
              />
            </div>

            <div>
              <label>Cummulated Total <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                type="text"
                style={getInputStyle(errors.cummulatedAmount)}
                placeholder="0.00"
                value={form.cummulatedAmount}
                onChange={e => handleAmountChange('cummulatedAmount', e.target.value)} 
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Grant Record" : "Add Grant Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Grant Expenditure Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Research No.</th>
                  <th>Researcher</th>
                  <th>Type & Approved</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Cummulated</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.researchNumber}</td>
                    <td>{r.researcherName}</td>
                    <td>
                      {r.expenditureType}
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Approved: {r.approvedAmount}
                      </div>
                    </td>
                    <td>{r.description}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.amount}</td>
                    <td style={{ textAlign: "right", fontWeight: 500 }}>{r.cummulatedAmount}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No research grant records found.
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

export default ResearchGrantManagement;