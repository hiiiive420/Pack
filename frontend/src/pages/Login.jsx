import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../service/api";
import "../styles/com.css"; // Ensure this contains your primary-btn and input styles

const Login = () => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault(); // Prevent page refresh if used in a form
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });
      login(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc", // Light dashboard background
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="card" style={{
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        textAlign: "center"
      }}>
        {/* LOGO PLACEHOLDER */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#3b82f6",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "white",
            marginBottom: "16px"
          }}>
            🏛️
          </div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.5rem", fontWeight: "700" }}>
            System Dashboard
          </h2>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "0.9rem" }}>
            Sign in to manage your dashboard
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            color: "#b91c1c",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "20px",
            border: "1px solid #fee2e2"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <div style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@institution.com"
              style={{ width: "100%", boxSizing: "border-box" }}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{ width: "100%", boxSizing: "border-box" }}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <button 
            className="primary-btn" 
            onClick={submit}
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "12px", 
              fontSize: "1rem", 
              fontWeight: "600",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </div>

        <div style={{ marginTop: "24px", fontSize: "0.8rem", color: "#94a3b8" }}>
          &copy; 2026 Pack Software Point(Pvt Ltd). All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;