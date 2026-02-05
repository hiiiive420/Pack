import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const PayeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [payee, setPayee] = useState(null);
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    api.get("/payees").then((res) => {
      const found = res.data.find((p) => p._id === id);
      setPayee(found);
    });

    api.get(`/payees/${id}/allocations`)
      .then((res) => setAllocations(res.data));
  }, [id]);

  if (!payee) return (
    <DashboardLayout user={user} logout={logout} title="Loading...">
      <div className="page-container"><p>Fetching payee profile...</p></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout user={user} logout={logout} title="Payee Profile">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* HEADER ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="secondary-btn" onClick={() => navigate("/payeesList")}>
            ← Back to List
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-btn" onClick={() => navigate(`/payees/edit/${id}`)}>
              ✏️ Edit Profile
            </button>
            <button
              className="primary-btn danger"
              onClick={async () => {
                if (!window.confirm("Disable this payee?")) return;
                await api.delete(`/payees/${id}`);
                navigate("/payeesList");
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* PROFILE INFO CARD */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
             <div className="status-badge active" style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                {payee.payeeNumber}
             </div>
             <h2 style={{ margin: 0, color: '#0f172a' }}>{payee.name}</h2>
          </div>

          <div className="form-grid-4">
            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Designation</label>
              <p style={{ fontWeight: '600', marginTop: '5px' }}>{payee.designation}</p>
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department</label>
              <p style={{ fontWeight: '600', marginTop: '5px' }}>{payee.departmentCode}</p>
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Telephone</label>
              <p style={{ fontWeight: '600', marginTop: '5px' }}>{payee.telephone}</p>
            </div>
          

            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contract Period</label>
              <p style={{ fontWeight: '600', marginTop: '5px' }}>
                {payee.contractStartDate?.slice(0, 10)} — {payee.contractEndDate?.slice(0, 10)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Office Address</label>
            <p style={{ fontWeight: '500', marginTop: '5px', color: '#334155' }}>{payee.address}</p>
          </div>
        </div>
     
<div className="card" style={{ marginBottom: '20px' }}>
  <h3 className="section-subtitle" style={{ fontSize: '1rem', color: '#1E40AF' }}>Appointment Details</h3>
  <div className="form-grid-4">
    <div>
      <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Appointment No</label>
      <p style={{ fontWeight: '600', marginTop: '5px' }}>{payee.appointmentNo}</p>
    </div>
    <div>
      <label style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Appointment Date</label>
      <p style={{ fontWeight: '600', marginTop: '5px' }}>
        {payee.appointmentDate ? new Date(payee.appointmentDate).toLocaleDateString() : 'N/A'}
      </p>
    </div>
  </div>
</div>

        {/* ALLOCATIONS TABLE CARD */}
        <div className="card">
          <h3 className="section-subtitle">Teaching Allocations</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th style={{ textAlign: 'right' }}>Rate/hr</th>
                  <th style={{ textAlign: 'right' }}>Allocated Hours</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length > 0 ? (
                  allocations.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{a.batchCode}</td>
                      <td>{a.subjectCode}</td>
                      <td>{a.topicCode}</td>
                      <td style={{ textAlign: 'right' }}>{a.ratePerHour}</td>
                      <td style={{ textAlign: 'right' }}>{a.allocatedHours}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                      No allocations found for this payee.
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

export default PayeeView;