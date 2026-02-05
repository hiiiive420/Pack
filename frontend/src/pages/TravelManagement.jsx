import api from "../service/api";

const TravelManagement = () => {
  const testApi = async () => {
    const res = await api.get("/users/travel-test");
    alert(res.data.message);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
      <h3>Travel Cost Management</h3>
      <button onClick={testApi}>Test Travel API</button>
    </div>
  );
};

export default TravelManagement;
