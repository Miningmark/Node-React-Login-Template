import { useState, useContext, useEffect } from "react";
import { AuthContext } from "contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "components/ToastContext";
import { axiosPublic } from "util/axios";
import { ThemeContext } from "contexts/ThemeContext";

import { ReactComponent as VisibilityIcon } from "assets/icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "assets/icons/visibility_off.svg";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import "components/css/login.css";

function Login({ maintenanceMode, registration }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { addToast } = useToast();
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const key = searchParams.get("key");
    if (key) {
      setIsFlipped(true);
    }
  }, [searchParams]);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosPublic.post(
        "/auth/login",
        {
          username: name,
          password,
        },
        {
          withCredentials: true,
        }
      );

      login(res.data.accessToken, res.data.username, res.data.routeGroups);

      addToast("Login erfolgreich", "success");

      navigate("/dashboard");
    } catch (error) {
      setPassword("");
      setName("");
      addToast(error.response?.data?.message, "danger");
    }
  };

  const handleSubmitReset = async (e) => {
    e.preventDefault();

    try {
      await axiosPublic.post("/auth/requestPasswordReset", {
        usernameOrEmail: name,
      });
      setIsFlipped(false);
      addToast("Passwort reset erfolgreich abgeschickt", "success");
    } catch (error) {
      addToast(error.response?.data?.message, "danger");
    }
  };

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: "url('/assets/images/default_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className={`flip-container ${isFlipped ? "flipped" : ""}`}
        style={{ height: `${maintenanceMode ? "390px" : "350px"}` }}
      >
        <div className="flipper">
          {/* Vorderseite - Login */}
          <div
            className="front border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100"
            style={{
              maxWidth: "400px",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {maintenanceMode && (
              <div className="alert alert-warning text-center" role="alert">
                Wartungsmodus aktiv – Nur Admins können sich einloggen.
              </div>
            )}
            <h2 className="text-center mb-4">Login</h2>
            <Form onSubmit={handleSubmitLogin}>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  id="floatingInput"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="floatingInput">Name</label>
              </div>
              <div className="form-floating mb-3 position-relative">
                <input
                  className="form-control pe-5"
                  id="floatingPassword"
                  placeholder="Passwort"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="floatingPassword">Passwort</label>
                <span
                  className={`eye-icon position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer ${
                    showPassword ? "rotate" : ""
                  }`}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <VisibilityOffIcon
                      fill={theme === "light" ? "black" : "var(--bs-body-color)"}
                      width={24}
                      height={24}
                      style={{ marginRight: "15px" }}
                    />
                  ) : (
                    <VisibilityIcon
                      fill={theme === "light" ? "black" : "var(--bs-body-color)"}
                      width={24}
                      height={24}
                      style={{ marginRight: "15px" }}
                    />
                  )}
                </span>
              </div>

              {maintenanceMode ? null : (
                <div className="d-flex mb-3">
                  {registration ? (
                    <span
                      role="button"
                      className="text-primary text-decoration-underline me-auto"
                      onClick={() => navigate("/register")}
                    >
                      Registrieren
                    </span>
                  ) : (
                    <div className="me-auto" />
                  )}
                  <span
                    role="button"
                    className="text-primary text-decoration-underline"
                    onClick={() => setIsFlipped(true)}
                  >
                    Passwort vergessen
                  </span>
                </div>
              )}

              <div className="d-flex justify-content-center">
                <Button variant="primary" type="submit">
                  Login
                </Button>
              </div>
            </Form>
          </div>

          {/* Rückseite - Passwort vergessen */}
          <div
            className="back border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100"
            style={{
              maxWidth: "400px",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <h2 className="text-center mb-4">Passwort vergessen</h2>
            <Form onSubmit={handleSubmitReset}>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  id="floatingName"
                  placeholder="Name/E-Mail"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="floatingName">Name/E-Mail</label>
              </div>
              <div className="d-flex justify-content-end mb-3">
                <span
                  role="button"
                  className="text-primary text-decoration-underline"
                  onClick={() => setIsFlipped(false)}
                >
                  Zurück zum Login
                </span>
              </div>
              <div className="d-flex justify-content-center">
                <Button variant="primary" type="submit">
                  Link senden
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontWeight: "500",
          textShadow: "1px 1px 2px black",
          display: "flex",
          gap: "1rem",
        }}
      >
        <span
          role="button"
          className="text-white text-decoration-underline"
          onClick={() => navigate("/impressum")}
        >
          Impressum
        </span>
        <span
          role="button"
          className="text-white text-decoration-underline"
          onClick={() => navigate("/datenschutz")}
        >
          Datenschutz
        </span>
      </div>
    </div>
  );
}

export default Login;
