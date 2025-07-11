import { useState, useRef, useEffect, useContext } from "react";
import { useToast } from "../components/ToastContext";
import useAxiosProtected from "../hook/useAxiosProtected";
import { useNavigate } from "react-router-dom";
import { convertToLocalDate } from "../util/timeConverting";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "contexts/ThemeContext";
import { Table } from "react-bootstrap";

import { ReactComponent as VisibilityIcon } from "assets/icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "assets/icons/visibility_off.svg";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

  const { addToast } = useToast();
  const { setAccessToken } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
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
    const controller = new AbortController();

    const fetchLogins = async () => {
      try {
        const response = await axiosProtected.get("/user/getLastLogins", {
          signal: controller.signal,
        });
        setLogins(response.data.lastLogins);
      } catch (error) {
        if (error.name === "CanceledError") {
          console.log("Login-Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der letzten Logins", "danger");
        }
      } finally {
        setLoadingLogins(false);
      }
    };

    fetchLogins();

    return () => {
      controller.abort(); // Cleanup beim Unmount
    };
  }, []);

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
      await axiosProtected.post("/user/updatePassword", { currentPassword, newPassword });

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
      await axiosProtected.post("/user/updateEmail", { newEmail });

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
      await axiosProtected.post("/user/updateUsername", { newUsername });

      addToast("Benutzername erfolgreich aktualisiert.", "success");
      setAccessToken("");
      navigate("/login");
    } catch (error) {
      addToast(error.response?.data?.message || "Benutzername-Änderung fehlgeschlagen", "danger");
    } finally {
      setLoadingUsername(false);
    }
  }

  console.log("Theme:", theme);
  console.log("Logins:", logins);

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
                    type={showPassword ? "text" : "password"}
                    className={`form-control `}
                    id="floatingCurrentPassword"
                    placeholder="Aktuelles Passwort"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    ref={currentPasswordRef}
                  />
                  <label htmlFor="floatingCurrentPassword">Aktuelles Passwort</label>

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
                <div className="form-floating mb-3">
                  <input
                    type={showPassword2 ? "text" : "password"}
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
                <div className="form-floating mb-3 position-relative">
                  <input
                    type={showPassword3 ? "text" : "password"}
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
                  <span
                    className={`eye-icon position-absolute translate-middle-y me-3 cursor-pointer ${
                      showPassword3 ? "rotate" : ""
                    }`}
                    onClick={() => setShowPassword3((prev) => !prev)}
                    style={{
                      width: "24px",
                      height: "24px",
                      right: "15px",
                      top: "26px",
                    }}
                  >
                    {showPassword3 ? (
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
          {process.env.REACT_APP_CHANGE_USERNAME_ACTIVE ? (
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
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Zeitpunkt</th>
                        <th scope="col">IPv4-Adresse</th>
                        <th scope="col">Region / Land</th>
                        <th scope="col">Erfolgreich</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logins.map((entry, idx) => (
                        <tr key={idx}>
                          <td>{convertToLocalDate(entry.loginTime)}</td>
                          <td>{entry.ipv4Address}</td>
                          <td>
                            {entry.regionName === "IP Lookup nicht erfolgreich"
                              ? entry.regionName
                              : `${entry.regionName} / ${entry.country}`}
                          </td>
                          <td className="text-center">{entry.successfully ? "✅" : "❌"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
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
