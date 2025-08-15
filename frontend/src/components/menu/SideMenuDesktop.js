import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "contexts/AuthContext";
import { ThemeContext } from "contexts/ThemeContext";
import { useToast } from "components/ToastContext";
import menuItems from "./menuStruckture";
import useAxiosProtected from "hook/useAxiosProtected";

//Icons
import { ReactComponent as ArrowUpIcon } from "assets/icons/arrow_up.svg";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow_down.svg";
import { ReactComponent as KeepIcon } from "assets/icons/keep.svg";
import { ReactComponent as KeepOffIcon } from "assets/icons/keep_off.svg";
import { ReactComponent as BookmarkIcon } from "assets/icons/bookmark.svg";
import { ReactComponent as BookmarkCheckIcon } from "assets/icons/bookmark_check.svg";

//Zustand Store
import { useSettingsStore } from "hook/store/settingsStore";

export default function SideMenuDesktop({ menuFixed, setMenuFixed }) {
  const { checkAccess, routeGroups } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { addToast } = useToast();
  const axiosProtected = useAxiosProtected();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isHovered, setIsHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [menuFixedChanged, setMenuFixedChanged] = useState(false);

  const setMenuBookmarks = useSettingsStore((state) => state.setMenuBookmarks);
  const menuBookmarks = useSettingsStore((state) => state.menuBookmarks);

  // Submenus automatisch öffnen, wenn aktives SubItem vorhanden
  useEffect(() => {
    if (!routeGroups) return;
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
    if (!menuFixed || !menuFixedChanged) {
      setOpenMenus(initialOpenMenus);
      console.log("Initial Open Menus:", initialOpenMenus);
    }
  }, [currentPath, checkAccess, menuFixed, menuFixedChanged, routeGroups]);

  useEffect(() => {
    if (!menuFixedChanged && menuFixed && routeGroups) {
      setMenuFixedChanged(true);
      console.log("Menu wurde fixiert");
    }
  }, [menuFixedChanged, menuFixed, routeGroups]);
  console.log("Menu Fixed Changed:", menuFixedChanged);

  const toggleSubMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleBookmark = async (linkName, link) => {
    const exists = menuBookmarks.find((b) => b.link === link);
    let updatedBookmarks;

    if (exists) {
      // Entfernen
      updatedBookmarks = menuBookmarks.filter((b) => b.link !== link);
    } else {
      // Hinzufügen (max. 5)
      if (menuBookmarks.length >= 5) {
        addToast("Es sind maximal 5 Lesezeichen möglich!", "danger");
        return;
      }
      updatedBookmarks = [...menuBookmarks, { linkName, link }];
    }

    setMenuBookmarks(updatedBookmarks);

    try {
      await axiosProtected.post("/user/updateSettings", {
        menuBookmarks: updatedBookmarks,
      });
    } catch (error) {
      addToast("Fehler beim Aktualisieren der Lesezeichen", "danger");
    }
  };

  const isBookmarked = (link) => {
    return menuBookmarks.some((b) => b.link === link);
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

      {/* Bookmarks anzeigen */}
      <div style={{ height: `${menuBookmarks.length * 24}px` }}>
        {(isHovered || menuFixed) && menuBookmarks.length > 0 && (
          <ul style={{ listStyle: "none", padding: "0 16px", margin: 0 }}>
            {menuBookmarks.map((bm, idx) => {
              const isActiveMain = bm.link === currentPath;
              return (
                <li key={idx} className="menu-item" style={{}}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="icon-wrapper"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: 8,
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(bm.linkName, bm.link);
                      }}
                      title={isBookmarked(bm.link) ? "Bookmark entfernen" : "Bookmark hinzufügen"}
                    >
                      <BookmarkCheckIcon
                        fill={isActiveMain ? "green" : theme === "light" ? "black" : "white"}
                        style={{ width: 24, height: 24 }}
                      />
                    </span>
                    <Link to={bm.link} className={`menu-link ${isActiveMain ? "active" : ""}`}>
                      <span className="label">{bm.linkName}</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
                        <li
                          key={subIdx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ marginRight: "8px" }}>•</span>
                          <Link
                            to={subItem.path}
                            className={`submenu-link ${isActive ? "active" : ""}`}
                          >
                            {subItem.name}
                          </Link>

                          <span
                            className="bookmark-icon"
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() => toggleBookmark(subItem.name, subItem.path)}
                            title={
                              isBookmarked(subItem.path)
                                ? "Bookmark entfernen"
                                : "Bookmark hinzufügen"
                            }
                          >
                            {isBookmarked(subItem.path) ? (
                              <BookmarkCheckIcon
                                className="keep-icon"
                                style={{ width: 20, height: 20 }}
                              />
                            ) : (
                              <BookmarkIcon
                                className="keep-icon"
                                style={{ width: 20, height: 20 }}
                              />
                            )}
                          </span>
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link to={item.path} className={`menu-link ${isActiveMain ? "active" : ""}`}>
                  {item.icon && (
                    <span
                      className="icon-wrapper"
                      style={{ display: "flex", alignItems: "center", marginRight: 8 }}
                    >
                      {React.cloneElement(item.icon, {
                        fill: isActiveMain
                          ? "green"
                          : theme === "light"
                          ? "black"
                          : "var(--bs-body-color)",
                        className: "icon",
                        style: { width: 20, height: 20 },
                      })}
                    </span>
                  )}
                  <span className="label">{item.name}</span>
                </Link>

                <span
                  className="bookmark-icon"
                  style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBookmark(item.name, item.path);
                  }}
                  title={isBookmarked(item.path) ? "Bookmark entfernen" : "Bookmark hinzufügen"}
                >
                  {isBookmarked(item.path) ? (
                    <BookmarkCheckIcon className="keep-icon" style={{ width: 20, height: 20 }} />
                  ) : (
                    <BookmarkIcon className="keep-icon" style={{ width: 20, height: 20 }} />
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
