import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const MiscellaneousManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MISCELLANEOUS_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expenditureCodes, setExpenditureCodes] = useState([]);

  const emptyForm = {
    date: "",
    expenditureCode: "",
    expenditureType: "",
    description: "",
    amount: "",
    remarks: ""
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
    // Rejects negative values
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
    const [r, ec] = await Promise.all([
      api.get("/miscellaneous"),
      api.get("/expenditure-codes")
    ]);

    setRecords(r.data);
    setExpenditureCodes(ec.data);
  };

  // ---------------- FOOTER TOTAL (SUM OF AMOUNT COLUMN) ----------------
  const calculateFooterTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    try {
      if (!form.date || !form.expenditureCode || !form.expenditureType || !form.amount) {
        alert("Required fields missing");
        return;
      }

      if (editingId) {
        await api.put(`/miscellaneous/${editingId}`, form);
        alert("Record updated");
      } else {
        await api.post("/miscellaneous", form);
        alert("Record added");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ---------------- EDIT ----------------
  const editRecord = (r) => {
    setEditingId(r._id);
    setForm({
      date: r.date?.slice(0, 10) || "",
      expenditureCode: r.expenditureCode || "",
      expenditureType: r.expenditureType || "",
      description: r.description || "",
      amount: r.amount || "",
      remarks: r.remarks || ""
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/miscellaneous/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Miscellaneous Expenditure">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Miscellaneous Expenditure</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Miscellaneous Record" : "Add Miscellaneous Record"}
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

            {/* Code of Expenditure */}
            <div>
              <label>Code of Expenditure</label>
              <select
                value={form.expenditureCode}
                onChange={(e) => {
                  const selected = expenditureCodes.find(
                    x => x.code === e.target.value
                  );
                  if (!selected) return;

                  setForm({
                    ...form,
                    expenditureCode: selected.code,
                    expenditureType: selected.name // ✅ auto-fill
                  });
                }}
              >
                <option value="">Select Expenditure Code</option>
                {expenditureCodes.map(ec => (
                  <option key={ec._id} value={ec.code}>
                    {ec.code} – {ec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type of Expenditure */}
            <div>
              <label>Type of Expenditure</label>
              <input
                value={form.expenditureType}
                disabled
                style={{ backgroundColor: "#f1f5f9" }}
                placeholder="Auto-filled"
              />
            </div>

            {/* Description */}
            <div>
              <label>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  handleTextSanitization("description", e.target.value)
                }
              />
            </div>

            {/* Amount */}
            <div>
              <label>Amount</label>
              <input
                type="number"
                min="0"
                onKeyDown={blockInvalidChar}
                value={form.amount}
                onChange={(e) =>
                  handleNumericChange("amount", e.target.value)
                }
              />
            </div>

            {/* Remarks */}
            <div>
              <label>Remarks</label>
              <input
                type="text"
                value={form.remarks}
                onChange={(e) =>
                  handleTextSanitization("remarks", e.target.value)
                }
              />
            </div>
          </div>

          <button className="primary-btn" onClick={submit}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Miscellaneous Expenditure Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Code of Expenditure</th>
                  <th>Type of Expenditure</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.expenditureCode}</td>
                    <td>{r.expenditureType}</td>
                    <td>{r.description}</td>
                    <td className="amount-bold">{r.amount}</td>
                    <td>{r.remarks}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => deleteRecord(r._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {records.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 20 }}>
                      No miscellaneous expenditure records available
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

export default MiscellaneousManagement;