import { useState, useRef, useEffect, useContext } from "react";
import { useToast } from "../components/ToastContext";
import useAxiosProtected from "../hook/useAxiosProtected";
import { useNavigate } from "react-router-dom";
import { convertToLocalTime } from "../util/timeConverting";
import { AuthContext } from "../contexts/AuthContext";

const UserPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [touched, setTouched] = useState({ password: false });
  const [logins, setLogins] = useState([]);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingLogins, setLoadingLogins] = useState(true);

  const { addToast } = useToast();
  const { config, setAccessToken } = useContext(AuthContext);
  const axiosProtected = useAxiosProtected();
  const navigate = useNavigate();

  const currentPasswordRef = useRef(null);
  const passwordRef = useRef(null);
  const repeatRef = useRef(null);
  const emailRef = useRef(null);
  const usernameRef = useRef(null);

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

  //Benutzername regeln
  const isUsernameValid = /^[a-zA-Z0-9]{5,15}$/.test(newUsername.trim());

  useEffect(() => {
    const fetchLogins = async () => {
      try {
        const response = await axiosProtected.get("/last-logins");
        setLogins(response.data);
      } catch (error) {
        addToast("Fehler beim Laden der letzten Logins", "danger");
      } finally {
        setLoadingLogins(false);
      }
    };

    fetchLogins();
  }, [axiosProtected, addToast]);

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
    setLoadingPassword(true);
    try {
      await axiosProtected.post("/change-password", { currentPassword, newPassword });

      addToast("Passwort änderung erfolgreich.", "success");
      setAccessToken("");
      navigate("/login");
    } catch (error) {
      addToast(error.response?.data?.message || "Passwort änderung fehlgeschlagen", "danger");
    } finally {
      setLoadingPassword(false);
    }
  }

  async function handleUpdateEmail(e) {
    e.preventDefault();

    if (!isEmailValid) {
      addToast("Ungültige E-Mail-Adresse", "danger");
      emailRef.current?.focus();
      return;
    }
    setLoadingEmail(true);
    try {
      await axiosProtected.post("/change-email", { newEmail });

      addToast("E-Mail-Adresse erfolgreich aktualisiert.", "success");
      setNewEmail("");
      setTouched({ ...touched, email: false });
    } catch (error) {
      addToast(error.response?.data?.message || "E-Mail-Änderung fehlgeschlagen", "danger");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleUpdateUsername(e) {
    e.preventDefault();

    if (!isUsernameValid) {
      addToast("Ungültiger Benutzername", "danger");
      usernameRef.current?.focus();
      return;
    }
    setLoadingUsername(true);
    try {
      await axiosProtected.post("/change-username", { newUsername });

      addToast("Benutzername erfolgreich aktualisiert.", "success");
      setNewUsername("");
      setTouched({ ...touched, username: false });
    } catch (error) {
      addToast(error.response?.data?.message || "Benutzername-Änderung fehlgeschlagen", "danger");
    } finally {
      setLoadingUsername(false);
    }
  }

  return (
    <div className="container mt-4">
      <h2>Benutzereinstellungen</h2>
      <div className="row g-4">
        {/* Passwort ändern */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header fw-bold">Passwort ändern</div>
            <div className="card-body">
              <form onSubmit={handleUpdatePassword}>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className={`form-control `}
                    id="floatingCurrentPassword"
                    placeholder="Aktuelles Passwort"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    ref={currentPasswordRef}
                  />
                  <label htmlFor="floatingCurrentPassword">Aktuelles Passwort</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className={`form-control ${
                      touched.password
                        ? isLengthValid &&
                          hasLowercase &&
                          hasUppercase &&
                          hasNumber &&
                          hasSpecialChar
                          ? "is-valid"
                          : "is-invalid"
                        : ""
                    }`}
                    id="floatingNewPassword"
                    placeholder="Neues Passwort"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={(e) =>
                      setTouched({ ...touched, password: e.target.value === "" ? false : true })
                    }
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
                    onBlur={(e) =>
                      setTouched({ ...touched, repeat: e.target.value === "" ? false : true })
                    }
                    required
                    ref={repeatRef}
                  />
                  <label htmlFor="floatingConfirmPassword">Passwort wiederholen</label>
                  {touched.repeat && !passwordsMatch && (
                    <div className="invalid-feedback">Passwörter stimmen nicht überein.</div>
                  )}
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={loadingPassword}>
                  {loadingPassword ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "Passwort aktualisieren"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          {/* E-Mail ändern */}
          <div className="card">
            <div className="card-header fw-bold">E-Mail-Adresse ändern</div>
            <div className="card-body">
              <form onSubmit={handleUpdateEmail}>
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
                    onBlur={(e) =>
                      setTouched({ ...touched, email: e.target.value === "" ? false : true })
                    }
                    required
                    ref={emailRef}
                  />
                  <label htmlFor="floatingNewEmail">E-Mail</label>
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={loadingEmail}>
                  {loadingEmail ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "E-Mail aktualisieren"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Benutzername ändern */}
          {config.isUsernameChangeEnable ? (
            <div className="card  mt-4">
              <div className="card-header fw-bold">Benutzername ändern</div>
              <div className="card-body">
                <form onSubmit={handleUpdateUsername}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${
                        touched.username ? (isUsernameValid ? "is-valid" : "is-invalid") : ""
                      }`}
                      id="floatingNewUsername"
                      placeholder="Benutzername"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onBlur={(e) =>
                        setTouched({ ...touched, username: e.target.value === "" ? false : true })
                      }
                      required
                      ref={usernameRef}
                    />
                    <label htmlFor="floatingNewUsername">Benutzername</label>
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    type="submit"
                    disabled={loadingUsername}
                  >
                    {loadingUsername ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      "Benutzername aktualisieren"
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>

        {/* Letzte Logins */}
        <div className="col-12">
          <div className="card">
            <div className="card-header fw-bold">Letzte Logins</div>
            <div className="card-body">
              {loadingLogins ? (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border text-primary" role="status" aria-hidden="true" />
                </div>
              ) : logins.length > 0 ? (
                <ul className="list-group">
                  {logins.map((entry, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between">
                      <span>{convertToLocalTime(entry.loginAt)}</span>
                      <span>{entry.ipv4Adress}</span>
                      <span>
                        {entry.regionName === "IP Lookup nicht erfolgreich"
                          ? entry.regionName
                          : `${entry.regionName}/${entry.country}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Keine Login-Daten verfügbar.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
