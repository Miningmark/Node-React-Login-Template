import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastContext";
import { axiosPublic } from "../../util/axios";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [touched, setTouched] = useState({});

    const emailRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const repeatRef = useRef(null);

    const { addToast } = useToast();
    const navigate = useNavigate();

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isUsernameValid = username.trim().length >= 5 && username.trim().length <= 15;

    const isLengthValid = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);

    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch = password === repeatPassword;

    const handleSubmitRegister = async (e) => {
        e.preventDefault();

        if (!isEmailValid) {
            setTouched((prev) => ({ ...prev, email: true }));
            emailRef.current?.focus();
            return;
        }

        if (!isUsernameValid) {
            setTouched((prev) => ({ ...prev, username: true }));
            usernameRef.current?.focus();
            return;
        }

        if (!isLengthValid || !hasNumber || !hasSpecialChar || !hasLowercase || !hasUppercase) {
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
            await axiosPublic.post("/register", { email, username, password });

            addToast("Registrierung erfolgreich! Bitte einloggen.", "success");
            navigate("/login");
        } catch (error) {
            if (error.response?.reason === "email") {
                emailRef.current?.focus();
                addToast(error.response?.data?.message || "Registrierung fehlgeschlagen E-Mail bereits Registriert", "danger");
                setEmail("");
            } else if (error.response?.reason === "username") {
                usernameRef.current?.focus();
                addToast(error.response?.data?.message || "Registrierung fehlgeschlagen Name bereits Vergeben", "danger");
                setUsername("");
            } else {
                addToast(error.response?.data?.message || "Registrierung fehlgeschlagen", "danger");
            }
        }
    };

    return (
        <div
            className="vh-100 d-flex justify-content-center align-items-center"
            style={{
                backgroundImage: "url('/assets/images/default_bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div className="border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100" style={{ maxWidth: "400px" }}>
                <h2 className="text-center mb-4">Registrieren</h2>
                <Form onSubmit={handleSubmitRegister} noValidate>
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className={`form-control ${touched.email ? (isEmailValid ? "is-valid" : "is-invalid") : ""}`}
                            id="floatingEmail"
                            placeholder="E-Mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched({ ...touched, email: true })}
                            required
                            ref={emailRef}
                        />
                        <label htmlFor="floatingEmail">E-Mail</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className={`form-control ${touched.username && !isUsernameValid ? "is-invalid" : isUsernameValid ? "is-valid" : ""}`}
                            id="floatingUsername"
                            placeholder="Benutzername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={() => setTouched({ ...touched, username: true })}
                            required
                            ref={usernameRef}
                        />
                        <label htmlFor="floatingUsername">Benutzername</label>
                        {touched.username && !isUsernameValid && (
                            <div className="invalid-feedback">Benutzername muss zwischen 5 und 15 Zeichen lang sein.</div>
                        )}
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className={`form-control ${touched.password && !isLengthValid ? "is-invalid" : isLengthValid ? "is-valid" : ""}`}
                            id="floatingPassword"
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched({ ...touched, password: true })}
                            required
                            ref={passwordRef}
                        />
                        <label htmlFor="floatingPassword">Passwort</label>
                    </div>

                    <ul className="mb-3 list-unstyled small">
                        <li className={touched.password ? (isLengthValid ? "text-success" : "text-danger") : ""}>
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
                        <li className={touched.password ? (hasSpecialChar ? "text-success" : "text-danger") : ""}>
                            {hasSpecialChar ? "✅" : "❌"} Mindestens ein Sonderzeichen
                        </li>
                    </ul>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className={`form-control ${
                                touched.repeat && !passwordsMatch ? "is-invalid" : passwordsMatch && repeatPassword !== "" ? "is-valid" : ""
                            }`}
                            id="floatingRepeatPassword"
                            placeholder="Passwort wiederholen"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            onBlur={() => setTouched({ ...touched, repeat: true })}
                            required
                            ref={repeatRef}
                        />
                        <label htmlFor="floatingRepeatPassword">Passwort wiederholen</label>
                    </div>

                    <div className="d-flex justify-content-center">
                        <Button variant="primary" type="submit">
                            Registrieren
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Register;
