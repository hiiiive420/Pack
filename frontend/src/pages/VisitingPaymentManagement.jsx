import React, { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

/* ---------------- EMPTY ROW ---------------- */
const createEmptyRow = () => ({
  date: "",
  month: "",
  lecHrs: "",
  lecAmount: "",
  praHrs: "",
  praAmount: "",
  balanceLecHrs: "",
  balancePraHrs: "",
  travelling: "",
  totalAmount: "",
  deduction10: "",
  netAmount: ""
});

const VisitingPaymentManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const [payees, setPayees] = useState([]);
  const [expenditureCodes, setExpenditureCodes] = useState([]);

  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("VISITING_PAYMENT_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  /* ---------------- STATE ---------------- */
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const emptyForm = {
    payeeId: "",
    projectId: "",
    projectCode: "",
    projectName: "",
    subjectId: "",
    subjectCode: "",
    subjectName: "",
    name: "",
    address: "",
    appointmentNo: "",
    appointmentDate: "",
    expenditureCode: "",
    rows: [createEmptyRow()]
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [r, p, s, py, ec] = await Promise.all([
      api.get("/visiting-payments"),
      api.get("/projects"),
      api.get("/subjects"),
      api.get("/payees"),
      api.get("/expenditure-codes")
    ]);
    setRecords(r.data);
    setProjects(p.data);
    setSubjects(s.data);
    setPayees(py.data);
    setExpenditureCodes(ec.data);
  };

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    // Blocks minus sign, plus sign, and exponent 'e'
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  /* ---------------- ROW HANDLERS ---------------- */
  const addRow = () =>
    setForm(p => ({ ...p, rows: [...p.rows, createEmptyRow()] }));

  const updateRow = (i, field, val) => {
    const numericFields = [
      "lecHrs", "lecAmount", "praHrs", "praAmount", 
      "balanceLecHrs", "balancePraHrs", "travelling", 
      "totalAmount", "deduction10", "netAmount"
    ];

    // Block negative numbers from being stored in state
    if (numericFields.includes(field)) {
      if (val !== "" && parseFloat(val) < 0) return;
    }

    // Sanitize text fields (e.g., month) to prevent injection of symbols like @#$
    if (field === "month") {
      val = val.replace(/[^a-zA-Z\s]/g, "");
    }

    setForm(p => ({
      ...p,
      rows: p.rows.map((r, idx) =>
        idx === i ? { ...r, [field]: val } : r
      )
    }));
  };

  const removeRow = i =>
    setForm(p => ({
      ...p,
      rows: p.rows.filter((_, idx) => idx !== i)
    }));

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    if (!form.projectId || !form.subjectId || !form.name) {
      alert("Project, Subject and Name are required");
      return;
    }

    if (editingId) {
      await api.put(`/visiting-payments/${editingId}`, form);
      alert("Record updated");
    } else {
      await api.post("/visiting-payments", form);
      alert("Record saved");
    }

    setForm(emptyForm);
    setEditingId(null);
    loadAll();
  };

  /* ---------------- EDIT / DELETE ---------------- */
  const editRecord = r => {
    const matchedPayee = payees.find(p => p.name === r.name);

    setEditingId(r._id);
    setForm({
      ...r,
      payeeId: matchedPayee?._id || "",
      appointmentDate: r.appointmentDate?.slice(0, 10),
      rows: r.rows?.length ? r.rows : [createEmptyRow()]
    });
  };

  const deleteRecord = async id => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/visiting-payments/${id}`);
    loadAll();
  };

  /* ---------------- STYLES ---------------- */
  const selectStyle = {
    width: "100%",
    height: "46px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "#fff"
  };

  const disabledStyle = {
    background: "#F1F5F9",
    cursor: "not-allowed"
  };

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout user={user} logout={logout} title="Visiting Lecturer Payment">
      <div className="page-container " style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Visiting Lecturer Payment</h2>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Visiting Payment" : "Add Visiting Payment"}
          </h3>

          <div style={{ marginBottom: 30 }}>
            <h4 style={{
              marginBottom: 15,
              color: "#475569",
              fontSize: "16px",
              fontWeight: 600,
              borderBottom: "2px solid #E2E8F0",
              paddingBottom: 8
            }}>
              Visiting Lecturer Details
            </h4>

            <div className="form-grid-4">
              <div>
                <label>Faculty</label>
                <select
                  value={form.projectId}
                  onChange={e => {
                    const p = projects.find(x => x._id === e.target.value);
                    if (!p) return;
                    setForm(f => ({
                      ...f,
                      projectId: p._id,
                      projectCode: p.code,
                      projectName: p.name
                    }));
                  }}
                  style={selectStyle}
                >
                  <option value="">Select Faculty</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Faculty Name</label>
                <input
                  value={form.projectName}
                  disabled
                  style={disabledStyle}
                  placeholder="Faculty Name"
                />
              </div>

              <div>
                <label>Subject</label>
                <select
                  value={form.subjectId}
                  onChange={e => {
                    const s = subjects.find(x => x._id === e.target.value);
                    if (!s) return;
                    setForm(f => ({
                      ...f,
                      subjectId: s._id,
                      subjectCode: s.subjectCode,
                      subjectName: s.subjectName
                    }));
                  }}
                  style={selectStyle}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.subjectCode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Subject Name</label>
                <input
                  value={form.subjectName}
                  disabled
                  style={disabledStyle}
                  placeholder="Subject Name"
                />
              </div>

              <div>
                <label>Payee Name</label>
                <select
                  value={form.payeeId || ""}
                  style={selectStyle}
                  onChange={(e) => {
                    const selected = payees.find(p => p._id === e.target.value);
                    if (!selected) return;

                    setForm(f => ({
                      ...f,
                      payeeId: selected._id,
                      name: selected.name,
                      address: selected.address,
                      appointmentNo: selected.appointmentNo,
                      appointmentDate: selected.appointmentDate.slice(0, 10)
                    }));
                  }}
                >
                  <option value="">Select Payee</option>
                  {payees.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.payeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Address</label>
                <input
                  value={form.address}
                  disabled
                  style={disabledStyle}
                />
              </div>

              <div>
                <label>Appointment No</label>
                <input
                  value={form.appointmentNo}
                  disabled
                  style={disabledStyle}
                />
              </div>

              <div>
                <label>Appointment Date</label>
                <input
                  type="date"
                  value={form.appointmentDate}
                  disabled
                  style={disabledStyle}
                />
              </div>

              <div>
                <label>Expenditure Code</label>
                <select
                  value={form.expenditureCode}
                  style={selectStyle}
                  onChange={(e) => setForm(f => ({ ...f, expenditureCode: e.target.value }))}
                >
                  <option value="">Select Expenditure Code</option>
                  {expenditureCodes.map(ec => (
                    <option key={ec._id} value={ec.code}>
                      {ec.code} – {ec.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <h4 style={{
              marginBottom: 15,
              color: "#475569",
              fontSize: "16px",
              fontWeight: 600,
              borderBottom: "2px solid #E2E8F0",
              paddingBottom: 8
            }}>
              Monthly Payment Details
            </h4>

            {form.rows.map((row, i) => (
              <div key={i} style={{
                padding: 20,
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                marginBottom: 15,
                background: "#FAFBFC"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 15 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Date</label>
                    <input
                      type="date"
                      required
                      value={row.date}
                      onChange={e => updateRow(i, "date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Month</label>
                    <input
                      type="text"
                      placeholder="e.g. January"
                      value={row.month}
                      onChange={e => updateRow(i, "month", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Lec Hrs</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.0"
                      value={row.lecHrs}
                      onChange={e => updateRow(i, "lecHrs", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Pra Hrs</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.0"
                      value={row.praHrs}
                      onChange={e => updateRow(i, "praHrs", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 15 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Lec Amt</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.00"
                      value={row.lecAmount}
                      onChange={e => updateRow(i, "lecAmount", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Pra Amt</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.00"
                      value={row.praAmount}
                      onChange={e => updateRow(i, "praAmount", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Travel</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.00"
                      value={row.travelling}
                      onChange={e => updateRow(i, "travelling", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Total</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.00"
                      value={row.totalAmount}
                      onChange={e => updateRow(i, "totalAmount", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Bal Lec</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.0"
                      value={row.balanceLecHrs}
                      onChange={e => updateRow(i, "balanceLecHrs", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Bal Pra</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.0"
                      value={row.balancePraHrs}
                      onChange={e => updateRow(i, "balancePraHrs", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>10% Ded</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.00"
                      value={row.deduction10}
                      onChange={e => updateRow(i, "deduction10", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Net</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={blockInvalidChar}
                      placeholder="0.00"
                      value={row.netAmount}
                      onChange={e => updateRow(i, "netAmount", e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="icon-btn danger"
                  onClick={() => removeRow(i)}
                  style={{ marginTop: 10 }}
                >
                  🗑️
                </button>
              </div>
            ))}

            <button
              className="primary-btn"
              onClick={addRow}
              style={{ background: "#10B981" }}
            >
              ➕ Add Month
            </button>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Record" : "Save Record"}
          </button>
        </div>

        {/* ================= SAVED RECORDS ================= */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Saved Records</h3>
            <input
              type="text"
              placeholder="Search by Payee Name or Appointment No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...selectStyle, width: "350px", height: "40px" }}
            />
          </div>

          {records.length === 0 ? (
            <p style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
              No visiting payment records available
            </p>
          ) : (
            records
              .filter(r =>
                r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.appointmentNo?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((r, i) => (
                <div key={r._id} style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: 20,
                  marginBottom: 20,
                  background: "#FAFBFC"
                }}>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 20,
                    alignItems: "center",
                    borderBottom: "1px solid #E2E8F0",
                    paddingBottom: 12,
                    marginBottom: 15
                  }}>
                    <span style={{ fontWeight: 600 }}>{i + 1}. {r.name}</span>
                    <span style={{ color: "#64748B" }}>Address: {r.address}</span>
                    <span style={{ color: "#64748B" }}>Faculty: {r.projectCode} - {r.projectName}</span>
                    <span style={{ color: "#64748B" }}>Subject: {r.subjectCode} - {r.subjectName}</span>
                    <span style={{ color: "#64748B" }}>Appointment No: {r.appointmentNo}</span>
                    <span style={{ color: "#64748B" }}>Date: {r.appointmentDate?.slice(0, 10)}</span>
                    <span style={{ color: "#64748B" }}>Expenditure: {r.expenditureCode}</span>

                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </div>
                  </div>

                  {r.rows && r.rows.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Month</th>
                            <th>Lec Hrs</th>
                            <th>Pra Hrs</th>
                            <th>Lec Amt</th>
                            <th>Pra Amt</th>
                            <th>Travel</th>
                            <th>Total</th>
                            <th>10% Ded</th>
                            <th>Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.rows.map((m, idx) => (
                            <tr key={idx}>
                              <td>{m.date?.slice(0, 10)}</td>
                              <td>{m.month}</td>
                              <td>{m.lecHrs}</td>
                              <td>{m.praHrs}</td>
                              <td className="amount-bold">{m.lecAmount}</td>
                              <td className="amount-bold">{m.praAmount}</td>
                              <td className="amount-bold">{m.travelling}</td>
                              <td className="amount-bold">{m.totalAmount}</td>
                              <td className="amount-bold">{m.deduction10}</td>
                              <td className="amount-bold">{m.netAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{
                      textAlign: "center",
                      padding: 20,
                      fontStyle: "italic",
                      color: "#94A3B8"
                    }}>
                      No monthly payment data
                    </p>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VisitingPaymentManagement;