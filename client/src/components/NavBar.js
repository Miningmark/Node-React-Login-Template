import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { axiosProtected } from "../util/axios";

function NavBar() {
  const { accessToken, username, logout, roles } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  async function handleLogout() {
    try {
      await axiosProtected.post("/logout", {
        username: username,
      });
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <nav className={`navbar navbar-expand-lg bg-body-tertiary px-3`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          App
        </Link>
        <button onClick={toggleTheme} className="btn btn-outline-secondary ms-auto">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
        {accessToken && (
          <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
