import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/ToastContext";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import "../components/CSS/login.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [token, setToken] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const isLengthValid = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === repeatPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || token.length !== 32) {
      addToast("Kein gültiger Token vorhanden", "danger");
      return;
    }

    if (!isLengthValid || !hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
      addToast("Passwort erfüllt nicht die Anforderungen", "danger");
      return;
    }

    if (!passwordsMatch) {
      addToast("Passwörter stimmen nicht überein", "danger");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.status === 200) {
        addToast("Passwort erfolgreich geändert.", "success");
        navigate("/login");
      } else {
        addToast(data.message || "Passwort konnte nicht geändert werden", "danger");
      }
    } catch (err) {
      addToast("Serverfehler beim Zurücksetzen des Passworts", "danger");
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
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4">Passwort zurücksetzen</h2>
        <Form onSubmit={handleSubmit} noValidate>
          <div className="form-floating mb-3">
            <input
              type="password"
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
          </div>

          <ul className="mb-3 list-unstyled small">
            <li
              className={touched.password ? (isLengthValid ? "text-success" : "text-danger") : ""}
            >
              {isLengthValid ? "✅" : "❌"} Mindestens 8 Zeichen
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
              type="password"
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
          </div>

          <div className="d-flex justify-content-center">
            <Button variant="primary" type="submit">
              Passwort ändern
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ResetPassword;
