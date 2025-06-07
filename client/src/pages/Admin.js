import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function Admin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const { token, roles: userRoles } = useContext(AuthContext);

  if (!userRoles.includes("admin")) return <p>Access denied</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, roles: roles.split(",") }),
    });
    alert("User created");
  };

  return (
    <div className="container mt-5">
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control my-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          className="form-control my-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="btn btn-success">Create</button>
      </form>
    </div>
  );
}

export default Admin;
