import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const FuelAllowanceManagement = () => {
  const { user, logout } = useContext(AuthContext);

  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("FUEL_ALLOWANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  const [records, setRecords] = useState([]);
  const [payees, setPayees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: "",
    month: "",
    payeeId: "",
    empNo: "",
    employeeName: "",
    approvedLiterPerMonth: "",
    rate: "",
    amount: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  // Prevents invalid scientific notation or signs in numeric inputs
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Ensures values aren't negative manually during typing
  const handleNumericChange = (field, val) => {
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  // Basic sanitization for text fields like Month
  const handleTextSanitization = (field, val) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  useEffect(() => {
    fetchRecords();
    fetchPayees();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/fuel-allowances");
    setRecords(res.data);
  };

  const fetchPayees = async () => {
    const res = await api.get("/payees");
    setPayees(res.data);
  };

  const submit = async () => {
    if (!form.date || !form.month || !form.payeeId) {
      alert("Date, Month and Employee are required");
      return;
    }

    // Logic Validation: Check for positive amount
    if (form.amount && parseFloat(form.amount) <= 0) {
      alert("Amount must be greater than zero");
      return;
    }

    const payload = {
      date: form.date,
      month: form.month,
      payeeId: form.payeeId,
      empNo: form.empNo,
      employeeName: form.employeeName,
      approvedLiterPerMonth: form.approvedLiterPerMonth,
      rate: form.rate,
      amount: form.amount
    };

    try {
      if (editingId) {
        await api.put(`/fuel-allowances/${editingId}`, payload);
        alert("Record updated");
      } else {
        await api.post("/fuel-allowances", payload);
        alert("Record added");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/fuel-allowances/${id}`);
    fetchRecords();
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Fuel Allowance">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Fuel Allowance</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Fuel Allowance" : "Add Fuel Allowance"}
          </h3>

          <div className="form-grid-4">
            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Month */}
            <div>
              <label>Month</label>
              <input
                type="text"
                value={form.month}
                onChange={e => handleTextSanitization("month", e.target.value)}
                placeholder="January 2026"
              />
            </div>

            {/* Employee No (Selector) */}
            <div>
              <label>Employee No</label>
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
                {payees.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.payeeNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Name (Display) */}
            <div>
              <label>Name</label>
              <input
                type="text"
                value={form.employeeName}
                disabled
                style={{ backgroundColor: "#F1F5F9", cursor: "not-allowed" }}
              />
            </div>

            {/* Approved Liter / Month */}
            <div>
              <label>Approved Liter / Month</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.approvedLiterPerMonth}
                onChange={e => handleNumericChange("approvedLiterPerMonth", e.target.value)}
              />
            </div>

            {/* Rate */}
            <div>
              <label>Rate</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.rate}
                onChange={e => handleNumericChange("rate", e.target.value)}
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
                onChange={e => handleNumericChange("amount", e.target.value)}
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Fuel Allowance Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Month</th>
                  <th>Employee No</th>
                  <th>Name</th>
                  <th>Approved Liter / Month</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date}</td>
                    <td>{r.month}</td>
                    <td>{r.empNo}</td>
                    <td>{r.employeeName}</td>
                    <td>{r.approvedLiterPerMonth}</td>
                    <td>{r.rate}</td>
                    <td className="amount-bold">{r.amount}</td>
                    <td className="action-cell">
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditingId(r._id);
                          setForm({
                            ...r,
                            payeeId: r.payeeId?._id || "",
                            empNo: r.empNo,
                            employeeName: r.employeeName
                          });
                        }}
                      >
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
                    <td colSpan="8" style={{ textAlign: "center", padding: 20 }}>
                      No fuel allowance records available
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

export default FuelAllowanceManagement;