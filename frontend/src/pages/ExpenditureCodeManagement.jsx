import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ExpenditureCodeManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (user && user.role !== "ADMIN" && !user.permissions.includes("EXPENDITURE_CODE_MANAGEMENT")) {
    return <p>Unauthorized</p>;
  }

  /* ---------------- STATE ---------------- */
  const [codes, setCodes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { code: "", name: "" };
  const [form, setForm] = useState(emptyForm);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await api.get("/expenditure-codes");
      setCodes(res.data);
    } catch (err) {
      console.error("Failed to fetch codes");
    }
  };

  /* ---------------- HANDLERS ---------------- */
  const handleCodeChange = (e) => {
    const value = e.target.value;
    // Validation: Only allow digits and max length of 6
    if (/^\d*$/.test(value) && value.length <= 6) {
      setForm({ ...form, code: value });
    }
  };

  const submit = async () => {
    // Final Validation check
    if (form.code.length !== 6) {
      alert("Expenditure Code must be exactly 6 digits.");
      return;
    }
    if (!form.name.trim()) {
      alert("Please enter an Expenditure Name.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/expenditure-codes/${editingId}`, { name: form.name });
        alert("Expenditure code updated");
      } else {
        await api.post("/expenditure-codes", form);
        alert("Expenditure code created");
      }
      resetForm();
      fetchCodes();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const editCode = (c) => {
    setEditingId(c._id);
    setForm({ code: c.code, name: c.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCode = async (id) => {
    if (!window.confirm("Disable this expenditure code?")) return;
    try {
      await api.delete(`/expenditure-codes/${id}`);
      fetchCodes();
    } catch (err) {
      alert("Error disabling code");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Expenditure Management">
      <div className="page-container">
        <h2 className="page-title">Expenditure Code Directory</h2>

        {/* ================= FORM CARD ================= */}
        <div className="card" style={{ borderLeft: editingId ? "4px solid #1E40AF" : "none" }}>
          <h3 style={{ marginBottom: "20px", color: "#1e293b" }}>
            {editingId ? `Editing Code: ${form.code}` : "Register New Expenditure Code"}
          </h3>

          <div className="form-grid-2">
            <div>
              <label>Expenditure Code (6 Digits)</label>
              <input
                type="text"
                placeholder="e.g. 102030"
                value={form.code}
                disabled={!!editingId}
                onChange={handleCodeChange}
                style={editingId ? { background: "#f1f5f9", cursor: "not-allowed" } : {}}
              />
              {!editingId && (
                <small style={{ color: form.code.length === 6 ? "#10b981" : "#64748b" }}>
                  {form.code.length}/6 digits entered
                </small>
              )}
            </div>

            <div>
              <label>Expenditure Name</label>
              <input
                type="text"
                placeholder="e.g. Office Supplies"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button className="primary-btn" onClick={submit}>
              {editingId ? "Update Details" : "Save Code"}
            </button>
            {editingId && (
              <button className="secondary-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="card" style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "20px", color: "#1e293b" }}>Active Expenditure Codes</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "150px" }}>Code</th>
                  <th>Description / Name</th>
                  <th style={{ textAlign: "center", width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c._id} style={{ backgroundColor: editingId === c._id ? "#eff6ff" : "transparent" }}>
                    <td>
                      <span className="status-badge active" style={{ fontSize: "14px", letterSpacing: "1px" }}>
                        {c.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td className="action-cell">
                      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                        <button className="icon-btn" onClick={() => editCode(c)} title="Edit">
                          ✏️
                        </button>
                        <button className="icon-btn danger" onClick={() => deleteCode(c._id)} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No expenditure codes found in the system.
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

export default ExpenditureCodeManagement;