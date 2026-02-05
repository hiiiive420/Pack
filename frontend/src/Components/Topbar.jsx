import { useNavigate } from "react-router-dom";

const Topbar = ({ title, onLogout, user }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    // 1. Call the logout logic passed from AuthContext via DashboardLayout
    onLogout(); 
    
    // 2. Redirect the user to the login page
    navigate("/login");
  };

  return (
    <div style={{ width: "100%", position: "sticky", top: 0, zIndex: 100 }}>
      {/* THE MODERN THIN BLUE ACCENT LINE */}
      <div style={{ height: "3px", width: "100%", background: "#1E40AF" }} />

      <header style={{
        background: "rgba(248, 250, 252, 0.95)", 
        backdropFilter: "blur(10px)",
        height: "60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        fontFamily: "'Inter', sans-serif",
        borderBottom: "1px solid #E2E8F0"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#1E293B", fontWeight: "700" }}>
            {title}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>{user?.name}</div>
            <div style={{ fontSize: "11px", color: "#1E40AF", fontWeight: "700", textTransform: "uppercase" }}>
              {user?.role}
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            style={{
              background: "#fff",
              border: "1px solid #DC2626",
              color: "#DC2626",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseOver={(e) => e.target.style.background = "#FEF2F2"}
            onMouseOut={(e) => e.target.style.background = "#fff"}
          >
            Logout
          </button>
        </div>
      </header>
    </div>
  );
};

export default Topbar;