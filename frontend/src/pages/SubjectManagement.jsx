import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const SubjectManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [subjects, setSubjects] = useState([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");

  // Track if we are editing
  const [editingId, setEditingId] = useState(null);

  // ---------------- LOAD DATA ----------------
  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("Failed to fetch subjects");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ---------------- SUBMIT (CREATE OR UPDATE) ----------------
  const submit = async () => {
    if (!subjectName || (!editingId && !subjectCode)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingId) {
        // UPDATE MODE
        await api.put(`/subjects/${editingId}`, {
          subjectName: subjectName
        });
        alert("Subject updated successfully");
      } else {
        // CREATE MODE
        await api.post("/subjects", {
          subjectCode,
          subjectName
        });
        alert("Subject added successfully");
      }

      resetForm();
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- ACTIONS ----------------
  const openEdit = (s) => {
    setEditingId(s._id);
    setSubjectCode(s.subjectCode); // Shown but usually disabled in edit
    setSubjectName(s.subjectName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setSubjectCode("");
    setSubjectName("");
  };

  const disableSubject = async (id) => {
    if (!window.confirm("Are you sure you want to disable this subject?")) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert("Error deleting subject");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Subject Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Academic Subject Management</h2>

        {/* UNIFIED FORM CARD */}
        <div className="card" style={{ borderLeft: editingId ? "4px solid #3b82f6" : "none" }}>
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Subject Details" : "Add New Subject"}
          </h3>
          <div className="form-grid-4" style={{ alignItems: "flex-end" }}>
            <div>
              <label>Subject Code</label>
              <input
                placeholder="e.g. SUB101"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                disabled={editingId} // Code should not be changed once created
                style={{ backgroundColor: editingId ? "#f1f5f9" : "#fff" }}
              />
            </div>
            <div>
              <label>Subject Name</label>
              <input
                placeholder="e.g. Mathematics"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary-btn" onClick={submit}>
                {editingId ? "Update Subject" : "+ Add Subject"}
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
              ℹ️ Subject code cannot be modified during editing.
            </p>
          )}
        </div>

        {/* SUBJECT LIST TABLE */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "15px" }}>Registered Subjects</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "150px" }}>Code</th>
                  <th>Subject Name</th>
                  <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr 
                    key={s._id} 
                    style={{ backgroundColor: editingId === s._id ? "#eff6ff" : "transparent" }}
                  >
                    <td>
                      <span className="status-badge active">{s.subjectCode}</span>
                    </td>
                    <td style={{ fontWeight: "600" }}>{s.subjectName}</td>
                    <td className="action-cell">
                      <button 
                        className="icon-btn" 
                        onClick={() => openEdit(s)}
                        disabled={editingId === s._id}
                      >
                        ✏️
                      </button>
                      <button className="icon-btn danger" onClick={() => disableSubject(s._id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                      No subjects found.
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

export default SubjectManagement;