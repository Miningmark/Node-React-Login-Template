import React, { useState, useEffect } from "react";
import useAxiosProtected from "../hook/useAxiosProtected";
import { Link } from "react-router-dom";

function Dashboard() {
  const axiosProtected = useAxiosProtected();
  const [response, setResponse] = useState();

  useEffect(() => {
    const controller = new AbortController();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
