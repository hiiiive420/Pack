import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const AgraharaInsuranceManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("AGAHARA_INSURANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: "",
    description: "",
    noOfContribute: "",
    universityContribution: "",
    staffContribution: "",
    totalAmount: ""
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
    // Rejects negative values from being stored in state
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    // Strips injection characters while allowing alphanumeric and basic punctuation
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/agrahara-insurances");
    setRecords(res.data);
  };

  // ---------------- FOOTER TOTAL (SUM OF TOTAL COLUMN) ----------------
  const calculateFooterTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.totalAmount || 0),
      0
    );
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (
      !form.date ||
      !form.description ||
      !form.noOfContribute ||
      !form.totalAmount
    ) {
      alert("All fields are required");
      return;
    }

    if (editingId) {
      await api.put(`/agrahara-insurances/${editingId}`, form);
      alert("Record updated");
    } else {
      await api.post("/agrahara-insurances", form);
      alert("Record added");
    }

    setForm(emptyForm);
    setEditingId(null);
    fetchRecords();
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      date: r.date?.slice(0, 10),
      description: r.description,
      noOfContribute: r.noOfContribute,
      universityContribution: r.universityContribution,
      staffContribution: r.staffContribution,
      totalAmount: r.totalAmount
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/agrahara-insurances/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Agrahara Insurance">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Agrahara Insurance</h2>

        {/* FORM CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Insurance Record" : "Add Insurance Record"}
          </h3>

          <div className="form-grid-4">
            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <label>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleTextSanitization("description", e.target.value)}
                placeholder="Description"
              />
            </div>

            {/* No. of Contribute */}
            <div>
              <label>No. of Contribute</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                value={form.noOfContribute}
                onChange={(e) => handleNumericChange("noOfContribute", e.target.value)}
                placeholder="0"
              />
            </div>

            {/* University Contribution */}
            <div>
              <label>University Contribution</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                value={form.universityContribution}
                onChange={(e) => handleNumericChange("universityContribution", e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Staff Contribution */}
            <div>
              <label>Staff Contribution</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                value={form.staffContribution}
                onChange={(e) => handleNumericChange("staffContribution", e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label>Total Amount</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                value={form.totalAmount}
                onChange={(e) => handleNumericChange("totalAmount", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit}>
            {editingId ? "Update Record" : "Add Record"}
          </button>
        </div>

        {/* RECORDS TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Saved Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>No. of Contribute</th>
                  <th style={{ textAlign: "right" }}>University Contribution</th>
                  <th style={{ textAlign: "right" }}>Staff Contribution</th>
                  <th style={{ textAlign: "right" }}>Total Amount</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, index) => (
                  <tr key={r._id}>
                    <td>{index + 1}</td>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.description}</td>
                    <td style={{ textAlign: "right" }}>{r.noOfContribute}</td>
                    <td style={{ textAlign: "right" }}>{r.universityContribution}</td>
                    <td style={{ textAlign: "right" }}>{r.staffContribution}</td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>
                      {r.totalAmount}
                    </td>
                    <td className="action-cell">
                      <button 
                        className="icon-btn" 
                        onClick={() => editRecord(r)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => deleteRecord(r._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {records.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#9CA3AF" }}>
                      No records available
                    </td>
                  </tr>
                )}

                {/* ✅ FOOTER TOTAL */}
                {records.length > 0 && (
                  <tr className="table-footer">
                    <td colSpan="6" style={{ textAlign: "right", fontWeight: 600 }}>
                      Grand Total
                    </td>
                    <td className="amount-bold" style={{ textAlign: "right" }}>
                      {calculateFooterTotal()}
                    </td>
                    <td />
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

export default AgraharaInsuranceManagement;