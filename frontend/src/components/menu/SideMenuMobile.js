import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "contexts/ThemeContext";
import menuItems from "./menuStruckture";

import "./sideMenuMobile.css";

import { ReactComponent as ArrowUpIcon } from "assets/icons/arrow_up.svg";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow_down.svg";

export default function SideMenuMobile({ handleMobileSideMenuClose }) {
  const [openMenus, setOpenMenus] = useState({});
  const { checkAccess } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const currentPath = location.pathname;

  // Öffne Submenus automatisch, wenn ein aktiver SubItem-Path erkannt wird
  useEffect(() => {
    const initialOpenMenus = {};
    menuItems.forEach((item) => {
      if (item.subItems) {
        const accessibleSubItems = item.subItems.filter((subItem) =>
          checkAccess(subItem.allowedRouteGroups || [])
        );
        const anySubItemActive = accessibleSubItems.some((subItem) => subItem.path === currentPath);
        if (anySubItemActive) {
          initialOpenMenus[item.name] = true;
        }
      }
    });
    setOpenMenus(initialOpenMenus);
  }, [currentPath, checkAccess]);

  const toggleSubMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="side-menu-background" onClick={handleMobileSideMenuClose}>
      <div className="side-menu-wrapper bg-body-tertiary" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h5 className="">Projektname</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleMobileSideMenuClose}
          ></button>
        </div>

        <div className="menu-items">
          {menuItems.map((item, idx) => {
            const isActiveMain = item.path === currentPath;

            if (item.subItems) {
              const accessibleSubItems = item.subItems.filter((subItem) =>
                checkAccess(subItem.allowedRouteGroups || [])
              );
              if (accessibleSubItems.length === 0) return null;

              const isSubmenuOpen = openMenus[item.name];
              const isActiveSubItem = accessibleSubItems.some(
                (subItem) => subItem.path === currentPath
              );

              return (
                <div key={idx} className="menu-item">
                  <div
                    className={`menu-parent ${isActiveSubItem ? "active" : ""}`}
                    onClick={() => toggleSubMenu(item.name)}
                  >
                    <span>
                      {item.icon && (
                        <span className="icon-wrapper">
                          {React.cloneElement(item.icon, {
                            fill: isActiveSubItem
                              ? "green"
                              : theme === "light"
                              ? "black"
                              : "var(--bs-body-color)",
                            className: "icon",
                          })}
                        </span>
                      )}
                      {item.name}
                    </span>
                    {isSubmenuOpen ? (
                      <ArrowUpIcon className="icon" />
                    ) : (
                      <ArrowDownIcon className="icon" />
                    )}
                  </div>
                  {isSubmenuOpen && (
                    <div className="submenu">
                      {accessibleSubItems.map((subItem, subIdx) => {
                        const isActive = subItem.path === currentPath;
                        return (
                          <Link
                            key={subIdx}
                            to={subItem.path}
                            className={`submenu-item ${isActive ? "active" : ""}`}
                            onClick={handleMobileSideMenuClose}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              if (!checkAccess(item.allowedRouteGroups || [])) return null;

              return (
                <div key={idx} className="menu-item">
                  <Link
                    to={item.path}
                    className={`menu-link ${isActiveMain ? "active" : ""}`}
                    onClick={handleMobileSideMenuClose}
                  >
                    {item.icon && (
                      <span className="icon-wrapper">
                        {React.cloneElement(item.icon, {
                          fill: isActiveMain
                            ? "green"
                            : theme === "light"
                            ? "black"
                            : "var(--bs-body-color)",
                          className: "icon",
                        })}
                      </span>
                    )}
                    {item.name}
                  </Link>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
