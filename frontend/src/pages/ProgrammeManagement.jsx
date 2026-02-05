import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ProgrammeManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const [programmes, setProgrammes] = useState([]);
  const [form, setForm] = useState({ code: "", name: "" });

  // Track if we are editing
  const [editingId, setEditingId] = useState(null);

  // 🔐 Permission guard (Optional but recommended based on your previous screens)
  if (user && user.role !== "ADMIN" && !user.permissions.includes("MAINTENANCE_MANAGEMENT")) {
    return <p>Unauthorized</p>;
  }

  // ----------------------------
  // FETCH PROGRAMMES
  // ----------------------------
  const fetchProgrammes = async () => {
    try {
      const res = await api.get("/programmes");
      setProgrammes(res.data);
    } catch (err) {
      console.error("Failed to fetch programmes");
    }
  };

  useEffect(() => {
    fetchProgrammes();
  }, []);

  // ----------------------------
  // CREATE / UPDATE PROGRAMME
  // ----------------------------
  const submit = async () => {
    if (!form.name || (!editingId && !form.code)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingId) {
        // UPDATE MODE
        await api.put(`/programmes/${editingId}`, { name: form.name });
        alert("Programme updated successfully");
      } else {
        // CREATE MODE
        await api.post("/programmes", form);
        alert("Programme added successfully");
      }

      resetForm();
      fetchProgrammes();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ----------------------------
  // ACTIONS
  // ----------------------------
  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({ code: p.code, name: p.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ code: "", name: "" });
  };

  const disableProgramme = async (id) => {
    if (!window.confirm("Are you sure you want to disable this programme?")) return;
    try {
      await api.delete(`/programmes/${id}`);
      fetchProgrammes();
    } catch (err) {
      alert("Error disabling programme");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Programme Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Academic Programme Directory</h2>

        {/* UNIFIED FORM CARD */}
        <div className="card" style={{ borderLeft: editingId ? "4px solid #3b82f6" : "none" }}>
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Programme Details" : "Register New Programme"}
          </h3>
          <div className="form-grid-4" style={{ alignItems: "flex-end" }}>
            <div>
              <label>Programme Code</label>
              <input
                placeholder="1 Digit Code"
                maxLength={1}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                disabled={editingId}
                style={{ backgroundColor: editingId ? "#f1f5f9" : "#fff" }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label>Programme Name</label>
              <input
                placeholder="e.g., Bachelor of Science"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary-btn" onClick={submit}>
                {editingId ? "Update" : "+ Add Programme"}
              </button>
              {editingId && (
                <button className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
          {editingId && (
            <p style={{ fontSize: "0.8rem", color: "#3b82f6", marginTop: "10px" }}>
              ℹ️ Editing: Programme code <b>{form.code}</b> is fixed.
            </p>
          )}
        </div>

        {/* DATA TABLE CARD */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "15px" }}>Active Programmes</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>Code</th>
                  <th>Programme Full Name</th>
                  <th style={{ textAlign: "center", width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programmes.map((p) => (
                  <tr 
                    key={p._id}
                    style={{ backgroundColor: editingId === p._id ? "#eff6ff" : "transparent" }}
                  >
                    <td>
                      <span className="status-badge active">{p.code}</span>
                    </td>
                    <td style={{ fontWeight: "600" }}>{p.name}</td>
                    <td className="action-cell" style={{ textAlign: "center" }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => openEdit(p)}
                        disabled={editingId === p._id}
                        title="Edit Programme"
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn danger" 
                        onClick={() => disableProgramme(p._id)}
                        title="Disable Programme"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {programmes.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No programmes found in the system.
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

export default ProgrammeManagement;