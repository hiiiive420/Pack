import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ProjectManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const [programmes, setProgrammes] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [projectSuffix, setProjectSuffix] = useState(""); 
  const [projectName, setProjectName] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);

  // ----------------------------
  // FETCH DATA
  // ----------------------------
  const fetchProgrammes = async () => {
    try {
      const res = await api.get("/programmes");
      setProgrammes(res.data);
    } catch (err) {
      console.error("Failed to fetch programmes");
    }
  };

  const fetchProjects = async (programmeCode) => {
    try {
      const res = await api.get("/projects", {
        params: { programmeCode }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProgrammes();
  }, []);

  useEffect(() => {
    if (selectedProgramme) {
      fetchProjects(selectedProgramme);
    } else {
      setProjects([]);
    }
  }, [selectedProgramme]);

  // ----------------------------
  // CREATE / UPDATE
  // ----------------------------
  const submit = async () => {
    if (editingId) {
      // UPDATE MODE
      try {
        await api.put(`/projects/${editingId}`, { name: projectName });
        alert("Project updated successfully");
        resetForm();
        fetchProjects(selectedProgramme);
      } catch (err) {
        alert("Update failed");
      }
      return;
    }

    // CREATE MODE
    if (projectSuffix.length !== 2) {
      alert("Project code must be exactly 2 digits");
      return;
    }

    const fullProjectCode = `${selectedProgramme}${projectSuffix}`;

    try {
      await api.post("/projects", {
        programmeCode: selectedProgramme,
        code: fullProjectCode,
        name: projectName
      });

      alert("Project added successfully");
      resetForm();
      fetchProjects(selectedProgramme);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add project");
    }
  };

  // ----------------------------
  // ACTIONS
  // ----------------------------
  const openEdit = (p) => {
    setEditingId(p._id);
    setProjectName(p.name);
    // Code suffix extraction if needed for display
    setProjectSuffix(p.code.replace(p.programmeCode, ""));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setProjectSuffix("");
    setProjectName("");
  };

  const disableProject = async (id) => {
    if (!window.confirm("Are you sure you want to disable this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects(selectedProgramme);
    } catch (err) {
      alert("Error disabling project");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Project Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Research & Programme Projects</h2>

        {/* PROGRAMME SELECTOR CARD */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>
            Select Parent Programme
          </label>
          <select
            className="form-select"
            style={{ width: "100%", maxWidth: "400px" }}
            value={selectedProgramme}
            onChange={(e) => {
              setSelectedProgramme(e.target.value);
              resetForm();
            }}
          >
            <option value="">-- Choose a Programme --</option>
            {programmes.map((p) => (
              <option key={p._id} value={p.code}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProgramme && (
          <>
            {/* ADD/EDIT FORM CARD */}
            <div className="card fade-in" style={{ borderLeft: editingId ? "4px solid #3b82f6" : "none" }}>
              <h3 style={{ marginBottom: "20px" }}>
                {editingId ? `Editing Project: ${selectedProgramme}${projectSuffix}` : "Register New Project"}
              </h3>
              
              <div className="form-grid-4" style={{ alignItems: "flex-end" }}>
                <div>
                  <label>Programme Reference</label>
                  <div className="status-badge active" style={{ padding: '10px', textAlign: 'center', width: '100%' }}>
                    {selectedProgramme}
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <label>Project Suffix (2 Digits)</label>
                    <input
                      maxLength={2}
                      placeholder="e.g. 01"
                      value={projectSuffix}
                      onChange={(e) => setProjectSuffix(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                )}

                <div style={{ flex: 2 }}>
                  <label>Project Name</label>
                  <input
                    placeholder="e.g. Final Dissertation"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="primary-btn" onClick={submit}>
                    {editingId ? "Update" : "Add Project"}
                  </button>
                  {editingId && (
                    <button className="secondary-btn" onClick={resetForm}>Cancel</button>
                  )}
                </div>
              </div>

              {!editingId && projectSuffix.length > 0 && (
                <p style={{ marginTop: "15px", color: "#64748b", fontSize: "0.9rem" }}>
                  System Code Preview: <b style={{ color: "#3b82f6" }}>{selectedProgramme}{projectSuffix}</b>
                </p>
              )}
            </div>

            {/* PROJECT LIST TABLE */}
            <div className="card fade-in" style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "15px" }}>Projects under {selectedProgramme}</h3>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "150px" }}>Full Code</th>
                      <th>Project Title</th>
                      <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p._id} style={{ backgroundColor: editingId === p._id ? "#eff6ff" : "transparent" }}>
                        <td>
                          <span className="status-badge active">{p.code}</span>
                        </td>
                        <td style={{ fontWeight: "600" }}>{p.name}</td>
                        <td className="action-cell">
                          <button className="icon-btn" onClick={() => openEdit(p)}>✏️</button>
                          <button className="icon-btn danger" onClick={() => disableProject(p._id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                          No projects registered for this programme yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectManagement;