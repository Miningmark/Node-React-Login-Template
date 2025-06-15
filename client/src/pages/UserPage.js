import { useState, useRef } from "react";
import { useToast } from "../components/ToastContext";
import useAxiosProtected from "../hook/useAxiosProtected";
import { Link, useNavigate } from "react-router-dom";

const UserPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [touched, setTouched] = useState({ password: false });

  const { addToast } = useToast();
  const axiosProtected = useAxiosProtected();
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const repeatRef = useRef(null);

  // Passwortregeln
  const isLengthValid = newPassword.length >= 8 && newPassword.length <= 24;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

  //E-Mail regeln
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/.test(newEmail.trim());

  const recentLogins = [
    { date: "2025-06-13 14:23", ip: "192.168.1.1", location: "Berlin, DE" },
    { date: "2025-06-12 09:47", ip: "192.168.1.2", location: "Munich, DE" },
    { date: "2025-06-11 18:11", ip: "192.168.1.3", location: "Hamburg, DE" },
    { date: "2025-06-10 21:33", ip: "192.168.1.4", location: "Cologne, DE" },
    { date: "2025-06-09 07:59", ip: "192.168.1.5", location: "Frankfurt, DE" },
  ];

  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (!currentPassword) {
      addToast("Aktuelles Passwort ist erforderlich", "danger");
      passwordRef.current?.focus();
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      addToast("Passwort erfüllt nicht die Anforderungen", "danger");
      passwordRef.current?.focus();
      return;
    }

    if (!passwordsMatch) {
      addToast("Passwörter stimmen nicht überein", "danger");
      repeatRef.current?.focus();
      return;
    }
    try {
      await axiosProtected.post("/change-password", { currentPassword, newPassword });

      addToast("Passwort änderung erfolgreich.", "success");
      navigate("/login");
    } catch (error) {
      addToast(error.response?.data?.message || "Passwort änderung fehlgeschlagen", "danger");
    }
  }

  async function handleUpdateEmail(e) {
    e.preventDefault();

    if (!isEmailValid) {
      addToast("Ungültige E-Mail-Adresse", "danger");
      emailRef.current?.focus();
      return;
    }

    try {
      await axiosProtected.post("/change-email", { newEmail });

      addToast("E-Mail-Adresse erfolgreich aktualisiert.", "success");
      setNewEmail("");
      setTouched({ ...touched, email: false });
    } catch (error) {
      addToast(error.response?.data?.message || "E-Mail-Änderung fehlgeschlagen", "danger");
    }
  }

  return (
    <div className="container mt-4">
      <div className="row g-4">
        {/* Passwort ändern */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header fw-bold">Passwort ändern</div>
            <div className="card-body">
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className={`form-control `}
                  id="floatingCurrentPassword"
                  placeholder="Aktuelles Passwort"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  ref={passwordRef}
                />
                <label htmlFor="floatingCurrentPassword">Aktuelles Passwort</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className={`form-control ${
                    touched.password
                      ? isLengthValid && hasLowercase && hasUppercase && hasNumber && hasSpecialChar
                        ? "is-valid"
                        : "is-invalid"
                      : ""
                  }`}
                  id="floatingNewPassword"
                  placeholder="Neues Passwort"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  required
                  ref={passwordRef}
                />
                <label htmlFor="floatingNewPassword">Neues Passwort</label>
              </div>
              <ul className="mb-3 list-unstyled small">
                <li
                  className={
                    touched.password ? (isLengthValid ? "text-success" : "text-danger") : ""
                  }
                >
                  {isLengthValid ? "✅" : "❌"} Mindestens 8 Zeichen, max. 24 Zeichen
                </li>
                <li
                  className={
                    touched.password ? (hasLowercase ? "text-success" : "text-danger") : ""
                  }
                >
                  {hasLowercase ? "✅" : "❌"} Mindestens ein Kleinbuchstabe
                </li>
                <li
                  className={
                    touched.password ? (hasUppercase ? "text-success" : "text-danger") : ""
                  }
                >
                  {hasUppercase ? "✅" : "❌"} Mindestens ein Großbuchstabe
                </li>
                <li
                  className={touched.password ? (hasNumber ? "text-success" : "text-danger") : ""}
                >
                  {hasNumber ? "✅" : "❌"} Mindestens eine Zahl
                </li>
                <li
                  className={
                    touched.password ? (hasSpecialChar ? "text-success" : "text-danger") : ""
                  }
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
                      : passwordsMatch && confirmPassword !== ""
                      ? "is-valid"
                      : ""
                  }`}
                  id="floatingConfirmPassword"
                  placeholder="Passwort wiederholen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, repeat: true })}
                  required
                  ref={repeatRef}
                />
                <label htmlFor="floatingConfirmPassword">Passwort wiederholen</label>
                {touched.repeat && !passwordsMatch && (
                  <div className="invalid-feedback">Passwörter stimmen nicht überein.</div>
                )}
              </div>
              <button className="btn btn-primary w-100" onClick={handleUpdatePassword}>
                Passwort aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* E-Mail ändern */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header fw-bold">E-Mail-Adresse ändern</div>
            <div className="card-body">
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className={`form-control ${
                    touched.email ? (isEmailValid ? "is-valid" : "is-invalid") : ""
                  }`}
                  id="floatingNewEmail"
                  placeholder="E-Mail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  required
                  ref={emailRef}
                />
                <label htmlFor="floatingNewEmail">E-Mail</label>
              </div>
              <button className="btn btn-primary w-100" onClick={handleUpdateEmail}>
                E-Mail aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* Letzte Logins */}
        <div className="col-12">
          <div className="card">
            <div className="card-header fw-bold">Letzte Logins</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Datum/Uhrzeit</th>
                      <th>IP-Adresse</th>
                      <th>Ort</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogins.map((login, index) => (
                      <tr key={index}>
                        <td>{login.date}</td>
                        <td>{login.ip}</td>
                        <td>{login.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
