import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ExamScheduleManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("EXAM_SCHEDULE")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [subjects, setSubjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expenditureCodes, setExpenditureCodes] = useState([]);


  const emptyForm = {
    examNo: "",
    expCode: "",
    seN: "",
    title: "",
    name: "",
    subjectNo: "",
    natureOfTheExamWorks: "",
    period: "",
    rate: "",
    claimAmount: "",
    total: ""
  };

  const [form, setForm] = useState(emptyForm);

  // ---------------- VALIDATION HELPERS ----------------

  // Prevents invalid numeric characters like 'e', '+', '-', '.'
  const blockInvalidChar = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Ensures values remain positive and updates state
  const handleNumericChange = (field, val) => {
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  // ---------------- LOAD DATA ----------------
useEffect(() => {
  fetchSubjects();
  fetchRecords();
  fetchExpenditureCodes();
}, []);
const fetchExpenditureCodes = async () => {
  const res = await api.get("/expenditure-codes");
  setExpenditureCodes(res.data);
};


  const fetchSubjects = async () => {
    const res = await api.get("/subjects");
    setSubjects(res.data);
  };

  const fetchRecords = async () => {
    const res = await api.get("/exam-schedules");
    setRecords(res.data);
  };

  // ---------------- FOOTER TOTAL (SUM OF TOTAL COLUMN) ----------------
  const calculateFooterTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.total || 0),
      0
    );
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    try {
      // Basic Required Check
      if (!form.examNo || !form.subjectNo || !form.name || !form.total) {
        alert("Exam No, Name, Subject, and Total are required");
        return;
      }

      // Logic Check: Total shouldn't be zero or negative
      if (parseFloat(form.total) <= 0) {
        alert("Total amount must be greater than zero");
        return;
      }

      if (editingId) {
        await api.put(`/exam-schedules/${editingId}`, form);
        alert("Record updated");
      } else {
        await api.post("/exam-schedules", form);
        alert("Record added");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- EDIT ----------------
  const editRecord = (rec) => {
    setEditingId(rec._id);
    setForm({
      examNo: rec.examNo || "",
      expCode: rec.expCode || "",
      seN: rec.seN || "",
      title: rec.title || "",
      name: rec.name || "",
      subjectNo: rec.subjectNo?._id || "",
      natureOfTheExamWorks: rec.natureOfTheExamWorks || "",
      period: rec.period || "",
      rate: rec.rate || "",
      claimAmount: rec.claimAmount || "",
      total: rec.total || ""
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/exam-schedules/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Exam Schedule Sheet">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Exam Schedule Sheet</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Exam Schedule" : "Add Exam Schedule"}
          </h3>

          <div className="form-grid-4">
            {/* Exam No */}
            <div>
              <label>Exam No</label>
              <input
                type="text"
                value={form.examNo}
                onChange={(e) =>
                  setForm({ ...form, examNo: e.target.value })
                }
              />
            </div>

            {/* Exp. Code */}
           <div>
  <label>Exp. Code</label>
  <select
    value={form.expCode}
    onChange={(e) =>
      setForm({ ...form, expCode: e.target.value })
    }
    style={{
      width: "100%",
      height: "46px",
      padding: "0 14px",
      borderRadius: "10px",
      border: "1px solid #CBD5E1",
      fontSize: "15px",
      boxSizing: "border-box",
      background: "#fff"
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


            {/* Se. N */}
            <div>
              <label>Se. N</label>
              <input
                type="text"
                value={form.seN}
                onChange={(e) =>
                  setForm({ ...form, seN: e.target.value })
                }
              />
            </div>

            {/* Title */}
            <div>
              <label>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            {/* Name */}
            <div>
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            {/* Subject No */}
            <div>
              <label>Subject No</label>
              <select
                value={form.subjectNo}
                onChange={(e) =>
                  setForm({ ...form, subjectNo: e.target.value })
                }
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  background: "#fff"
                }}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectCode} - {s.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Nature of the Exam Works */}
            <div>
              <label>Nature of the Exam Works</label>
              <input
                type="text"
                value={form.natureOfTheExamWorks}
                onChange={(e) =>
                  setForm({ ...form, natureOfTheExamWorks: e.target.value })
                }
              />
            </div>

            {/* Period */}
            <div>
              <label>Period</label>
              <input
                type="text"
                value={form.period}
                onChange={(e) =>
                  setForm({ ...form, period: e.target.value })
                }
              />
            </div>

            {/* Rate */}
            <div>
              <label>Rate</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.rate}
                onChange={(e) => handleNumericChange("rate", e.target.value)}
              />
            </div>

            {/* Claim Amount */}
            <div>
              <label>Claim Amount</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.claimAmount}
                onChange={(e) => handleNumericChange("claimAmount", e.target.value)}
              />
            </div>

            {/* Total */}
            <div>
              <label>Total</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.total}
                onChange={(e) => handleNumericChange("total", e.target.value)}
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Exam Schedule Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Exam No</th>
                  <th>Exp. Code</th>
                  <th>Se. N</th>
                  <th>Title</th>
                  <th>Name</th>
                  <th>Subject No</th>
                  <th>Subject Name</th>
                  <th>Nature</th>
                  <th>Period</th>
                  <th>Rate</th>
                  <th>Claim</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.examNo}</td>
                    <td>{r.expCode}</td>
                    <td>{r.seN}</td>
                    <td>{r.title}</td>
                    <td>{r.name}</td>
                    <td>{r.subjectNo?.subjectCode}</td>
                    <td>{r.subjectNo?.subjectName}</td>
                    <td>{r.natureOfTheExamWorks}</td>
                    <td>{r.period}</td>
                    <td>{r.rate}</td>
                    <td>{r.claimAmount}</td>
                    <td className="amount-bold">{r.total}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => deleteRecord(r._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {records.length === 0 && (
                  <tr>
                    <td colSpan="14" style={{ textAlign: "center", padding: 20 }}>
                      No exam schedule records available
                    </td>
                  </tr>
                )}

                {/* ✅ FOOTER TOTAL */}
                {records.length > 0 && (
                  <tr className="table-footer">
                    <td colSpan="12" style={{ textAlign: "right", fontWeight: 600 }}>
                      Total
                    </td>
                    <td className="amount-bold">
                      {calculateFooterTotal()}
                    </td>
                    <td />
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

export default ExamScheduleManagement;