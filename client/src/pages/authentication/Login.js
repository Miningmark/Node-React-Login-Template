import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastContext";
import { axiosPublic } from "../../util/axios";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import "../../components/css/login.css";

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const { addToast } = useToast();
  const { login, setConfig } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await axiosPublic.get("/config");
        setConfig(res?.data?.config);
        setLoadingConfig(false);
      } catch (error) {
        addToast("Fehler beim Laden der Konfiguration", "danger");
      }
    }
    fetchConfig();
  }, [setConfig]);

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
        "/login",
        {
          username: name,
          password,
        },
        {
          withCredentials: true,
        }
      );
      console.log("AccessToken:", res.data.accessToken);
      console.log("Username:", res.data.username);
      console.log("Roles:", res.data.roles);
      console.log("Config:", res.data.config);
      login(res.data.accessToken, res.data.username, res.data.roles, res.data.config);
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
      await axiosPublic.post("/request-password-reset", {
        username: name,
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
      {!loadingConfig ? (
        <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
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
                <div className="form-floating mb-3">
                  <input
                    className="form-control"
                    id="floatingPassword"
                    placeholder="Passwort"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="floatingPassword">Passwort</label>
                </div>
                <div className="d-flex mb-3">
                  {process.env.REACT_APP_REGISTER_ACTIVE === "true" ? (
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
                    placeholder="Name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <label htmlFor="floatingName">Name</label>
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
      ) : null}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          color: "white",
          fontWeight: "bold",
          textShadow: "1px 1px 2px black",
        }}
      >
        ABCDEFGH
      </div>
    </div>
  );
}

export default Login;
