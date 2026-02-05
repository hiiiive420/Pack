import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/travellingClaim.css";

const TravellingClaimManagement = () => {
  const { user, logout } = useContext(AuthContext);

  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("TRAVELLING_CLAIM_MANAGEMENT")
  ) {
    return <p className="unauthorized">Unauthorized</p>;
  }

  const [records, setRecords] = useState([]);
  const [payees, setPayees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({}); // Track validation errors

  const emptyForm = {
    date: "",
    payeeId: "",
    empNo: "",
    employeeName: "",
    dateOfTravelling: "",
    appliedDateForTravellingClaim: "",
    transportAllowance: "",
    combinedAllowance: "",
    additionalAllowance: "",
    lateFines: "",
    total: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setRecords((await api.get("/travelling-claims")).data);
    setPayees((await api.get("/payees")).data);
  };

  // --- VALIDATION LOGIC FOR TYPING ---
  const handleAmountChange = (field, value) => {
    // Regular expression: allows only positive numbers and one decimal point
    // Prevents symbols, icons, letters, and negative signs
    const cleanValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = cleanValue.split(".");
    const finalValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanValue;

    setForm({ ...form, [field]: finalValue });
    
    // Clear error if field is being fixed
    if (field === 'total' && finalValue) {
        setErrors(prev => ({ ...prev, total: false }));
    }
  };

  const submit = async () => {
    // Final check before submission
    if (!form.date || !form.payeeId || !form.total || parseFloat(form.total) <= 0) {
      setErrors({ 
        date: !form.date, 
        payeeId: !form.payeeId, 
        total: !form.total || parseFloat(form.total) <= 0 
      });
      alert("Please fill all required fields with valid positive amounts.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/travelling-claims/${editingId}`, form);
        alert("Record updated");
      } else {
        await api.post("/travelling-claims", form);
        alert("Record added");
      }

      setForm(emptyForm);
      setEditingId(null);
      setErrors({});
      loadAll();
    } catch (err) {
      alert("Failed to save record.");
    }
  };

  const editRecord = (r) => {
    setEditingId(r._id);
    setErrors({});
    setForm({
      date: r.date || "",
      payeeId: r.payeeId?._id || "",
      empNo: r.empNo || "",
      employeeName: r.employeeName || "",
      dateOfTravelling: r.dateOfTravelling || "",
      appliedDateForTravellingClaim: r.appliedDateForTravellingClaim || "",
      transportAllowance: r.transportAllowance || "",
      combinedAllowance: r.combinedAllowance || "",
      additionalAllowance: r.additionalAllowance || "",
      lateFines: r.lateFines || "",
      total: r.total || ""
    });
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/travelling-claims/${id}`);
    loadAll();
  };

  // Helper for inline styles (keeps your theme but adds red on error)
  const getInputStyle = (isError) => ({
    border: isError ? "2px solid #ef4444" : "1px solid #CBD5E1"
  });

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Travelling Claim Management"
    >
      <div className="card" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h3 className="card-title">
          {editingId ? "Edit Travelling Claim" : "Add Travelling Claim"}
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              style={getInputStyle(errors.date)}
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Employee No</label>
            <select
              style={getInputStyle(errors.payeeId)}
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
                setErrors(prev => ({ ...prev, payeeId: false }));
              }}
            >
              <option value="">Select</option>
              {payees.map(p => (
                <option key={p._id} value={p._id}>
                  {p.payeeNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Employee Name</label>
            <input value={form.employeeName} disabled style={{ backgroundColor: '#f1f5f9' }} />
          </div>

          <div className="form-group">
            <label>Date of Travelling</label>
            <input
              type="date"
              value={form.dateOfTravelling}
              onChange={e =>
                setForm({ ...form, dateOfTravelling: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Applied Date</label>
            <input
              type="date"
              value={form.appliedDateForTravellingClaim}
              onChange={e =>
                setForm({
                  ...form,
                  appliedDateForTravellingClaim: e.target.value
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Transport Allowance</label>
            <input
              placeholder="0.00"
              value={form.transportAllowance}
              onChange={e => handleAmountChange('transportAllowance', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Combined Allowance</label>
            <input
              placeholder="0.00"
              value={form.combinedAllowance}
              onChange={e => handleAmountChange('combinedAllowance', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Additional Allowance</label>
            <input
              placeholder="0.00"
              value={form.additionalAllowance}
              onChange={e => handleAmountChange('additionalAllowance', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Late Fines</label>
            <input
              placeholder="0.00"
              value={form.lateFines}
              onChange={e => handleAmountChange('lateFines', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Amount <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              className="total-input"
              style={getInputStyle(errors.total)}
              placeholder="0.00"
              value={form.total}
              onChange={e => handleAmountChange('total', e.target.value)}
            />
          </div>
        </div>

        <button className="primary-btn" onClick={submit}>
          {editingId ? "Update Record" : "Save Record"}
        </button>
      </div>

      <div className="card" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h3 className="card-title">Travelling Claims</h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Emp No</th>
              <th>Name</th>
              <th>Travel Date</th>
              <th>Applied Date</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td>{r.empNo}</td>
                <td>{r.employeeName}</td>
                <td>{r.dateOfTravelling}</td>
                <td>{r.appliedDateForTravellingClaim}</td>
                <td className="amount">{r.total}</td>
                <td>
                  <button className="action-btn" onClick={() => editRecord(r)}>✏️</button>
                  <button className="action-btn" onClick={() => deleteRecord(r._id)}>🗑️</button>
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default TravellingClaimManagement;