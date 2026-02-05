import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const SIGNS = ["AB", "SAB"];

const SDCProgramsManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("SDC_PROGRAMS_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [payees, setPayees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expenditureCodes, setExpenditureCodes] = useState([]);

  const emptyForm = {
    date: "",
    programmeId: "",
    programmeCode: "",
    programmeName: "",
    expenditureCode: "",
    typeOfExpenditure: "",
    approvedBudget: "",
    payeeId: "",
    payeeName: "",
    amount: "",
    sign: ""
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
    // Strips @, #, $, etc. while allowing alphanumeric and basic punctuation
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [r, p, py, ec] = await Promise.all([
      api.get("/sdc-programs"),
      api.get("/programmes"),
      api.get("/payees"),
      api.get("/expenditure-codes")
    ]);

    setRecords(r.data);
    setProgrammes(p.data);
    setPayees(py.data);
    setExpenditureCodes(ec.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.date || !form.programmeId || !form.payeeId) {
      alert("Date, Programme and Payee are required");
      return;
    }

    if (editingId) {
      await api.put(`/sdc-programs/${editingId}`, form);
      alert("SDC Program record updated successfully");
    } else {
      await api.post("/sdc-programs", form);
      alert("SDC Program record added successfully");
    }

    setForm(emptyForm);
    setEditingId(null);
    loadAll();
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
    await api.delete(`/sdc-programs/${id}`);
    loadAll();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="SDC Programs Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Staff Development Centre (SDC) Programs</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Update SDC Entry" : "New SDC Entry"}
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
              <label>Programme Code</label>
              <select
                value={form.programmeId}
                onChange={e => {
                  const p = programmes.find(x => x._id === e.target.value);
                  if (p) {
                    setForm({
                      ...form,
                      programmeId: p._id,
                      programmeCode: p.code,
                      programmeName: p.name
                    });
                  } else {
                    setForm({ ...form, programmeId: "", programmeCode: "", programmeName: "" });
                  }
                }}
              >
                <option value="">Select Code</option>
                {programmes.map(p => (
                  <option key={p._id} value={p._id}>{p.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Programme Name</label>
              <input value={form.programmeName} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div>
              <label>Expenditure Code</label>
              <select
                value={form.expenditureCode}
                onChange={(e) => {
                  const selected = expenditureCodes.find(x => x.code === e.target.value);
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
                style={{ backgroundColor: "#f8fafc" }}
                placeholder="Auto-filled"
              />
            </div>

            <div>
              <label>Approved Budget</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.approvedBudget}
                onChange={e => handleNumericChange("approvedBudget", e.target.value)}
              />
            </div>

            <div>
              <label>Payee / Recipient</label>
              <select
                value={form.payeeId}
                onChange={e => {
                  const p = payees.find(x => x._id === e.target.value);
                  if (p) {
                    setForm({
                      ...form,
                      payeeId: p._id,
                      payeeName: p.name
                    });
                  }
                }}
              >
                <option value="">Select Payee</option>
                {payees.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Amount (LKR)</label>
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
              <label>Authorized Sign</label>
              <select
                value={form.sign}
                onChange={e => setForm({ ...form, sign: e.target.value })}
              >
                <option value="">Select Sign</option>
                {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Record" : "Add Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>SDC Program Expenditure Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Code</th>
                  <th>Programme Name</th>
                  <th>Expenditure Type</th>
                  <th style={{ textAlign: "right" }}>Budget</th>
                  <th>Payee</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Sign</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.programmeCode}</td>
                    <td>{r.programmeName}</td>
                    <td>{r.typeOfExpenditure}</td>
                    <td style={{ textAlign: "right" }}>{r.approvedBudget}</td>
                    <td>{r.payeeName}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.amount}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`status-badge ${r.sign === 'AB' ? 'active' : 'pending'}`}>
                        {r.sign}
                      </span>
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
                      No program records found.
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

export default SDCProgramsManagement;