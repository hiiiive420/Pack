import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const AdvanceSettlementManagement = () => {
  const { user, logout } = useContext(AuthContext);

  // 🔐 Permission Guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("ADVANCE_SETTLEMENT_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- STATE ----------------
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: "",
    voucherNo: "",
    name: "",
    purpose: "",
    advanceAmount: "",
    settlementDate: "",
    expenditureAmount: "",
    excessOfExpenditure: "",
    underOfExpenditure: "",
    receiptNo: ""
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
  }, []);

  const fetchRecords = async () => {
    const res = await api.get("/advance-settlements");
    setRecords(res.data);
  };

  // ---------------- FOOTER TOTALS ----------------
  const calculateAdvanceTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.advanceAmount || 0),
      0
    );
  };

  const calculateExpenditureTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.expenditureAmount || 0),
      0
    );
  };

  const calculateExcessTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.excessOfExpenditure || 0),
      0
    );
  };

  const calculateUnderTotal = () => {
    return records.reduce(
      (sum, r) => sum + Number(r.underOfExpenditure || 0),
      0
    );
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    try {
      if (!form.date || !form.voucherNo || !form.name || !form.advanceAmount) {
        alert("Required fields missing");
        return;
      }

      if (editingId) {
        await api.put(`/advance-settlements/${editingId}`, form);
        alert("Record updated");
      } else {
        await api.post("/advance-settlements", form);
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
      date: r.date || "",
      voucherNo: r.voucherNo || "",
      name: r.name || "",
      purpose: r.purpose || "",
      advanceAmount: r.advanceAmount || "",
      settlementDate: r.settlementDate || "",
      expenditureAmount: r.expenditureAmount || "",
      excessOfExpenditure: r.excessOfExpenditure || "",
      underOfExpenditure: r.underOfExpenditure || "",
      receiptNo: r.receiptNo || ""
    });
  };

  // ---------------- DELETE ----------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/advance-settlements/${id}`);
    fetchRecords();
  };

  // ---------------- UI ----------------
  return (
    <DashboardLayout user={user} logout={logout} title="Advance & Settlement">
      <div className="page-container " style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">Advance & Settlement</h2>

        {/* FORM */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>
            {editingId ? "Edit Advance & Settlement" : "Add Advance & Settlement"}
          </h3>

          {/* Advance Section */}
          <div style={{ marginBottom: 30 }}>
            <h4 style={{ 
              marginBottom: 15, 
              color: "#475569",
              fontSize: "16px",
              fontWeight: 600,
              borderBottom: "2px solid #E2E8F0",
              paddingBottom: 8
            }}>
              Advance Details
            </h4>
            <div className="form-grid-4">
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

              <div>
                <label>Voucher No</label>
                <input
                  type="text"
                  value={form.voucherNo}
                  onChange={(e) =>
                    handleTextSanitization("voucherNo", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleTextSanitization("name", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Purpose</label>
                <input
                  type="text"
                  value={form.purpose}
                  onChange={(e) =>
                    handleTextSanitization("purpose", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Advance Amount</label>
                <input
                  type="number"
                  onKeyDown={blockInvalidChar}
                  value={form.advanceAmount}
                  onChange={(e) =>
                    handleNumericChange("advanceAmount", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Settlement Section */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ 
              marginBottom: 15, 
              color: "#475569",
              fontSize: "16px",
              fontWeight: 600,
              borderBottom: "2px solid #E2E8F0",
              paddingBottom: 8
            }}>
              Settlement Details
            </h4>
            <div className="form-grid-4">
              <div>
                <label>Settlement Date</label>
                <input
                  type="date"
                  value={form.settlementDate}
                  onChange={(e) =>
                    setForm({ ...form, settlementDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Expenditure Amount</label>
                <input
                  type="number"
                  onKeyDown={blockInvalidChar}
                  value={form.expenditureAmount}
                  onChange={(e) =>
                    handleNumericChange("expenditureAmount", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Excess of Expenditure</label>
                <input
                  type="number"
                  onKeyDown={blockInvalidChar}
                  value={form.excessOfExpenditure}
                  onChange={(e) =>
                    handleNumericChange("excessOfExpenditure", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Under of Expenditure</label>
                <input
                  type="number"
                  onKeyDown={blockInvalidChar}
                  value={form.underOfExpenditure}
                  onChange={(e) =>
                    handleNumericChange("underOfExpenditure", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Receipt No</label>
                <input
                  type="text"
                  value={form.receiptNo}
                  onChange={(e) =>
                    handleTextSanitization("receiptNo", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <button className="primary-btn" onClick={submit}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TABLE remains the same... */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Advance & Settlement Records</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th rowSpan="2">S.No</th>
                  <th colSpan="5" style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>Advance</th>
                  <th colSpan="5" style={{ background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" }}>Settlement</th>
                  <th rowSpan="2">Actions</th>
                </tr>
                <tr>
                  <th>Date</th>
                  <th>Voucher No</th>
                  <th>Name</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Expenditure</th>
                  <th>Excess</th>
                  <th>Under</th>
                  <th>Receipt No</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.date?.slice(0, 10)}</td>
                    <td>{r.voucherNo}</td>
                    <td>{r.name}</td>
                    <td>{r.purpose}</td>
                    <td className="amount-bold">{r.advanceAmount}</td>
                    <td>{r.settlementDate?.slice(0, 10)}</td>
                    <td className="amount-bold">{r.expenditureAmount}</td>
                    <td className="amount-bold">{r.excessOfExpenditure}</td>
                    <td className="amount-bold">{r.underOfExpenditure}</td>
                    <td>{r.receiptNo}</td>
                    <td className="action-cell">
                      <button className="icon-btn" onClick={() => editRecord(r)}>✏️</button>
                      <button className="icon-btn danger" onClick={() => deleteRecord(r._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center", padding: 20 }}>No records available</td>
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

export default AdvanceSettlementManagement;