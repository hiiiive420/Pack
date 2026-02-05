import { useContext, useEffect, useState } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const emptyForm = {
  date: "",
  itemType: "",
  natureCode: "",
  natureDescription: "",
  supplierName: "",
  items: "",
  amount: ""
};

const SuppliesRegister = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("SUPPLIES_REGISTER")
  ) {
    return <p>Unauthorized</p>;
  }

  const [supplies, setSupplies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({}); // Track validation errors

  // ---------------- FETCH SUPPLIES ----------------
  const fetchSupplies = async () => {
    const res = await api.get("/supplies-register");
    setSupplies(res.data);
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  // --- VALIDATION LOGIC FOR TYPING ---
  const handleAmountChange = (value) => {
    // Allows only positive numbers and one decimal point. Prevents symbols/icons/letters.
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    const finalValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanValue;

    setForm({ ...form, amount: finalValue });
    if (errors.amount) setErrors({ ...errors, amount: false });
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    // Final check for required fields
    if (!form.date || !form.itemType || !form.amount || parseFloat(form.amount) <= 0) {
      setErrors({
        date: !form.date,
        itemType: !form.itemType,
        amount: !form.amount || parseFloat(form.amount) <= 0
      });
      alert("Please fill all required fields correctly.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/supplies-register/${editingId}`, form);
        alert("Supply updated");
      } else {
        await api.post("/supplies-register", form);
        alert("Supply added");
      }

      setForm(emptyForm);
      setEditingId(null);
      setErrors({});
      fetchSupplies();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- EDIT ----------------
  const editSupply = (s) => {
    setEditingId(s._id);
    setErrors({});
    setForm({
      date: s.date.slice(0, 10),
      itemType: s.itemType,
      natureCode: s.natureCode,
      natureDescription: s.natureDescription,
      supplierName: s.supplierName,
      items: s.items,
      amount: s.amount
    });
  };

  // ---------------- DELETE ----------------
  const deleteSupply = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/supplies-register/${id}`);
    fetchSupplies();
  };

  // Helper for inline error styles
  const getInputStyle = (isError, extraStyles = {}) => ({
    border: isError ? "2px solid #ef4444" : "1px solid #CBD5E1",
    ...extraStyles
  });

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Supplies Register">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Supplies Register</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Supply" : "Add Supply"}
          </h3>

          <div className="form-grid-4">
            {/* Date */}
            <div>
              <label>Date <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="date"
                style={getInputStyle(errors.date)}
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value });
                  if(errors.date) setErrors({...errors, date: false});
                }}
              />
            </div>

            {/* Item Type */}
            <div>
              <label>Type of Item <span style={{color: '#ef4444'}}>*</span></label>
              <select
                value={form.itemType}
                onChange={(e) => {
                  setForm({ ...form, itemType: e.target.value });
                  if(errors.itemType) setErrors({...errors, itemType: false});
                }}
                style={getInputStyle(errors.itemType, {
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  background: "#fff"
                })}
              >
                <option value="">Select Type</option>
                <option value="CAPITAL">Capital</option>
                <option value="RECURRENT">Recurrent</option>
              </select>
            </div>

            {/* Nature Code */}
            <div>
              <label>Code of the Nature of Purchase</label>
              <input
                type="text"
                placeholder="Nature Code"
                value={form.natureCode}
                onChange={(e) => setForm({ ...form, natureCode: e.target.value })}
              />
            </div>

            {/* Nature Description */}
            <div>
              <label>Nature of the Purchase</label>
              <input
                type="text"
                placeholder="Nature Description"
                value={form.natureDescription}
                onChange={(e) => setForm({ ...form, natureDescription: e.target.value })}
              />
            </div>

            {/* Supplier Name */}
            <div>
              <label>Name of Supplier</label>
              <input
                type="text"
                placeholder="Supplier Name"
                value={form.supplierName}
                onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              />
            </div>

            {/* Items */}
            <div>
              <label>Items Purchased</label>
              <input
                type="text"
                placeholder="Items"
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
              />
            </div>

            {/* Amount */}
            <div>
              <label>Amount (Rs.) <span style={{color: '#ef4444'}}>*</span></label>
              <input
                type="text"
                style={getInputStyle(errors.amount)}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary-btn" onClick={submit}>
              {editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setErrors({});
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Supply Records</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Type of Item</th>
                  <th>Code of the Nature of Purchase</th>
                  <th>Nature of the Purchase</th>
                  <th>Name of Supplier</th>
                  <th>Items Purchased</th>
                  <th>Amount (Rs.)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((s, index) => (
                  <tr key={s._id}>
                    <td>{index + 1}</td>
                    <td>{s.date.slice(0, 10)}</td>
                    <td>{s.itemType}</td>
                    <td>{s.natureCode}</td>
                    <td>{s.natureDescription}</td>
                    <td>{s.supplierName}</td>
                    <td>{s.items}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>
                      {s.amount}
                    </td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editSupply(s)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteSupply(s._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {supplies.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>No records available</td>
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

export default SuppliesRegister;