import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation items configuration
  const menuItems = [
    { title: "Payees", path: "/payeesList", icon: "👥", count: "Manage Profiles" },
    { title: "Programmes", path: "/programmes", icon: "🎓", count: "Degree Paths" },
    { title: "Projects", path: "/project", icon: "📁", count: "Research Units" },
    { title: "Batches", path: "/batches", icon: "📅", count: "Intake Groups" },
    { title: "Subjects", path: "/subjects", icon: "📚", count: "Course Modules" },
    { title: "Topics", path: "/topics", icon: "📝", count: "Curriculum" },
    { title: "Departments", path: "/departments", icon: "🏢", count: "Faculty Units" },
  ];

  return (
    <DashboardLayout user={user} logout={logout} title="System Overview">
      <div className="page-container">
        <header style={{ marginBottom: "30px" }}>
          <h2 className="page-title" style={{ margin: 0 }}>Welcome back, {user?.name || "Admin"}</h2>
          <p style={{ color: "#64748b", marginTop: "5px" }}>
            Institutional Maintenance & Payee Management System
          </p>
        </header>

        {/* STATS SUMMARY (Optional/Placeholder) */}
        <div className="form-grid-4" style={{ marginBottom: "30px" }}>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>TOTAL PAYEES</span>
            <h2 style={{ margin: '10px 0 0 0', color: '#3b82f6' }}>Active</h2>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>CURRENT SEMESTER</span>
            <h2 style={{ margin: '10px 0 0 0', color: '#10b981' }}>2026/Q1</h2>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>SYSTEM STATUS</span>
            <h2 style={{ margin: '10px 0 0 0', color: '#f59e0b' }}>Secure</h2>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>ROLE</span>
            <h2 style={{ margin: '10px 0 0 0', color: '#6366f1' }}>{user?.role}</h2>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '30px' }} />

        {/* MANAGEMENT GRID */}
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Management Modules</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '20px' 
        }}>
          {menuItems.map((item, idx) => (
            <div 
              key={idx} 
              className="card" 
              onClick={() => navigate(item.path)}
              style={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px 20px',
                border: '1px solid #e2e8f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                fontSize: '2.5rem', 
                marginBottom: '15px',
                background: '#f1f5f9',
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}>
                {item.icon}
              </div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{item.title}</h4>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;