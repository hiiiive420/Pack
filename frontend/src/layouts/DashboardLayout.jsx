import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DashboardLayout = ({ user, title, children, logout }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
      <Sidebar user={user} />

      <main style={{ flex: 1 }}>
        <Topbar title={title} onLogout={logout} />

        <div style={{ padding: 24 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
