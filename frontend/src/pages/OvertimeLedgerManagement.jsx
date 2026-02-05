import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const OvertimeLedgerManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("OVERTIME_LEDGER_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [payees, setPayees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: "",
    month: "",
    payeeId: "",
    empNo: "",
    employeeName: "",
    approvedHours: "",
    workedHours: "",
    paidHours: "",
    rate: "",
    amount: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (field, val) => {
    // Only allow positive numbers or empty string
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
    fetchPayees();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/overtime-ledgers");
    setRecords(res.data);
  };

  const fetchPayees = async () => {
    const res = await api.get("/payees");
    setPayees(res.data);
  };

  // ---------------- FOOTER TOTAL (SUM OF AMOUNT COLUMN) ----------------
  const calculateFooterTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    try {
      if (!form.date || !form.month || !form.payeeId) {
        alert("Date, Month and Employee are required");
        return;
      }

      // Check for valid numeric entries
      if (form.amount && parseFloat(form.amount) < 0) {
        alert("Amount cannot be negative");
        return;
      }

      const payload = {
        date: form.date,
        month: form.month,
        payeeId: form.payeeId,
        empNo: form.empNo,
        employeeName: form.employeeName,
        approvedHours: form.approvedHours,
        workedHours: form.workedHours,
        paidHours: form.paidHours,
        rate: form.rate,
        amount: form.amount
      };

      if (editingId) {
        await api.put(`/overtime-ledgers/${editingId}`, payload);
        alert("Record updated");
      } else {
        await api.post("/overtime-ledgers", payload);
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
      date: rec.date || "",
      month: rec.month || "",
      payeeId: rec.payeeId?._id || "",
      empNo: rec.empNo || "",
      employeeName: rec.employeeName || "",
      approvedHours: rec.approvedHours || "",
      workedHours: rec.workedHours || "",
      paidHours: rec.paidHours || "",
      rate: rec.rate || "",
      amount: rec.amount || ""
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/overtime-ledgers/${id}`);
    fetchRecords();
  };

  // ---------------- HANDLE PAYEE SELECTION ----------------
  const handlePayeeChange = (e) => {
    const selectedPayeeId = e.target.value;
    const p = payees.find(x => x._id === selectedPayeeId);
    
    if (!p) {
      setForm({
        ...form,
        payeeId: "",
        empNo: "",
        employeeName: ""
      });
      return;
    }

    setForm({
      ...form,
      payeeId: p._id,
      empNo: p.payeeNumber,
      employeeName: p.name
    });
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Over Time Ledger">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Over Time Ledger</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Overtime Record" : "Add Overtime Record"}
          </h3>

          <div className="form-grid-4">
            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </div>

            {/* Month */}
            <div>
              <label>Month</label>
              <input
                type="text"
                value={form.month}
                onChange={(e) =>
                  handleTextSanitization("month", e.target.value)
                }
                placeholder="e.g. October 2024"
              />
            </div>

            {/* Employee Selection */}
            <div>
              <label>Employee No</label>
              <select
                value={form.payeeId}
                onChange={handlePayeeChange}
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
                <option value="">Select Employee</option>
                {payees.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.payeeNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Name */}
            <div>
              <label>Employee Name</label>
              <input
                type="text"
                value={form.employeeName}
                disabled
                style={{
                  background: "#f1f5f9",
                  cursor: "not-allowed"
                }}
              />
            </div>

            {/* Approved Hours */}
            <div>
              <label>Approved Hours</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.approvedHours}
                onChange={(e) =>
                    handleNumericChange("approvedHours", e.target.value)
                }
              />
            </div>

            {/* Worked Hours */}
            <div>
              <label>Worked Hours</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.workedHours}
                onChange={(e) =>
                    handleNumericChange("workedHours", e.target.value)
                }
              />
            </div>

            {/* Paid Hours */}
            <div>
              <label>Paid Hours</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.paidHours}
                onChange={(e) =>
                    handleNumericChange("paidHours", e.target.value)
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
                onChange={(e) =>
                    handleNumericChange("rate", e.target.value)
                }
              />
            </div>

            {/* Amount */}
            <div>
              <label>Amount</label>
              <input
                type="number"
                className="amount-input"
                onKeyDown={blockInvalidChar}
                value={form.amount}
                onChange={(e) =>
                    handleNumericChange("amount", e.target.value)
                }
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Overtime Ledger Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Month</th>
                  <th>Employee No</th>
                  <th>Name</th>
                  <th>Approved Hours</th>
                  <th>Worked Hours</th>
                  <th>Paid Hours</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.date}</td>
                    <td>{r.month}</td>
                    <td>{r.empNo}</td>
                    <td>{r.employeeName}</td>
                    <td>{r.approvedHours}</td>
                    <td>{r.workedHours}</td>
                    <td>{r.paidHours}</td>
                    <td>{r.rate}</td>
                    <td className="amount-bold">{r.amount}</td>
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
                    <td colSpan="11" style={{ textAlign: "center", padding: 20 }}>
                      No overtime ledger records available
                    </td>
                  </tr>
                )}

                {/* ✅ FOOTER TOTAL */}
                {records.length > 0 && (
                  <tr className="table-footer">
                    <td colSpan="9" style={{ textAlign: "right", fontWeight: 600 }}>
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

export default OvertimeLedgerManagement;