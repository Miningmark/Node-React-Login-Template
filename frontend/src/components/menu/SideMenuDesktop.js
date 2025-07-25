import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "contexts/AuthContext";
import { ThemeContext } from "contexts/ThemeContext";
import menuItems from "./menuStruckture";
import { ReactComponent as ArrowUpIcon } from "assets/icons/arrow_up.svg";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow_down.svg";
import { ReactComponent as KeepIcon } from "assets/icons/keep.svg";
import { ReactComponent as KeepOffIcon } from "assets/icons/keep_off.svg";

export default function SideMenuDesktop({ menuFixed, setMenuFixed }) {
  const { checkAccess } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const [isHovered, setIsHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Submenus automatisch öffnen, wenn aktives SubItem vorhanden
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
    <div
      className={`desktop-sidebar ${isHovered || menuFixed ? "expanded" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered || menuFixed ? (
        <div className="sidebar-header">
          <button
            className="keep-toggle-btn"
            onClick={() => setMenuFixed(!menuFixed)}
            title={menuFixed ? "Fixierung aufheben" : "Menü fixieren"}
          >
            {menuFixed ? <KeepOffIcon className="keep-icon" /> : <KeepIcon className="keep-icon" />}
          </button>
        </div>
      ) : null}

      <ul className="menu-items">
        {menuItems.map((item, idx) => {
          const isActiveMain = item.path === currentPath;
          const hasAccess = checkAccess(item.allowedRouteGroups || []);

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
              <li key={idx} className="menu-item">
                <div
                  className={`menu-parent ${isActiveSubItem ? "active" : ""}`}
                  onClick={() => toggleSubMenu(item.name)}
                >
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
                  <span className="label">{item.name}</span>
                  {isSubmenuOpen ? (
                    <ArrowUpIcon className="arrow-icon" />
                  ) : (
                    <ArrowDownIcon className="arrow-icon" />
                  )}
                </div>
                {isSubmenuOpen && (isHovered || menuFixed) && (
                  <ul className="submenu">
                    {accessibleSubItems.map((subItem, subIdx) => {
                      const isActive = subItem.path === currentPath;
                      return (
                        <li key={subIdx}>
                          <Link
                            to={subItem.path}
                            className={`submenu-link ${isActive ? "active" : ""}`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          }

          if (!hasAccess) return null;

          return (
            <li key={idx} className="menu-item">
              <Link to={item.path} className={`menu-link ${isActiveMain ? "active" : ""}`}>
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
                <span className="label">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
