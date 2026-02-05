import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const CourseFeeManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("COURSE_FEE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    subjectId: "",
    courseCode: "",
    courseName: "",
    date: "",
    staffName: "",
    description: "",
    approvedBudgetAmount: "",
    paidAmount: "",
    balanceAmount: ""
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
    loadAll();
  }, []);

  const loadAll = async () => {
    setRecords((await api.get("/course-fees")).data);
    setSubjects((await api.get("/subjects")).data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.subjectId || !form.date || !form.staffName) {
      alert("Subject, Date and Staff Name are required");
      return;
    }

    if (editingId) {
      await api.put(`/course-fees/${editingId}`, form);
      alert("Record updated successfully");
    } else {
      await api.post("/course-fees", form);
      alert("Record added successfully");
    }

    setForm(emptyForm);
    setEditingId(null);
    loadAll();
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      subjectId: r.subjectId,
      courseCode: r.courseCode,
      courseName: r.courseName,
      date: r.date?.slice(0, 10),
      staffName: r.staffName,
      description: r.description,
      approvedBudgetAmount: r.approvedBudgetAmount,
      paidAmount: r.paidAmount,
      balanceAmount: r.balanceAmount
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete record?")) return;
    await api.delete(`/course-fees/${id}`);
    loadAll();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Course Fee Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Course Fee Management</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Update Course Fee Record" : "Add Course Fee Record"}
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
              <label>Course Code</label>
              <select
                value={form.subjectId}
                onChange={e => {
                  const s = subjects.find(x => x._id === e.target.value);
                  if (s) {
                    setForm({
                      ...form,
                      subjectId: s._id,
                      courseCode: s.subjectCode,
                      courseName: s.subjectName
                    });
                  } else {
                    setForm({ ...form, subjectId: "", courseCode: "", courseName: "" });
                  }
                }}
              >
                <option value="">Select Code</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.subjectCode}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Course Name</label>
              <input value={form.courseName} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div>
              <label>Name of Staff</label>
              <input
                placeholder="Enter staff name"
                value={form.staffName}
                onChange={e => handleTextSanitization("staffName", e.target.value)}
              />
            </div>

            <div>
              <label>Description</label>
              <input
                placeholder="Details..."
                value={form.description}
                onChange={e => handleTextSanitization("description", e.target.value)}
              />
            </div>

            <div>
              <label>Approved Budget</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.approvedBudgetAmount}
                onChange={e => handleNumericChange("approvedBudgetAmount", e.target.value)}
              />
            </div>

            <div>
              <label>Paid Amount</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.paidAmount}
                onChange={e => handleNumericChange("paidAmount", e.target.value)}
              />
            </div>

            <div>
              <label>Balance Amount</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.balanceAmount}
                onChange={e => handleNumericChange("balanceAmount", e.target.value)}
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Fee Record" : "Save Fee Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Course Fee Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Staff Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Budget</th>
                  <th style={{ textAlign: "right" }}>Paid</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.courseCode}</td>
                    <td>{r.courseName}</td>
                    <td>{r.staffName}</td>
                    <td style={{ fontSize: '0.85rem' }}>{r.description}</td>
                    <td style={{ textAlign: "right" }}>{r.approvedBudgetAmount}</td>
                    <td style={{ textAlign: "right", color: "#10b981" }}>{r.paidAmount}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.balanceAmount}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No fee records found.
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

export default CourseFeeManagement;