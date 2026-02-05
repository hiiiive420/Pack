import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const SIGNS = ["SC", "SAB"];

const LedgerSheetManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("LEDGER_SHEET_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [payees, setPayees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expenditureCodes, setExpenditureCodes] = useState([]);

  const emptyForm = {
    date: "",
    voucherNo: "",
    projectId: "",
    projectName: "",
    subCodeOfExpenditure: "",
    typeOfExpenditure: "",
    payeeId: "",
    payeeName: "",
    description: "",
    budgetedAmount: "",
    expenditureAmount: "",
    balance: "",
    sign: "",
    remarks: ""
  };

  const [form, setForm] = useState(emptyForm);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [l, p, py, ec] = await Promise.all([
      api.get("/ledger-sheets"),
      api.get("/projects"),
      api.get("/payees"),
      api.get("/expenditure-codes")
    ]);

    setRecords(l.data);
    setProjects(p.data);
    setPayees(py.data);
    setExpenditureCodes(ec.data);
  };

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (field, val) => {
    // Prevent negative numbers from state
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    // Strips @, #, $, etc. Allows alphanumeric and basic punctuation
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.date || !form.voucherNo || !form.projectId || !form.payeeId) {
      alert("Date, Voucher No, Project and Payee required");
      return;
    }

    if (editingId) {
      await api.put(`/ledger-sheets/${editingId}`, form);
      alert("Ledger entry updated");
    } else {
      await api.post("/ledger-sheets", form);
      alert("Ledger entry added");
    }

    setForm(emptyForm);
    setEditingId(null);
    fetchAll();
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      date: r.date ? r.date.slice(0, 10) : "",
      voucherNo: r.voucherNo || "",
      projectId: r.projectId || "",
      projectName: r.projectName || "",
      subCodeOfExpenditure: r.subCodeOfExpenditure || "",
      typeOfExpenditure: r.typeOfExpenditure || "",
      payeeId: r.payeeId || "",
      payeeName: r.payeeName || "",
      description: r.description || "",
      budgetedAmount: r.budgetedAmount || "",
      expenditureAmount: r.expenditureAmount || "",
      balance: r.balance || "",
      sign: r.sign || "",
      remarks: r.remarks || ""
    });
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this ledger record?")) return;
    await api.delete(`/ledger-sheets/${id}`);
    fetchAll();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Ledger Sheet">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Project Ledger & Expenditure Tracking</h2>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Ledger Entry" : "New Ledger Entry"}
          </h3>
          
          <div className="form-grid-4">
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <div>
              <label>Voucher No</label>
              <input 
                placeholder="V-000" 
                value={form.voucherNo} 
                onChange={e => handleTextSanitization("voucherNo", e.target.value)} 
              />
            </div>

            <div>
              <label>Project Code</label>
              <select
                value={form.projectId}
                onChange={e => {
                  const p = projects.find(x => x._id === e.target.value);
                  if(!p) return;
                  setForm({
                    ...form,
                    projectId: p._id,
                    projectName: p.name
                  });
                }}
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Project Name</label>
              <input value={form.projectName} disabled style={{ backgroundColor: '#f1f5f9' }} />
            </div>

            <div>
              <label>Sub Code</label>
              <input 
                placeholder="Exp. Sub Code" 
                value={form.subCodeOfExpenditure} 
                onChange={e => handleTextSanitization("subCodeOfExpenditure", e.target.value)} 
              />
            </div>

            <div>
              <label>Expenditure Type</label>
              <select
                value={form.typeOfExpenditure}
                onChange={(e) => setForm({ ...form, typeOfExpenditure: e.target.value })}
              >
                <option value="">Select Expenditure Type</option>
                {expenditureCodes.map(ec => (
                  <option key={ec._id} value={ec.code}>
                    {ec.code} – {ec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Payee Name</label>
              <select
                value={form.payeeId}
                onChange={e => {
                  const p = payees.find(x => x._id === e.target.value);
                  if(!p) return;
                  setForm({
                    ...form,
                    payeeId: p._id,
                    payeeName: p.name
                  });
                }}
              >
                <option value="">Select Payee</option>
                {payees.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Description</label>
              <input 
                placeholder="Details" 
                value={form.description} 
                onChange={e => handleTextSanitization("description", e.target.value)} 
              />
            </div>

            <div>
              <label>Budgeted Amount</label>
              <input 
                type="number" 
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00" 
                value={form.budgetedAmount} 
                onChange={e => handleNumericChange("budgetedAmount", e.target.value)} 
              />
            </div>

            <div>
              <label>Expenditure</label>
              <input 
                type="number" 
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00" 
                value={form.expenditureAmount} 
                onChange={e => handleNumericChange("expenditureAmount", e.target.value)} 
              />
            </div>

            <div>
              <label>Balance</label>
              <input 
                type="number" 
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00" 
                value={form.balance} 
                onChange={e => handleNumericChange("balance", e.target.value)} 
              />
            </div>

            <div>
              <label>Authorization (SC/SAB)</label>
              <select value={form.sign} onChange={e => setForm({ ...form, sign: e.target.value })}>
                <option value="">Select</option>
                {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label>Remarks</label>
              <input 
                placeholder="Additional notes" 
                value={form.remarks} 
                onChange={e => handleTextSanitization("remarks", e.target.value)} 
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Entry" : "Add to Ledger"}
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Transaction History</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>V.No</th>
                  <th>Project Info</th>
                  <th>Payee</th>
                  <th style={{ textAlign: "right" }}>Budget</th>
                  <th style={{ textAlign: "right" }}>Expenditure</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                  <th style={{ textAlign: "center" }}>Sign</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.voucherNo}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.projectName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {r.typeOfExpenditure}
                      </div>
                    </td>
                    <td>{r.payeeName}</td>
                    <td style={{ textAlign: "right" }}>{r.budgetedAmount}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.expenditureAmount}</td>
                    <td style={{ textAlign: "right", color: r.balance < 0 ? '#e11d48' : '#059669', fontWeight: 600 }}>{r.balance}</td>
                    <td style={{ textAlign: "center" }}>
                        <span className="status-badge active">{r.sign}</span>
                    </td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LedgerSheetManagement;