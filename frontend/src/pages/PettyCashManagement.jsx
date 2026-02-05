import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const PettyCashManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("PETTY_CASH_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: "",
    departmentId: "",
    departmentName: "",
    approvedAmount: "",
    description: "",
    expenseAmount: "",
    balanceAmount: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (field, val) => {
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
    fetchDepartments();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/petty-cash");
    setRecords(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data.filter(d => d.isActive));
  };

  // ---------------- FOOTER TOTALS ----------------
  const calculateApprovedTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.approvedAmount || 0),
      0
    );
  };

  const calculateExpenseTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.expenseAmount || 0),
      0
    );
  };

  const calculateBalanceTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.balanceAmount || 0),
      0
    );
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    try {
      if (
        !form.date ||
        !form.departmentId ||
        !form.approvedAmount ||
        !form.expenseAmount ||
        !form.balanceAmount
      ) {
        alert("Required fields missing");
        return;
      }

      if (editingId) {
        await api.put(`/petty-cash/${editingId}`, form);
        alert("Record updated");
      } else {
        await api.post("/petty-cash", form);
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
      departmentId: r.departmentId || "",
      departmentName: r.departmentName || "",
      approvedAmount: r.approvedAmount || "",
      description: r.description || "",
      expenseAmount: r.expenseAmount || "",
      balanceAmount: r.balanceAmount || ""
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/petty-cash/${id}`);
    fetchRecords();
  };

  // ---------------- HANDLE DEPARTMENT SELECTION ----------------
  const handleDepartmentChange = (e) => {
    const selectedDeptId = e.target.value;
    const d = departments.find(x => x._id === selectedDeptId);
    
    if (!d) {
      setForm({
        ...form,
        departmentId: "",
        departmentName: ""
      });
      return;
    }

    setForm({
      ...form,
      departmentId: d._id,
      departmentName: d.name
    });
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Petty Cash">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Petty Cash</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Petty Cash Record" : "Add Petty Cash Record"}
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

            {/* Department Selection */}
            <div>
              <label>Department No</label>
              <select
                value={form.departmentId}
                onChange={handleDepartmentChange}
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  background: "#fff"
                }}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Name */}
            <div>
              <label>Name of Department</label>
              <input
                type="text"
                value={form.departmentName}
                disabled
                style={{
                  background: "#f1f5f9",
                  cursor: "not-allowed"
                }}
              />
            </div>

            {/* Approved Amount */}
            <div>
              <label>Approved Amount</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.approvedAmount}
                onChange={(e) =>
                  handleNumericChange("approvedAmount", e.target.value)
                }
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

            {/* Expense Amount */}
            <div>
              <label>Expense Amount</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.expenseAmount}
                onChange={(e) =>
                  handleNumericChange("expenseAmount", e.target.value)
                }
              />
            </div>

            {/* Balance Amount */}
            <div>
              <label>Balance Amount</label>
              <input
                type="number"
                onKeyDown={blockInvalidChar}
                placeholder="0.00"
                value={form.balanceAmount}
                onChange={(e) =>
                  handleNumericChange("balanceAmount", e.target.value)
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
          <h3 style={{ marginBottom: 20 }}>Petty Cash Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Dept. No</th>
                  <th>Name of Department</th>
                  <th>Approved Amount</th>
                  <th>Description</th>
                  <th>Expense Amount</th>
                  <th>Balance Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.departmentCode}</td>
                    <td>{r.departmentName}</td>
                    <td className="amount-bold">{r.approvedAmount}</td>
                    <td>{r.description}</td>
                    <td className="amount-bold">{r.expenseAmount}</td>
                    <td className="amount-bold">{r.balanceAmount}</td>
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
                    <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                      No petty cash records available
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

export default PettyCashManagement;