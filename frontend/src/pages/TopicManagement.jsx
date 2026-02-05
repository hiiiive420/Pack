import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const TopicManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [topics, setTopics] = useState([]);
  const [topicCode, setTopicCode] = useState("");
  const [topicName, setTopicName] = useState("");

  // Track if we are editing
  const [editingId, setEditingId] = useState(null);

  // ---------------- LOAD DATA ----------------
  const fetchTopics = async () => {
    try {
      const res = await api.get("/topics");
      setTopics(res.data);
    } catch (err) {
      console.error("Failed to fetch topics");
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ---------------- SUBMIT (CREATE OR UPDATE) ----------------
  const submit = async () => {
    if (!topicName || (!editingId && !topicCode)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingId) {
        // UPDATE MODE
        await api.put(`/topics/${editingId}`, {
          topicName: topicName
        });
        alert("Topic updated successfully");
      } else {
        // CREATE MODE
        await api.post("/topics", {
          topicCode,
          topicName
        });
        alert("Topic added successfully");
      }

      resetForm();
      fetchTopics();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- ACTIONS ----------------
  const openEdit = (t) => {
    setEditingId(t._id);
    setTopicCode(t.topicCode); // Shown but disabled in edit
    setTopicName(t.topicName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setTopicCode("");
    setTopicName("");
  };

  const disableTopic = async (id) => {
    if (!window.confirm("Are you sure you want to disable this topic?")) return;
    try {
      await api.delete(`/topics/${id}`);
      fetchTopics();
    } catch (err) {
      alert("Error deleting topic");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Topic Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Curriculum Topic Management</h2>

        {/* UNIFIED FORM CARD */}
        <div className="card" style={{ borderLeft: editingId ? "4px solid #3b82f6" : "none" }}>
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Topic Details" : "Add New Topic"}
          </h3>
          <div className="form-grid-4" style={{ alignItems: "flex-end" }}>
            <div>
              <label>Topic Code</label>
              <input
                placeholder="e.g. T001"
                value={topicCode}
                onChange={(e) => setTopicCode(e.target.value.toUpperCase())}
                disabled={editingId}
                style={{ backgroundColor: editingId ? "#f1f5f9" : "#fff" }}
              />
            </div>
            <div>
              <label>Topic Description/Name</label>
              <input
                placeholder="e.g. Advanced Thermodynamics"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary-btn" onClick={submit}>
                {editingId ? "Update Topic" : "+ Add Topic"}
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
              ℹ️ Topic codes are unique identifiers and cannot be changed.
            </p>
          )}
        </div>

        {/* TOPIC LIST TABLE */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "15px" }}>Available Topics</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "150px" }}>Topic Code</th>
                  <th>Topic Name</th>
                  <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr 
                    key={t._id} 
                    style={{ backgroundColor: editingId === t._id ? "#eff6ff" : "transparent" }}
                  >
                    <td>
                      <span className="status-badge active">{t.topicCode}</span>
                    </td>
                    <td style={{ fontWeight: "600" }}>{t.topicName}</td>
                    <td className="action-cell">
                      <button 
                        className="icon-btn" 
                        onClick={() => openEdit(t)}
                        disabled={editingId === t._id}
                        title="Edit Topic"
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn danger" 
                        onClick={() => disableTopic(t._id)}
                        title="Delete Topic"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {topics.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No topics found in the curriculum.
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

export default TopicManagement;