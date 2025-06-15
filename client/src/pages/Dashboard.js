import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      <button onClick={() => navigate("/admin")} className="btn btn-primary">
        Admin Page
      </button>
    </div>
  );
}

export default Dashboard;
