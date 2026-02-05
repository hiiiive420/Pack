import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { LOAN_TYPES } from "../constants/loanTypes";
import "../styles/com.css";

const LoanLedgerManagement = () => {
  const { user, logout } = useContext(AuthContext);

  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("LOAN_LEDGER_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [payees, setPayees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    loanCode: "",
    typeOfLoan: "",
    payeeId: "",
    empNo: "",
    employeeName: "",
    designation: "",
    payableAmount: "",
    paidAmount: "",
    noOfInstalment: "",
    lastInstalmentDate: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- VALIDATION HELPERS ---------------- */
  const blockInvalidChar = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (field, val) => {
    // Only allow positive numbers or empty string
    if (val !== "" && parseFloat(val) < 0) return;
    setForm({ ...form, [field]: val });
  };

  const handleTextSanitization = (field, val) => {
    // Basic sanitization for alphanumeric codes
    const cleanVal = val.replace(/[^a-zA-Z0-9\s.\-/]/g, "");
    setForm({ ...form, [field]: cleanVal });
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    fetchRecords();
    fetchPayees();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/loan-ledgers");
    setRecords(res.data);
  };

  const fetchPayees = async () => {
    const res = await api.get("/payees");
    setPayees(res.data);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    try {
      // Basic Required Check
      if (!form.payeeId || !form.typeOfLoan || !form.loanCode) {
        alert("Loan Code, Employee, and Type of Loan are required");
        return;
      }

      // Logic Check: Paid amount shouldn't exceed payable amount
      if (parseFloat(form.paidAmount) > parseFloat(form.payableAmount)) {
        alert("Paid Amount cannot be greater than Payable Amount");
        return;
      }

      // 🔐 FRONTEND SAFETY CHECK
      if (!form.empNo || !form.employeeName || !form.designation) {
        alert("Employee details not loaded. Please reselect employee.");
        return;
      }

      const payload = {
        loanCode: form.loanCode,
        typeOfLoan: form.typeOfLoan,
        payeeId: form.payeeId,
        empNo: form.empNo,
        employeeName: form.employeeName,
        designation: form.designation,
        payableAmount: form.payableAmount,
        paidAmount: form.paidAmount,
        noOfInstalment: form.noOfInstalment,
        lastInstalmentDate: form.lastInstalmentDate
      };

      if (editingId) {
        await api.put(`/loan-ledgers/${editingId}`, payload);
        alert("Record updated");
      } else {
        await api.post("/loan-ledgers", payload);
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
  const editRecord = (rec) => {
    setEditingId(rec._id);
    setForm({
      loanCode: rec.loanCode || "",
      typeOfLoan: rec.typeOfLoan || "",
      payeeId: rec.payeeId?._id || "",
      empNo: rec.empNo || "",
      employeeName: rec.employeeName || "",
      designation: rec.designation || "",
      payableAmount: rec.payableAmount || "",
      paidAmount: rec.paidAmount || "",
      noOfInstalment: rec.noOfInstalment || "",
      lastInstalmentDate: rec.lastInstalmentDate || ""
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/loan-ledgers/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Loan Ledger">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div style={{ display: "flex", gap: "24px" }}>
          {/* LEFT SIDE - MAIN CONTENT */}
          <div style={{ flex: 3 }}>
            <h2 className="page-title">Loan Ledger</h2>

            {/* FORM */}
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>
                {editingId ? "Edit Loan Record" : "Add Loan Record"}
              </h3>

              <div className="form-grid-4">
                {/* Loan Code */}
                <div>
                  <label>Loan Code</label>
                  <input
                    type="text"
                    value={form.loanCode}
                    onChange={(e) => handleTextSanitization("loanCode", e.target.value)}
                  />
                </div>

                {/* Type of Loan */}
                <div>
                  <label>Type of Loan</label>
                  <select
                    value={form.typeOfLoan}
                    onChange={(e) =>
                      setForm({ ...form, typeOfLoan: e.target.value })
                    }
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
                    <option value="">Select Type</option>
                    {LOAN_TYPES.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Employee No (Selector) */}
                <div>
                  <label>Emp. No</label>
                  <select
                    value={form.payeeId}
                    onChange={(e) => {
                      const selected = payees.find(
                        (p) => p._id === e.target.value
                      );

                      if (!selected) return;

                      setForm({
                        ...form,
                        payeeId: selected._id,
                        empNo: selected.payeeNumber,
                        employeeName: selected.name,
                        designation: selected.designation
                      });
                    }}
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
                    <option value="">Select Employee</option>
                    {payees.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.payeeNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Name (Display) */}
                <div>
                  <label>Employee Name</label>
                  <input
                    type="text"
                    value={form.employeeName}
                    disabled
                    style={{ backgroundColor: "#F1F5F9", cursor: "not-allowed" }}
                  />
                </div>

                {/* Designation (Display) */}
                <div>
                  <label>Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    disabled
                    style={{ backgroundColor: "#F1F5F9", cursor: "not-allowed" }}
                  />
                </div>

                {/* Payable Amount */}
                <div>
                  <label>Payable Amount</label>
                  <input
                    type="number"
                    onKeyDown={blockInvalidChar}
                    value={form.payableAmount}
                    onChange={(e) => handleNumericChange("payableAmount", e.target.value)}
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label>Paid Amount</label>
                  <input
                    type="number"
                    onKeyDown={blockInvalidChar}
                    value={form.paidAmount}
                    onChange={(e) => handleNumericChange("paidAmount", e.target.value)}
                  />
                </div>

                {/* No. of Instalment */}
                <div>
                  <label>No. of Instalment</label>
                  <input
                    type="number"
                    onKeyDown={blockInvalidChar}
                    value={form.noOfInstalment}
                    onChange={(e) => handleNumericChange("noOfInstalment", e.target.value)}
                  />
                </div>

                {/* Last Instalment Date */}
                <div>
                  <label>Last Instalment Date</label>
                  <input
                    type="date"
                    value={form.lastInstalmentDate}
                    onChange={(e) =>
                      setForm({ ...form, lastInstalmentDate: e.target.value })
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
              <h3 style={{ marginBottom: 20 }}>Loan Records</h3>

              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan Code</th>
                      <th>Type of Loan</th>
                      <th>Employee Name</th>
                      <th>Emp. No</th>
                      <th>Designation</th>
                      <th>Payable Amount</th>
                      <th>Paid Amount</th>
                      <th>No. of Instalment</th>
                      <th>Last Instalment Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id}>
                        <td>{r.loanCode}</td>
                        <td>{r.typeOfLoan}</td>
                        <td>{r.employeeName}</td>
                        <td>{r.empNo}</td>
                        <td>{r.designation}</td>
                        <td className="amount-bold">{r.payableAmount}</td>
                        <td className="amount-bold">{r.paidAmount}</td>
                        <td>{r.noOfInstalment}</td>
                        <td>{r.lastInstalmentDate}</td>
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
                        <td colSpan="10" style={{ textAlign: "center", padding: 20 }}>
                          No loan records available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - LOAN TYPES */}
          <div style={{ flex: 1 }}>
            <div className="card" style={{ position: "sticky", top: 20 }}>
              <h4 style={{ textAlign: "center", marginBottom: 16 }}>TYPE OF LOAN</h4>
              <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                {LOAN_TYPES.map((type, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    {type}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanLedgerManagement;