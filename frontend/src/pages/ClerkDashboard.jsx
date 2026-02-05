import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";

const ClerkDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Clerk Dashboard"
    >
      <h2>Welcome, {user.name}</h2>
      <p>Select a module from the sidebar.</p>
    </DashboardLayout>
  );
};

export default ClerkDashboard;
