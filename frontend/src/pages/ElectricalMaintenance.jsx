import { useContext, useEffect, useState } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const ElectricalMaintenance = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- MASTER DATA ----------------
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meters, setMeters] = useState([]);

  // ---------------- FORM STATE ----------------
  const [form, setForm] = useState({
    meterNo: "",
    projectCode: "",
    departmentCode: "",
    building: "",
    ownership: "",
    vote: "",
    sourceOfFund: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // New: Validation error state

  // ---------------- FETCH PROJECTS ----------------
  useEffect(() => {
    api.get("/projects").then(r => setProjects(r.data));
    loadMeters();
  }, []);

  // ---------------- FETCH DEPARTMENTS ----------------
  useEffect(() => {
    if (!form.projectCode) {
      setDepartments([]);
      return;
    }

    api.get("/departments", {
      params: { projectCode: form.projectCode }
    }).then(r => setDepartments(r.data));
  }, [form.projectCode]);

  // ---------------- LOAD METERS ----------------
  const loadMeters = async () => {
    const res = await api.get("/electrical-meters");
    setMeters(res.data);
  };

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setForm({
      meterNo: "",
      projectCode: "",
      departmentCode: "",
      building: "",
      ownership: "",
      vote: "",
      sourceOfFund: ""
    });
    setEditingId(null);
    setErrors({});
  };

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors = {};
    if (!form.meterNo) newErrors.meterNo = "Meter Number is required";
    if (!form.projectCode) newErrors.projectCode = "Project selection is required";
    if (!form.departmentCode) newErrors.departmentCode = "Department selection is required";
    if (!form.building) newErrors.building = "Building name is required";
    if (!form.ownership) newErrors.ownership = "Ownership detail is required";
    if (!form.vote) newErrors.vote = "Vote number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await api.put(`/electrical-meters/${editingId}`, form);
        alert("Meter updated");
      } else {
        await api.post("/electrical-meters", form);
        alert("Meter created");
      }

      resetForm();
      loadMeters();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EDIT ----------------
  const editMeter = (m) => {
    setForm({
      meterNo: m.meterNo,
      projectCode: m.projectCode,
      departmentCode: m.departmentCode,
      building: m.building,
      ownership: m.ownership,
      vote: m.vote,
      sourceOfFund: m.sourceOfFund || ""
    });
    setEditingId(m._id);
    setErrors({});
  };

  // ---------------- DISABLE ----------------
  const disableMeter = async (id) => {
    if (!window.confirm("Disable this meter?")) return;
    await api.delete(`/electrical-meters/${id}`);
    loadMeters();
  };

  // Helper to apply error styling
  const inputErrorStyle = { border: "1px solid #EF4444" };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Electrical Maintenance">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Electrical Maintenance</h2>

        {/* -------- FORM -------- */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Meter" : "Add Meter"}
          </h3>

          <div className="form-grid-4">
            {/* Meter Number */}
            <div>
              <label>Meter Number <span style={{color: '#EF4444'}}>*</span></label>
              <input
                type="text"
                placeholder="Meter Number"
                value={form.meterNo}
                disabled={!!editingId}
                onChange={e => handleChange("meterNo", e.target.value.trim())}
                style={{
                    ...(editingId ? { backgroundColor: "#F1F5F9", cursor: "not-allowed" } : {}),
                    ...(errors.meterNo ? inputErrorStyle : {})
                }}
              />
              {errors.meterNo && <span style={{ fontSize: "12px", color: "#EF4444" }}>{errors.meterNo}</span>}
            </div>

            {/* Project Code */}
            <div>
              <label>Project <span style={{color: '#EF4444'}}>*</span></label>
              <select
                value={form.projectCode}
                onChange={e => handleChange("projectCode", e.target.value)}
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: errors.projectCode ? "1px solid #EF4444" : "1px solid #CBD5E1",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  background: "#fff"
                }}
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p.code}>
                    {p.code}
                  </option>
                ))}
              </select>
              {errors.projectCode && <span style={{ fontSize: "12px", color: "#EF4444" }}>{errors.projectCode}</span>}
            </div>

            {/* Department Code */}
            <div>
              <label>Department <span style={{color: '#EF4444'}}>*</span></label>
              <select
                value={form.departmentCode}
                onChange={e => handleChange("departmentCode", e.target.value)}
                disabled={!form.projectCode}
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: errors.departmentCode ? "1px solid #EF4444" : "1px solid #CBD5E1",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  background: !form.projectCode ? "#F1F5F9" : "#fff",
                  cursor: !form.projectCode ? "not-allowed" : "pointer"
                }}
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d._id} value={d.code}>
                    {d.code}
                  </option>
                ))}
              </select>
              {errors.departmentCode && <span style={{ fontSize: "12px", color: "#EF4444" }}>{errors.departmentCode}</span>}
            </div>

            {/* Building */}
            <div>
              <label>Building <span style={{color: '#EF4444'}}>*</span></label>
              <input
                type="text"
                placeholder="Building"
                value={form.building}
                onChange={e => handleChange("building", e.target.value)}
                style={errors.building ? inputErrorStyle : {}}
              />
              {errors.building && <span style={{ fontSize: "12px", color: "#EF4444" }}>{errors.building}</span>}
            </div>

            {/* Ownership */}
            <div>
              <label>Ownership <span style={{color: '#EF4444'}}>*</span></label>
              <input
                type="text"
                placeholder="Ownership"
                value={form.ownership}
                onChange={e => handleChange("ownership", e.target.value)}
                style={errors.ownership ? inputErrorStyle : {}}
              />
              {errors.ownership && <span style={{ fontSize: "12px", color: "#EF4444" }}>{errors.ownership}</span>}
            </div>

            {/* Vote */}
            <div>
              <label>Vote <span style={{color: '#EF4444'}}>*</span></label>
              <input
                type="text"
                placeholder="Vote"
                value={form.vote}
                onChange={e => handleChange("vote", e.target.value)}
                style={errors.vote ? inputErrorStyle : {}}
              />
              {errors.vote && <span style={{ fontSize: "12px", color: "#EF4444" }}>{errors.vote}</span>}
            </div>

            {/* Source of Fund */}
            <div>
              <label>Source of Fund (optional)</label>
              <input
                type="text"
                placeholder="Source of Fund"
                value={form.sourceOfFund}
                onChange={e => handleChange("sourceOfFund", e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary-btn" onClick={submit} disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* -------- TABLE -------- */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Meter Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Meter</th>
                  <th>Project</th>
                  <th>Department</th>
                  <th>Building</th>
                  <th>Ownership</th>
                  <th>Vote</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meters.map(m => (
                  <tr key={m._id}>
                    <td>{m.meterNo}</td>
                    <td>{m.projectCode}</td>
                    <td>{m.departmentCode}</td>
                    <td>{m.building}</td>
                    <td>{m.ownership}</td>
                    <td>{m.vote}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editMeter(m)}>
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => disableMeter(m._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {meters.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                      No meter records available
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

export default ElectricalMaintenance;