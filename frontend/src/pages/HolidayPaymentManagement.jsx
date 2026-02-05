import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const HolidayPaymentManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("HOLIDAY_PAYMENT_MANAGEMENT")
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
    dateOfWorking: "",
    arrival: "",
    departure: "",
    basicSalary: "",
    amount: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  // Prevents 'e', '+', '-' in number inputs
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Ensures values aren't negative manually
  const handleNumericChange = (field, val) => {
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  // Sanitize text inputs
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
    const res = await api.get("/holiday-payments");
    setRecords(res.data);
  };

  const fetchPayees = async () => {
    const res = await api.get("/payees");
    setPayees(res.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    // Basic Required Fields
    if (!form.date || !form.month || !form.payeeId || !form.amount) {
      alert("Required fields (Date, Month, Employee, and Amount) are missing");
      return;
    }

    // Logic Validation: Check if amount is positive
    if (parseFloat(form.amount) <= 0) {
      alert("Payment amount must be greater than zero");
      return;
    }

    // Optional Time Validation: If both times are provided, check sequence
    if (form.arrival && form.departure && form.arrival >= form.departure) {
      alert("Departure time must be later than arrival time");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/holiday-payments/${editingId}`, form);
        alert("Holiday payment updated");
      } else {
        await api.post("/holiday-payments", form);
        alert("Holiday payment added");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      date: r.date?.slice(0, 10),
      month: r.month,
      payeeId: r.payeeId?._id,
      empNo: r.empNo,
      employeeName: r.employeeName,
      dateOfWorking: r.dateOfWorking?.slice(0, 10),
      arrival: r.arrival,
      departure: r.departure,
      basicSalary: r.basicSalary,
      amount: r.amount
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/holiday-payments/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Holiday Payments">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Holiday & Overtime Payment Management</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Payment Record" : "New Holiday Payment Entry"}
          </h3>
          
          <div className="form-grid-4">
            <div>
              <label>Entry Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <div>
              <label>Payroll Month</label>
              <input 
                placeholder="e.g. October 2024" 
                value={form.month} 
                onChange={e => handleTextSanitization("month", e.target.value)} 
              />
            </div>

            <div>
              <label>Select Employee (By No)</label>
              <select
                value={form.payeeId}
                onChange={e => {
                  const p = payees.find(x => x._id === e.target.value);
                  if (!p) return;
                  setForm({
                    ...form,
                    payeeId: p._id,
                    empNo: p.payeeNumber,
                    employeeName: p.name
                  });
                }}
              >
                <option value="">Select Employee</option>
                {payees.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.payeeNumber} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Employee Name</label>
              <input value={form.employeeName} disabled style={{ backgroundColor: '#f1f5f9' }} />
            </div>

            <div>
              <label>Date of Working</label>
              <input type="date" value={form.dateOfWorking} onChange={e => setForm({ ...form, dateOfWorking: e.target.value })} />
            </div>

            <div>
              <label>Arrival Time</label>
              <input type="time" value={form.arrival} onChange={e => setForm({ ...form, arrival: e.target.value })} />
            </div>

            <div>
              <label>Departure Time</label>
              <input type="time" value={form.departure} onChange={e => setForm({ ...form, departure: e.target.value })} />
            </div>

            <div>
              <label>Basic Salary</label>
              <input 
                type="number" 
                onKeyDown={blockInvalidChar}
                value={form.basicSalary} 
                onChange={e => handleNumericChange("basicSalary", e.target.value)} 
              />
            </div>

            <div>
              <label>Holiday Payment Amount</label>
              <input 
                type="number" 
                className="amount-input" 
                onKeyDown={blockInvalidChar}
                value={form.amount} 
                onChange={e => handleNumericChange("amount", e.target.value)} 
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Payment Record" : "Add Payment Record"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Payment Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Month</th>
                  <th>Emp No</th>
                  <th>Employee Name</th>
                  <th>Worked Date</th>
                  <th>Shift</th>
                  <th style={{ textAlign: "right" }}>Basic</th>
                  <th style={{ textAlign: "right" }}>Total Amount</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.month}</td>
                    <td style={{ fontWeight: 600 }}>{r.empNo}</td>
                    <td>{r.employeeName}</td>
                    <td>{r.dateOfWorking?.slice(0, 10)}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {r.arrival && r.departure ? `${r.arrival} - ${r.departure}` : 'N/A'}
                    </td>
                    <td style={{ textAlign: "right" }}>{r.basicSalary}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.amount}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                      No holiday payment records found.
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

export default HolidayPaymentManagement;