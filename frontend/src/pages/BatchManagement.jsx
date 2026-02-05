import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const BatchManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [batches, setBatches] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  
  // Track if we are editing
  const [editingId, setEditingId] = useState(null);

  // ---------------- LOAD DATA ----------------
  const fetchBatches = async () => {
    try {
      const res = await api.get("/batches");
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to fetch batches");
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // ---------------- SUBMIT (CREATE OR UPDATE) ----------------
  const submit = async () => {
    // Validations
    if (!startYear || !endYear) {
      alert("Please enter both start and end years.");
      return;
    }
    if (Number(endYear) <= Number(startYear)) {
      alert("End year must be greater than start year.");
      return;
    }

    try {
      if (editingId) {
        // UPDATE MODE
        await api.put(`/batches/${editingId}`, {
          startYear: Number(startYear),
          endYear: Number(endYear)
        });
        alert("Batch updated successfully");
      } else {
        // CREATE MODE
        await api.post("/batches", {
          startYear: Number(startYear),
          endYear: Number(endYear)
        });
        alert("Batch created successfully");
      }

      resetForm();
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- ACTIONS ----------------
  const openEdit = (b) => {
    setEditingId(b._id);
    setStartYear(b.startYear);
    setEndYear(b.endYear);
    // Scroll to top smoothly so user sees the form is populated
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setStartYear("");
    setEndYear("");
  };

  const disableBatch = async (id) => {
    if (!window.confirm("Are you sure you want to disable/delete this batch?")) return;
    try {
      await api.delete(`/batches/${id}`);
      fetchBatches();
    } catch (err) {
      alert("Error deleting batch");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Batch Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Academic Batch Management</h2>

        {/* UNIFIED FORM CARD (Used for both Create and Edit) */}
        <div className="card" style={{ borderLeft: editingId ? "4px solid #3b82f6" : "none" }}>
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Batch Mode" : "Create New Batch"}
          </h3>
          <div className="form-grid-4" style={{ alignItems: "flex-end" }}>
            <div>
              <label>Start Year</label>
              <input
                type="number"
                placeholder="e.g. 2023"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </div>
            <div>
              <label>End Year</label>
              <input
                type="number"
                placeholder="e.g. 2027"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-btn" onClick={submit}>
                {editingId ? "Update Batch" : "+ Add Batch"}
              </button>
              
              {editingId && (
                <button className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
          {editingId && (
            <p style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '10px' }}>
              ℹ️ You are currently editing an existing record.
            </p>
          )}
        </div>

        {/* BATCH LIST TABLE */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "15px" }}>Active Batches</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Batch Name</th>
                  <th>Duration</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b._id} style={{ backgroundColor: editingId === b._id ? "#eff6ff" : "transparent" }}>
                    <td><span className="status-badge active">{b.batchCode}</span></td>
                    <td style={{ fontWeight: "600" }}>{b.batchName}</td>
                    <td>{b.startYear} — {b.endYear}</td>
                    <td className="action-cell">
                      <button 
                        className="icon-btn" 
                        onClick={() => openEdit(b)} 
                        style={{ opacity: editingId === b._id ? 0.5 : 1 }}
                      >
                        ✏️
                      </button>
                      <button className="icon-btn danger" onClick={() => disableBatch(b._id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchManagement;