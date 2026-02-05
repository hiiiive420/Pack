import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const RepairServicePaymentsManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("REPAIR_SERVICE_PAYMENTS_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: "",
    natureOfItems: "",
    itemTag: "",
    serialNo: "",
    supplierName: "",
    description: "",
    amount: "",
    cumulative: ""
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
    // Immediate rejection of negative values in state
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    // Strips potential injection characters like @, #, $, etc. 
    // Allows alphanumeric, spaces, dots, hyphens, and slashes.
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setRecords((await api.get("/repair-service-payments")).data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.date || !form.natureOfItems || !form.supplierName) {
      alert("Date, Nature of Items and Supplier are required");
      return;
    }

    if (editingId) {
      await api.put(`/repair-service-payments/${editingId}`, form);
      alert("Payment record updated");
    } else {
      await api.post("/repair-service-payments", form);
      alert("Payment record added");
    }

    setForm(emptyForm);
    setEditingId(null);
    loadRecords();
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      date: r.date?.slice(0, 10),
      natureOfItems: r.natureOfItems,
      itemTag: r.itemTag,
      serialNo: r.serialNo,
      supplierName: r.supplierName,
      description: r.description,
      amount: r.amount,
      cumulative: r.cumulative
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/repair-service-payments/${id}`);
    loadRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Repair & Service Payments">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Repair & Service Payments</h2>

        {/* INPUT CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Payment Entry" : "New Payment Entry"}
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
              <label>Nature of Items</label>
              <input
                placeholder="e.g. Laptop, AC Unit"
                value={form.natureOfItems}
                onChange={e => handleTextSanitization("natureOfItems", e.target.value)}
              />
            </div>

            <div>
              <label>Item Tag / ID</label>
              <input
                placeholder="Asset Tag #"
                value={form.itemTag}
                onChange={e => handleTextSanitization("itemTag", e.target.value)}
              />
            </div>

            <div>
              <label>Serial Number</label>
              <input
                placeholder="S/N"
                value={form.serialNo}
                onChange={e => handleTextSanitization("serialNo", e.target.value)}
              />
            </div>

            <div>
              <label>Supplier / Service Provider</label>
              <input
                placeholder="Company Name"
                value={form.supplierName}
                onChange={e => handleTextSanitization("supplierName", e.target.value)}
              />
            </div>

            <div>
              <label>Description of Work</label>
              <input
                placeholder="What was repaired?"
                value={form.description}
                onChange={e => handleTextSanitization("description", e.target.value)}
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
              <label>Cumulative Total</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.cumulative}
                onChange={e => handleNumericChange("cumulative", e.target.value)}
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit} style={{ marginTop: 20 }}>
            {editingId ? "Update Payment" : "Add Payment"}
          </button>
        </div>

        {/* DATA TABLE CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Payment History Ledger</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item Nature</th>
                  <th>Tag / Serial</th>
                  <th>Supplier</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Cumulative</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.natureOfItems}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>Tag: {r.itemTag}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>S/N: {r.serialNo}</div>
                    </td>
                    <td>{r.supplierName}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{r.description}</td>
                    <td style={{ textAlign: "right", fontWeight: 500 }}>{r.amount}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>{r.cumulative}</td>
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

export default RepairServicePaymentsManagement;