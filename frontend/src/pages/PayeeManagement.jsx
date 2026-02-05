import { useContext, useEffect, useState } from "react";
import api from "../service/api";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/com.css";

const PayeeManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // 🔐 Permission guard
  if (
    user.role !== "ADMIN" &&
    !user.permissions.includes("MAINTENANCE_MANAGEMENT")
  ) {
    return <p>Unauthorized</p>;
  }

  // ---------------- MASTER DATA ----------------
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  // ---------------- PAYEE STATE ----------------
  const [payeeType, setPayeeType] = useState("INTERNAL");
  const [payeeDigits, setPayeeDigits] = useState("");

  const [personal, setPersonal] = useState({
    name: "",
    designation: "",
    address: "",
    telephone: "",
    appointmentNo: "",
    appointmentDate: ""
  });

  const [departmentCode, setDepartmentCode] = useState("");
  const [contract, setContract] = useState({ start: "", end: "" });

  const [allocations, setAllocations] = useState([]);

  // ---------------- FETCH MASTER DATA ----------------
  useEffect(() => {
    api.get("/departments").then(r => setDepartments(r.data));
    api.get("/batches").then(r => setBatches(r.data));
    api.get("/subjects").then(r => setSubjects(r.data));
    api.get("/topics").then(r => setTopics(r.data));
  }, []);

  // ---------------- LOAD PAYEE (EDIT MODE) ----------------
  useEffect(() => {
    if (!isEdit) return;

    const loadPayee = async () => {
      const res = await api.get("/payees");
      const p = res.data.find(x => x._id === id);
      if (!p) return;

      setPayeeType(p.payeeType);
      setPayeeDigits(p.payeeNumber.slice(1));

      setPersonal({
        name: p.name,
        designation: p.designation,
        address: p.address,
        telephone: p.telephone,
        appointmentNo: p.appointmentNo || "", // ✅ Load from DB
        appointmentDate: p.appointmentDate ? p.appointmentDate.slice(0, 10) : "" // ✅ Format for date input
      });

      setDepartmentCode(p.departmentCode);
      setContract({
        start: p.contractStartDate.slice(0, 10),
        end: p.contractEndDate.slice(0, 10)
      });

      const alloc = await api.get(`/payees/${id}/allocations`);
      setAllocations(alloc.data || []);
    };

    loadPayee();
  }, [id, isEdit]);

  // ---------------- PROGRESSIVE VISIBILITY ----------------
  const isIdentificationValid = payeeDigits.length === 5;
  const isPersonalValid =
    personal.name &&
    personal.designation &&
    personal.address &&
    personal.telephone &&
    personal.appointmentNo &&
    personal.appointmentDate;

  const isContractValid =
    departmentCode && contract.start && contract.end;

  // ---------------- ALLOCATION HANDLERS ----------------
  const updateAllocation = (i, field, value) => {
    const copy = [...allocations];
    copy[i] = { ...copy[i], [field]: value };
    setAllocations(copy);
  };

  const addAllocation = () => {
    setAllocations([
      ...allocations,
      {
        batchCode: "",
        subjectCode: "",
        topicCode: "",
        ratePerHour: "",
        allocatedHours: ""
      }
    ]);
  };

  const removeAllocation = (i) => {
    setAllocations(allocations.filter((_, idx) => idx !== i));
  };

  // ---------------- RESET FORM (CREATE ONLY) ----------------
  const resetForm = () => {
    setPayeeType("INTERNAL");
    setPayeeDigits("");
    setPersonal({
      name: "",
      designation: "",
      address: "",
      telephone: "",
      appointmentNo: "",
      appointmentDate: ""
    });
    setDepartmentCode("");
    setContract({ start: "", end: "" });
    setAllocations([]);
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    const invalidAllocation = allocations.some(a =>
      !a.batchCode ||
      !a.subjectCode ||
      !a.topicCode ||
      !a.ratePerHour ||
      !a.allocatedHours
    );

    if (allocations.length > 0 && invalidAllocation) {
      alert("Please complete all allocation fields or remove empty rows.");
      return;
    }

    const payload = {
      payeeType,
      payeeNumberDigits: payeeDigits,
      ...personal,
      departmentCode,
      contractStartDate: contract.start,
      contractEndDate: contract.end,
      allocations
    };

    try {
      if (isEdit) {
        await api.put(`/payees/${id}`, payload);
        alert("Payee updated successfully");
        navigate("/payees");
      } else {
        await api.post("/payees", payload);
        alert("Payee created successfully");
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <DashboardLayout user={user} logout={logout} title="Payee Management">
      <div className="page-container" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="page-title">{isEdit ? "Update Payee Profile" : "Register New Payee"}</h2>

        {/* 1. IDENTIFICATION */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="section-subtitle"> Payee Identification</h3>
          <div className="form-grid-4" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={payeeType === "INTERNAL"}
                  onChange={() => setPayeeType("INTERNAL")}
                /> Internal
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={payeeType === "EXTERNAL"}
                  onChange={() => setPayeeType("EXTERNAL")}
                /> External
              </label>
            </div>
            <div>
              <label>Payee Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="status-badge active" style={{ padding: '10px 15px' }}>
                  {payeeType === "INTERNAL" ? "I" : "E"}
                </span>
                <input
                  maxLength={5}
                  placeholder="5 Digits"
                  value={payeeDigits}
                  onChange={e => setPayeeDigits(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PERSONAL DETAILS */}
        {isIdentificationValid && (
          <div className="card fade-in" style={{ marginBottom: '20px' }}>
            <h3 className="section-subtitle"> Personal Details</h3>
            <div className="form-grid-4">
              <div>
                <label>Full Name</label>
                <input
                  placeholder="Full Name"
                  value={personal.name}
                  onChange={e => setPersonal({ ...personal, name: e.target.value })}
                />
              </div>
              <div>
                <label>Designation</label>
                <input
                  placeholder="Designation"
                  value={personal.designation}
                  onChange={e => setPersonal({ ...personal, designation: e.target.value })}
                />
              </div>
              <div>
                <label>Telephone</label>
                <input
                  placeholder="Telephone"
                  value={personal.telephone}
                  onChange={e => setPersonal({ ...personal, telephone: e.target.value })}
                />
              </div>
              <div>
                <label>Address</label>
                <input
                  placeholder="Address"
                  value={personal.address}
                  onChange={e => setPersonal({ ...personal, address: e.target.value })}
                />
              </div>
              {/* ✅ NEW FIELDS ADDED HERE */}
              <div>
                <label>Appointment No</label>
                <input
                  type="text"
                  placeholder="e.g. APPT/2024/001"
                  value={personal.appointmentNo}
                  onChange={(e) => setPersonal({ ...personal, appointmentNo: e.target.value })}
                />
              </div>
              <div>
                <label>Appointment Date</label>
                <input
                  type="date"
                  value={personal.appointmentDate}
                  onChange={(e) => setPersonal({ ...personal, appointmentDate: e.target.value })}
                />
              </div>

            </div>
          </div>
        )}

        {/* 3. CONTRACT */}
        {isIdentificationValid && isPersonalValid && (
          <div className="card fade-in" style={{ marginBottom: '20px' }}>
            <h3 className="section-subtitle"> Department & Contract</h3>
            <div className="form-grid-4">
              <div>
                <label>Assign Department</label>
                <select
                  value={departmentCode}
                  onChange={e => setDepartmentCode(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Contract Start Date</label>
                <input
                  type="date"
                  value={contract.start}
                  onChange={e => setContract({ ...contract, start: e.target.value })}
                />
              </div>
              <div>
                <label>Contract End Date</label>
                <input
                  type="date"
                  value={contract.end}
                  onChange={e => setContract({ ...contract, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. ALLOCATIONS */}
        {isIdentificationValid && isPersonalValid && isContractValid && (
          <div className="card fade-in">
            <h3 className="section-subtitle">Teaching Allocations</h3>
            
            {allocations.map((a, i) => (
              <div key={i} className="form-grid-4" style={{ 
                background: '#f8fafc', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '10px',
                border: '1px solid #e2e8f0',
                alignItems: 'flex-end'
              }}>
                <div>
                  <label>Batch</label>
                  <select value={a.batchCode} onChange={e => updateAllocation(i, "batchCode", e.target.value)}>
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b._id} value={b.batchCode}>{b.batchName}</option>)}
                  </select>
                </div>
                <div>
                  <label>Subject</label>
                  <select value={a.subjectCode} onChange={e => updateAllocation(i, "subjectCode", e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s.subjectCode}>{s.subjectCode}</option>)}
                  </select>
                </div>
                <div>
                  <label>Topic</label>
                  <select value={a.topicCode} onChange={e => updateAllocation(i, "topicCode", e.target.value)}>
                    <option value="">Select Topic</option>
                    {topics.map(t => <option key={t._id} value={t.topicCode}>{t.topicCode}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Rate/Hr</label>
                    <input
                      placeholder="0.00"
                      value={a.ratePerHour}
                      onChange={e => /^\d*\.?\d*$/.test(e.target.value) && updateAllocation(i, "ratePerHour", e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Hours</label>
                    <input
                      placeholder="0"
                      value={a.allocatedHours}
                      onChange={e => /^\d*$/.test(e.target.value) && updateAllocation(i, "allocatedHours", e.target.value)}
                    />
                  </div>
                  <button className="icon-btn danger" onClick={() => removeAllocation(i)} style={{ marginBottom: '5px' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="secondary-btn" onClick={addAllocation}>
                ➕ Add Allocation Row
              </button>
              
              <button className="primary-btn" onClick={submit} style={{ padding: '12px 30px' }}>
                {isEdit ? "Update Full Profile" : "Create Payee Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PayeeManagement;