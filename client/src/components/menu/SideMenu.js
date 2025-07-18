import { useContext, useState, useEffect } from "react";
import { AuthContext } from "contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "contexts/ThemeContext";
import useAxiosProtected from "hook/useAxiosProtected";

import "./sideMenu.css";

export default function SideMenu({ handleSideMenuClose }) {
  return (
    <>
      <div className="side-menu-background" onClick={handleSideMenuClose}>
        <div className="side-menu-wrapper bg-body-tertiary">
          <p>Test</p>
        </div>
      </div>
    </>
  );
}
