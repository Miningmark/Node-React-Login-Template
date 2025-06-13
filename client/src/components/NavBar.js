import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

function NavBar() {
  const { token, logout, roles } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className={`navbar navbar-expand-lg bg-body-tertiary px-3`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          App
        </Link>
        <button onClick={toggleTheme} className="btn btn-outline-secondary ms-auto">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
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
