import { useEffect, useState, useContext } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/dashboard.css";

const PAGE_SIZE = 10;

const AuditLog = () => {
  const { user, logout } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);

  if (user?.role !== "ADMIN") {
    return <p style={{ padding: 24 }}>Unauthorized</p>;
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get("/audit-logs");
      setLogs(res.data);
    } catch {
      alert("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  // pagination logic
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentLogs = logs.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <DashboardLayout user={user} logout={logout} title="Audit Logs">

      <div className="card" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h3>System Activity History</h3>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 16 }}>
          Showing system actions (Create / Update / Delete)
        </p>

        {loading ? (
          <p>Loading audit logs…</p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Record ID</th>
                    <th>Description</th>
                  </tr>
                </thead>

                <tbody>
                  {currentLogs.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                        No audit logs found
                      </td>
                    </tr>
                  )}

                  {currentLogs.map((log, index) => (
                    <tr
                      key={log._id}
                      style={{
                        background: index % 2 === 0 ? "#FFFFFF" : "#F8FAFC"
                      }}
                    >
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>{log.userEmail}</td>

                      <td style={{ fontWeight: 600 }}>
                        {log.userRole}
                      </td>

                      <td style={{
                        fontWeight: 600,
                        color:
                          log.action === "CREATE"
                            ? "#16A34A"
                            : log.action === "UPDATE"
                            ? "#2563EB"
                            : "#DC2626"
                      }}>
                        {log.action}
                      </td>

                      <td>{log.module}</td>
                      <td style={{ fontSize: 12 }}>{log.recordId || "—"}</td>
                      <td style={{ fontSize: 13 }}>{log.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          {/* ---------- PAGINATION CONTROLS ---------- */}
        {totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16
          }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>
              Page {page} of {totalPages}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>

              <button
                className="primary-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>

    </DashboardLayout>
  );
};

export default AuditLog;
