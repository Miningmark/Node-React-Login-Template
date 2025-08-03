import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastContext";
import { axiosPublic } from "../../util/axios";
import { ThemeContext } from "contexts/ThemeContext";

import { ReactComponent as VisibilityIcon } from "assets/icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "assets/icons/visibility_off.svg";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, repeat: false });
  const [token, setToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [searchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const isLengthValid = password.length >= 8 && password.length <= 24;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === repeatPassword;

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || token.length !== 64) {
      addToast("Kein gültiger Token vorhanden", "danger");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      addToast("Passwort erfüllt nicht die Anforderungen", "danger");
      return;
    }

    if (!passwordsMatch) {
      addToast("Passwörter stimmen nicht überein", "danger");
      return;
    }

    try {
      await axiosPublic.post("/auth/handlePasswordRecovery", {
        token,
        password,
      });

      addToast("Passwort erfolgreich geändert.", "success");
      navigate("/login");
    } catch (error) {
      addToast(
        error.response?.data?.message || "Serverfehler beim Zurücksetzen des Passworts",
        "danger"
      );
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
        className="border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100"
        style={{
          maxWidth: "400px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <h2 className="text-center mb-4">Passwort zurücksetzen</h2>
        <Form onSubmit={handleSubmit} noValidate>
          <div className="form-floating mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${
                touched.password && !isLengthValid ? "is-invalid" : isLengthValid ? "is-valid" : ""
              }`}
              id="floatingPassword"
              placeholder="Neues Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              required
            />
            <label htmlFor="floatingPassword">Neues Passwort</label>
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

          <ul className="mb-3 list-unstyled small">
            <li
              className={touched.password ? (isLengthValid ? "text-success" : "text-danger") : ""}
            >
              {isLengthValid ? "✅" : "❌"} Mindestens 8 Zeichen max.24 Zeichen
            </li>
            <li className={touched.password ? (hasLowercase ? "text-success" : "text-danger") : ""}>
              {hasLowercase ? "✅" : "❌"} Mindestens ein Kleinbuchstabe
            </li>
            <li className={touched.password ? (hasUppercase ? "text-success" : "text-danger") : ""}>
              {hasUppercase ? "✅" : "❌"} Mindestens ein Großbuchstabe
            </li>
            <li className={touched.password ? (hasNumber ? "text-success" : "text-danger") : ""}>
              {hasNumber ? "✅" : "❌"} Mindestens eine Zahl
            </li>
            <li
              className={touched.password ? (hasSpecialChar ? "text-success" : "text-danger") : ""}
            >
              {hasSpecialChar ? "✅" : "❌"} Mindestens ein Sonderzeichen
            </li>
          </ul>

          <div className="form-floating mb-3">
            <input
              type={showPassword2 ? "text" : "password"}
              className={`form-control ${
                touched.repeat && !passwordsMatch
                  ? "is-invalid"
                  : passwordsMatch && repeatPassword !== ""
                  ? "is-valid"
                  : ""
              }`}
              id="floatingRepeatPassword"
              placeholder="Passwort wiederholen"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, repeat: true })}
              required
            />
            <label htmlFor="floatingRepeatPassword">Passwort wiederholen</label>
            <span
              className={`eye-icon position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer ${
                showPassword2 ? "rotate" : ""
              }`}
              onClick={() => setShowPassword2((prev) => !prev)}
            >
              {showPassword2 ? (
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

          <div className="d-flex justify-content-center">
            <Button variant="primary" type="submit">
              Passwort ändern
            </Button>
          </div>
        </Form>
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

export default ResetPassword;
