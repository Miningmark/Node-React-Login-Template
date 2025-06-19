import { useContext, useState, useEffect } from "react";
import { AuthContext } from "contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "contexts/ThemeContext";
import useAxiosProtected from "hook/useAxiosProtected";
import "./navBar.css";

function NavBar() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { accessToken, username, logout } = useContext(AuthContext);
  const axiosProtected = useAxiosProtected();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

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

  useEffect(() => {
    const controller = new AbortController();

    return () => {
      controller.abort();
    };
  }, []);

  async function handleLogout() {
    try {
      await axiosProtected.post("/user/logout");
      await logout();
      setTimeout(() => {
        navigate("/login");
      }, 200);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <nav
      className={`navbar navbar-expand-lg bg-body-tertiary px-3 sticky-top navbar-mobile-hide-show ${
        showNavbar ? "navbar-visible" : "navbar-hidden"
      }`}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          App
        </Link>

        <button onClick={toggleTheme} className="btn btn-outline-secondary ms-auto me-2">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        {accessToken && (
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
              <span role="img" aria-label="user">
                👤
              </span>
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
                  <button className="dropdown-item" onClick={() => navigate("/userpage")}>
                    {username ? username : "Benutzer"}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </div>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
