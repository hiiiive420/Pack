import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const PayeeList = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔐 Permission guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  const [payees, setPayees] = useState([]);

  // ---------------- LOAD PAYEES ----------------
  useEffect(() => {
    fetchPayees();
  }, []);

  const fetchPayees = async () => {
    try {
      const res = await api.get("/payees");
      setPayees(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  // ---------------- DELETE ----------------
  const deletePayee = async (id) => {
    if (!window.confirm("Disable this payee?")) return;
    try {
      await api.delete(`/payees/${id}`);
      fetchPayees();
    } catch (err) {
      alert("Error deleting payee");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Payee List">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Payee Directory</h2>
          <button className="primary-btn" onClick={() => navigate("/payees/new")}>
            ➕ Add Payee
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, color: "#1e293b" }}>Registered Payee Records</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payee No</th>
                  <th>Name / Designation</th>
                  <th>Department</th>
                  <th>Appointment Info</th>
                  <th>Contract Period</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payees.length > 0 ? (
                  payees.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <span className="status-badge active">
                          {p.payeeNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{p.designation}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{p.departmentCode}</td>
                      <td>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1E40AF" }}>
                          {p.appointmentNo}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {p.appointmentDate?.slice(0, 10)}
                        </div>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        {p.contractStartDate?.slice(0, 10)} 
                        <span style={{ margin: "0 5px", color: "#94a3b8" }}>→</span>
                        {p.contractEndDate?.slice(0, 10)}
                      </td>
                      <td className="action-cell">
                        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                          <button
                            className="icon-btn"
                            title="View"
                            onClick={() => navigate(`/payees/view/${p._id}`)}
                          >
                            👁️
                          </button>
                          <button
                            className="icon-btn"
                            title="Edit"
                            onClick={() => navigate(`/payees/edit/${p._id}`)}
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-btn danger"
                            title="Delete"
                            onClick={() => deletePayee(p._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                      No payees found in the system.
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

export default PayeeList;