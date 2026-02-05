import { useNavigate, useLocation } from "react-router-dom";
import { MODULES, ADMIN_MODULES } from "../constants/modules";
import packLogo from "../assets/Pack.jpeg";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleModules =
    user.role === "ADMIN"
      ? [...ADMIN_MODULES, ...MODULES]
      : MODULES.filter(m => user.permissions.includes(m.key));

  return (
    <aside style={{
      width: "280px",
      minHeight: "100vh", // Ensures no white space at bottom
      background: "#1E40AF", // Solid Royal Blue
      color: "#ffffff",
      padding: "30px 16px",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      boxShadow: "4px 0 15px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0
    }}>
      {/* Branding Area */}
      <div style={{ padding: "0 10px 24px 10px", textAlign: "center" }}>
        <img src={packLogo} alt="PACK" style={{ width: "160px", borderRadius: "8px", background: "#fff", padding: "5px" }} />
        <div style={{ 
          marginTop: "12px", 
          fontSize: "12px", 
          letterSpacing: "1.5px", 
          textTransform: "uppercase", 
          opacity: 0.7 
        }}>
          {user.role === "ADMIN" ? "Admin Panel" : "Clerk Panel"}
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.15)", marginBottom: "20px" }} />

      {/* Modern Navigation Items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        {visibleModules.map(m => {
          const isActive = location.pathname === m.path;
          return (
            <div
              key={m.key}
              onClick={() => navigate(m.path)}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "400",
                transition: "all 0.2s ease",
                // Active state: Brighter blue with subtle glow
                background: isActive ? "#2563EB" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                boxShadow: isActive ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
              onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "16px" }}>{isActive ? "◈" : "◇"}</span>
              {m.title}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;