import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const SIGNS = ["AB", "SAB"];

const ForeignStudentsPaymentManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("FOREIGN_STUDENTS_PAYMENT_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    serialNo: "",
    date: "",
    assistanceName: "",
    studentName: "",
    studentRegNo: "",
    amount: "",
    sign: ""
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
    // Strips @, #, $, etc. Allows alphanumeric and basic punctuation
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/foreign-students-payments");
    setRecords(res.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.serialNo || !form.date || !form.studentName) {
      alert("Serial No, Date and Student Name are required");
      return;
    }

    if (editingId) {
      await api.put(`/foreign-students-payments/${editingId}`, form);
      alert("Record updated successfully");
    } else {
      await api.post("/foreign-students-payments", form);
      alert("Record added successfully");
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
    await api.delete(`/foreign-students-payments/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Foreign Students Payment">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Foreign Students Payment Management</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Update Payment Record" : "New Payment Record"}
          </h3>
          
          <div className="form-grid-4">
            <div>
              <label>Serial No</label>
              <input
                placeholder="Entry No"
                value={form.serialNo}
                onChange={e => handleTextSanitization("serialNo", e.target.value)}
              />
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <label>Name of Assistance</label>
              <input
                placeholder="Assistance type/name"
                value={form.assistanceName}
                onChange={e => handleTextSanitization("assistanceName", e.target.value)}
              />
            </div>

            <div>
              <label>Name of Student</label>
              <input
                placeholder="Student's full name"
                value={form.studentName}
                onChange={e => handleTextSanitization("studentName", e.target.value)}
              />
            </div>

            <div>
              <label>Registration No</label>
              <input
                placeholder="Reg No"
                value={form.studentRegNo}
                onChange={e => handleTextSanitization("studentRegNo", e.target.value)}
              />
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
              <label>Authorization (AB/SAB)</label>
              <select
                value={form.sign}
                onChange={e => setForm({ ...form, sign: e.target.value })}
              >
                <option value="">Select Sign</option>
                {SIGNS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Payment" : "Add Payment"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Payment Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Date</th>
                  <th>Assistance</th>
                  <th>Student Name</th>
                  <th>Reg. No</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Sign</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.serialNo}</td>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.assistanceName}</td>
                    <td style={{ fontWeight: 500 }}>{r.studentName}</td>
                    <td>{r.studentRegNo}</td>
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
                    <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No payment records found.
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

export default ForeignStudentsPaymentManagement;