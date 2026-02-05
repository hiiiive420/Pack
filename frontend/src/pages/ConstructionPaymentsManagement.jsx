import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const PAYMENT_TYPES = ["B", "DB", "SAB", "AB"];

const ConstructionPaymentsManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("CONSTRUCTION_PAYMENTS_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    contractCode: "",
    contractName: "",
    contractorName: "",
    contractorAddress: "",
    contractorContactNo: "",
    contractSum: "",
    retention: "",
    contractPeriod: "",
    vatNo: "",
    mobilizationAdvance: "",
    performanceBond: "",
    date: "",
    description: "",
    amountExcludingVAT: "",
    retentionAmount: "",
    vatAmount: "",
    voucherAmountIncludingVAT: "",
    cumulativeAmount: "",
    ma: "",
    paymentType: "" 
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (field, val) => {
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/construction-payments");
    setRecords(res.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.contractCode || !form.contractorName || !form.date) {
      alert("Contract Code, Contractor Name and Date are required");
      return;
    }

    if (editingId) {
      await api.put(`/construction-payments/${editingId}`, form);
      alert("Construction payment record updated");
    } else {
      await api.post("/construction-payments", form);
      alert("Construction payment record added");
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
    await api.delete(`/construction-payments/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Construction Payments">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Construction & Works Payment Management</h2>

        {/* ENTRY CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Payment Entry" : "New Construction Payment Entry"}
          </h3>
          
          <div className="form-section">
            <h4 className="section-subtitle">Contract Metadata</h4>
            <div className="form-grid-4">
              <div>
                <label>Contract Code</label>
                <input 
                  placeholder="Contract No" 
                  value={form.contractCode} 
                  onChange={(e) => handleTextSanitization("contractCode", e.target.value)} 
                />
              </div>
              <div>
                <label>Contract Name</label>
                <input 
                  placeholder="Project Title" 
                  value={form.contractName} 
                  onChange={(e) => handleTextSanitization("contractName", e.target.value)} 
                />
              </div>
              <div>
                <label>Contractor Name</label>
                <input 
                  placeholder="Company Name" 
                  value={form.contractorName} 
                  onChange={(e) => handleTextSanitization("contractorName", e.target.value)} 
                />
              </div>
              <div>
                <label>Contractor Address</label>
                <input 
                  placeholder="Business Address" 
                  value={form.contractorAddress} 
                  onChange={(e) => handleTextSanitization("contractorAddress", e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="form-section" style={{ marginTop: 20 }}>
            <h4 className="section-subtitle">Payment Details</h4>
            <div className="form-grid-4">
              <div>
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label>Description</label>
                <input 
                  placeholder="e.g. Interim Claim 01" 
                  value={form.description} 
                  onChange={(e) => handleTextSanitization("description", e.target.value)} 
                />
              </div>
              <div>
                <label>Amount (Excl. VAT)</label>
                <input 
                  type="number" 
                  onKeyDown={blockInvalidChar}
                  placeholder="0.00" 
                  value={form.amountExcludingVAT} 
                  onChange={(e) => handleNumericChange("amountExcludingVAT", e.target.value)} 
                />
              </div>
              <div>
                <label>VAT Amount</label>
                <input 
                  type="number" 
                  onKeyDown={blockInvalidChar}
                  placeholder="0.00" 
                  value={form.vatAmount} 
                  onChange={(e) => handleNumericChange("vatAmount", e.target.value)} 
                />
              </div>
              <div>
                <label>Voucher Total (Incl. VAT)</label>
                <input 
                  type="number" 
                  onKeyDown={blockInvalidChar}
                  placeholder="0.00" 
                  value={form.voucherAmountIncludingVAT} 
                  onChange={(e) => handleNumericChange("voucherAmountIncludingVAT", e.target.value)} 
                />
              </div>
              <div>
                <label>Cumulative Amount</label>
                <input 
                  type="number" 
                  onKeyDown={blockInvalidChar}
                  placeholder="Total to date" 
                  value={form.cumulativeAmount} 
                  onChange={(e) => handleNumericChange("cumulativeAmount", e.target.value)} 
                />
              </div>
              <div>
                <label>Retention Amount</label>
                <input 
                  type="number" 
                  onKeyDown={blockInvalidChar}
                  placeholder="0.00" 
                  value={form.retentionAmount} 
                  onChange={(e) => handleNumericChange("retentionAmount", e.target.value)} 
                />
              </div>
              <div>
                <label>Payment Type</label>
                <select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
                  <option value="">Select Type</option>
                  {PAYMENT_TYPES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 25 }}>
            {editingId ? "Update Payment Record" : "Save Payment Entry"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Payment History & Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Contract/Contractor</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Excl. VAT</th>
                  <th style={{ textAlign: "right" }}>VAT</th>
                  <th style={{ textAlign: "right" }}>Voucher Total</th>
                  <th style={{ textAlign: "right" }}>Cumulative</th>
                  <th style={{ textAlign: "center" }}>Type</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.contractCode}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.contractorName}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{r.description}</td>
                    <td style={{ textAlign: "right" }}>{r.amountExcludingVAT}</td>
                    <td style={{ textAlign: "right" }}>{r.vatAmount}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.voucherAmountIncludingVAT}</td>
                    <td style={{ textAlign: "right", color: "#0f172a", fontWeight: 500 }}>{r.cumulativeAmount}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="status-badge active">{r.paymentType}</span>
                    </td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No construction payment records found.
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

export default ConstructionPaymentsManagement;