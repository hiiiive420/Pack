import api from "../service/api";

const LectureTransaction = () => {
  const testApi = async () => {
    const res = await api.get("/users/lecture-test");
    alert(res.data.message);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
      <h3>Visiting Lecture Transactions</h3>
      <button onClick={testApi}>Test Lecture API</button>
    </div>
  );
};

export default LectureTransaction;
