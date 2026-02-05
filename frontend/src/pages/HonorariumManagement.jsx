import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const HonorariumManagement = () => {
  const { user, logout } = useContext(AuthContext);

  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("HONORARIUM_REGISTER")
  ) {
    return <p>Unauthorized</p>;
  }

  const emptyForm = {
    date: "",
    codeOfTheNatureOfWorks: "",
    natureOfTheWorks: "",
    nameOfTheServicePerson: "",
    detail: "",
    period: "",
    rate: "",
    amount: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/honorariums");
    setRecords(res.data);
  };

  /* ---------------- VALIDATION HELPERS ---------------- */
  
  // Prevents typing invalid numeric characters like 'e' or '-'
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Handles numeric state change and ensures values aren't negative
  const handleNumericChange = (field, val) => {
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  // ✅ CALCULATE TOTAL (FOOTER)
  const calculateTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );
  };

  const submit = async () => {
    try {
      // Required Fields Validation
      if (!form.date || !form.nameOfTheServicePerson || !form.amount) {
        alert("Date, Service Person Name, and Amount are required");
        return;
      }

      // Logical Validation
      if (parseFloat(form.amount) <= 0) {
        alert("Amount must be greater than zero");
        return;
      }

      const payload = {
        ...form,
        totalAmount: calculateTotal().toString()
      };

      if (editingId) {
        await api.put(`/honorariums/${editingId}`, payload);
        alert("Record updated");
      } else {
        await api.post("/honorariums", payload);
        alert("Record added");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const editRecord = (rec) => {
    setEditingId(rec._id);
    setForm({
      date: rec.date ?? "",
      codeOfTheNatureOfWorks: rec.codeOfTheNatureOfWorks ?? "",
      natureOfTheWorks: rec.natureOfTheWorks ?? "",
      nameOfTheServicePerson: rec.nameOfTheServicePerson ?? "",
      detail: rec.detail ?? "",
      period: rec.period ?? "",
      rate: rec.rate ?? "",
      amount: rec.amount ?? ""
    });
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/honorariums/${id}`);
    fetchRecords();
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Honorarium Register">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Honorarium Register</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Honorarium Record" : "Add Honorarium"}
          </h3>

          <div className="form-grid-4">
            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Code of the Nature of works */}
            <div>
              <label>Code of the Nature of works</label>
              <input
                type="text"
                value={form.codeOfTheNatureOfWorks}
                onChange={(e) => setForm({ ...form, codeOfTheNatureOfWorks: e.target.value })}
              />
            </div>

            {/* Nature of the Works */}
            <div>
              <label>Nature of the Works</label>
              <input
                type="text"
                value={form.natureOfTheWorks}
                onChange={(e) => setForm({ ...form, natureOfTheWorks: e.target.value })}
              />
            </div>

            {/* Name of the Service Person */}
            <div>
              <label>Name of the Service Person</label>
              <input
                type="text"
                value={form.nameOfTheServicePerson}
                onChange={(e) => setForm({ ...form, nameOfTheServicePerson: e.target.value })}
              />
            </div>

            {/* Detail */}
            <div>
              <label>Detail</label>
              <input
                type="text"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
              />
            </div>

            {/* Period */}
            <div>
              <label>Period</label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
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

            {/* Amount */}
            <div>
              <label>Amount</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                value={form.amount}
                onChange={(e) => handleNumericChange("amount", e.target.value)}
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: "20px" }}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Honorarium Records</h3>
          
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Code</th>
                  <th>Nature</th>
                  <th>Service Person</th>
                  <th>Detail</th>
                  <th>Period</th>
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
                    <td>{r.codeOfTheNatureOfWorks}</td>
                    <td>{r.natureOfTheWorks}</td>
                    <td>{r.nameOfTheServicePerson}</td>
                    <td>{r.detail}</td>
                    <td>{r.period}</td>
                    <td>{r.rate}</td>
                    <td className="amount-bold">{r.amount}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}

                {records.length > 0 && (
                  <tr className="table-footer">
                    <td colSpan="8" style={{ textAlign: "right", fontWeight: 600 }}>
                      Total
                    </td>
                    <td className="amount-bold">{calculateTotal()}</td>
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

export default HonorariumManagement;