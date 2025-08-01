import { useContext, useState, useEffect } from "react";
import { AuthContext } from "contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "contexts/ThemeContext";
import useAxiosProtected from "hook/useAxiosProtected";
import SideMenuDesktop from "./SideMenuDesktop";
import { closeSocket } from "util/socket";
import ShowAllUserNotifications from "components/util/ShowAllUserNotifications";

import "./navBar.css";

import SideMenuMobile from "./SideMenuMobile";

//Zustand Store
import { useSettingsStore } from "hook/store/settingsStore";

//Icons
import { ReactComponent as MenuIcon } from "assets/icons/menu.svg";
import { ReactComponent as UserDefaultIcon } from "assets/icons/account_circle.svg";

export default function NavBar({ children }) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showMobileSideMenu, setShowMobileSideMenu] = useState(false);

  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);

  const { accessToken, username, logout, avatar } = useContext(AuthContext);
  const axiosProtected = useAxiosProtected();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const menuFixed = useSettingsStore((state) => state.menuFixed);
  const setMenuFixed = useSettingsStore((state) => state.setMenuFixed);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (window.innerWidth < 768) {
        // Nur Mobile
        if (currentScrollY > lastScrollY + 10) {
          // Runterscrollen
          setShowNavbar(false);
        } else if (currentScrollY < lastScrollY - 5) {
          // Hochscrollen

          setShowNavbar(true);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  async function handleLogout() {
    try {
      await axiosProtected.post("/auth/logout");
      closeSocket();
      await logout();
      setTimeout(() => {
        navigate("/login");
      }, 200);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleMobileSideMenuClose() {
    setShowMobileSideMenu(false);
  }

  async function handleMenuFixedChange() {
    try {
      await axiosProtected.post("/user/updateSettings", { isSideMenuFixed: !menuFixed });
    } catch (error) {}
    setMenuFixed(!menuFixed);
  }

  if (!accessToken) {
    return <>{children}</>;
  }

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg bg-body-tertiary px-3 sticky-top navbar-mobile-hide-show ${
          showMobileSideMenu ? "navbar-hidden" : showNavbar ? "navbar-visible" : "navbar-hidden"
        }`}
      >
        <div className="container-fluid">
          <Link className="navbar-brand mobile-hide" to="/dashboard">
            App
          </Link>
          <div
            className="hamburger-icon"
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
            onClick={() => setShowMobileSideMenu(!showMobileSideMenu)}
          >
            <MenuIcon
              fill={theme === "light" ? "black" : "var(--bs-body-color)"}
              width={32}
              height={32}
              style={{ marginRight: "0px" }}
            />
          </div>

          <div></div>

          <div
            className="dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
            style={{ position: "relative" }}
          >
            <button
              className="btn btn-outline-primary rounded-circle border-0"
              id="userDropdown"
              style={{
                width: "40px",
                height: "40px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                />
              ) : (
                <UserDefaultIcon
                  fill={theme === "light" ? "black" : "var(--bs-body-color)"}
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%" }}
                />
              )}
            </button>

            <ul
              className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
              style={{
                right: 0,
                left: "auto",
                position: "absolute",
                marginTop: "0",
                paddingTop: "10px",
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                zIndex: 1000,
              }}
              aria-labelledby="userDropdown"
            >
              <div
                style={{
                  backgroundColor: "var(--bs-dropdown-bg)",
                  border: "1px solid var(--bs-border-color)",
                  borderRadius: "0.375rem",
                  boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                }}
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/user/page");
                      setDropdownOpen(false);
                    }}
                  >
                    {username ? username : "Benutzer"}
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/user/settings");
                      setDropdownOpen(false);
                    }}
                  >
                    Einstellungen
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowAllNotificationsModal(true);
                      setDropdownOpen(false);
                    }}
                  >
                    Benachrichtigungen
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </nav>

      <div className="menu-content-wrapper">
        <div className="column-left">
          <SideMenuDesktop menuFixed={menuFixed} setMenuFixed={handleMenuFixedChange} />
        </div>

        <div className={`column  ${menuFixed ? "column-right-s" : "column-right-l"}`}>
          {children}
        </div>
      </div>

      {showMobileSideMenu ? (
        <SideMenuMobile handleMobileSideMenuClose={handleMobileSideMenuClose} />
      ) : null}

      {showAllNotificationsModal ? (
        <ShowAllUserNotifications handleClose={() => setShowAllNotificationsModal(false)} />
      ) : null}
    </>
  );
}
