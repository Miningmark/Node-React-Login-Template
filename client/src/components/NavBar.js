import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

function NavBar() {
  const { token, logout, roles } = useContext(AuthContext);
  const [dark, setDark] = useState(false);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-${dark ? "dark" : "light"} bg-${
        dark ? "dark" : "light"
      }`}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          App
        </Link>
        <button className="btn btn-outline-secondary" onClick={() => setDark(!dark)}>
          {dark ? "Light" : "Dark"} Mode
        </button>
        {token && (
          <button className="btn btn-outline-danger ms-2" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
