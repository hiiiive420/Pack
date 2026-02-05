import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const DepartmentManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // ---------------- STATE ----------------
  const [programmes, setProgrammes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [deptSuffix, setDeptSuffix] = useState(""); // 2 digits
  const [deptName, setDeptName] = useState("");

  // Edit/Update Tracking
  const [editingId, setEditingId] = useState(null);

  // ---------------- DATA FETCHING ----------------
  const fetchProgrammes = async () => {
    const res = await api.get("/programmes");
    setProgrammes(res.data);
  };

  const fetchProjects = async (programmeCode) => {
    const res = await api.get("/projects", {
      params: { programmeCode }
    });
    setProjects(res.data);
  };

  const fetchDepartments = async (projectCode) => {
    const res = await api.get("/departments", {
      params: { projectCode }
    });
    setDepartments(res.data);
  };

  useEffect(() => {
    fetchProgrammes();
  }, []);

  useEffect(() => {
    if (selectedProgramme) {
      fetchProjects(selectedProgramme);
      setSelectedProject("");
      setDepartments([]);
    }
  }, [selectedProgramme]);

  useEffect(() => {
    if (selectedProject) {
      fetchDepartments(selectedProject);
    }
  }, [selectedProject]);

  // ---------------- ACTIONS ----------------
  const submit = async () => {
    if (!editingId && deptSuffix.length !== 2) {
      alert("Department code must be exactly 2 digits");
      return;
    }
    if (!deptName) {
      alert("Department name is required");
      return;
    }

    try {
      if (editingId) {
        // UPDATE MODE
        await api.put(`/departments/${editingId}`, {
          name: deptName
        });
        alert("Department updated successfully");
      } else {
        // CREATE MODE
        const fullCode = `${selectedProject}${deptSuffix}`;
        await api.post("/departments", {
          programmeCode: selectedProgramme,
          projectCode: selectedProject,
          code: fullCode,
          name: deptName
        });
        alert("Department added successfully");
      }

      resetForm();
      fetchDepartments(selectedProject);
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDeptSuffix("");
    setDeptName("");
  };

  const populateEdit = (dept) => {
    setEditingId(dept._id);
    setDeptName(dept.name);
    // Suffix is usually not editable as it's part of the unique code
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const disableDepartment = async (id) => {
    if (!window.confirm("Disable this department?")) return;
    await api.delete(`/departments/${id}`);
    fetchDepartments(selectedProject);
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Department Management">
      <div className="page-container " style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Department Hierarchical Management</h2>

        {/* SELECTION CARD */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "15px" }}>Structure Selection</h3>
          <div className="form-grid-4">
            <div>
              <label>Academic Programme</label>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                disabled={editingId} // Prevent structure change while editing
              >
                <option value="">Select Programme</option>
                {programmes.map((p) => (
                  <option key={p._id} value={p.code}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProgramme && (
              <div>
                <label>Related Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={editingId}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* INPUT CARD - IN-PLACE EDITING */}
        {selectedProject && (
          <div className="card" style={{ borderLeft: editingId ? "4px solid #3b82f6" : "none" }}>
            <h3 style={{ marginBottom: "15px" }}>
              {editingId ? "Update Department Details" : "Add New Department"}
            </h3>
            
            <div className="form-grid-4" style={{ alignItems: "flex-end" }}>
              <div>
                <label>Department Name</label>
                <input
                  placeholder="e.g. Finance & Accounts"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>

              {!editingId && (
                <div>
                  <label>Dept. Suffix (2 Digits)</label>
                  <input
                    maxLength={2}
                    placeholder="01"
                    value={deptSuffix}
                    onChange={(e) => setDeptSuffix(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              )}

              {!editingId && (
                <div style={{ paddingBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Final Code: <b style={{ color: "#0f172a" }}>{selectedProject}{deptSuffix}</b>
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="primary-btn" onClick={submit}>
                  {editingId ? "Update Dept" : "Add Dept"}
                </button>
                {editingId && (
                  <button className="secondary-btn" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DATA TABLE CARD */}
        {selectedProject && departments.length > 0 && (
          <div className="card" style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: "15px" }}>Department List for {selectedProject}</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Department Name</th>
                    <th>Project</th>
                    <th>Programme</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr 
                      key={d._id} 
                      style={{ backgroundColor: editingId === d._id ? "#eff6ff" : "transparent" }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        <span className="status-badge active">{d.code}</span>
                      </td>
                      <td>{d.name}</td>
                      <td style={{ color: "#64748b" }}>{d.projectCode}</td>
                      <td style={{ color: "#64748b" }}>{d.programmeCode}</td>
                      <td className="action-cell">
                        <button className="icon-btn" onClick={() => populateEdit(d)}>✏️</button>
                        <button className="icon-btn danger" onClick={() => disableDepartment(d._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DepartmentManagement;