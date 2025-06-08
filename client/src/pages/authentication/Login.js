import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastContext";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import "../../components/css/login.css";

function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isFlipped, setIsFlipped] = useState(false);

    const { addToast } = useToast();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    //TODO:
    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        });
        const data = await res.json();
        if (res.status === 200) {
            login(data.token);
            navigate("/dashboard");
        } else {
            setPassword("");
            setName("");
            addToast(data.message, "danger");
        }
    };

    //TODO:
    const handleSubmitReset = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:4000/api/auth/passwordreset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        if (res.status === 200) {
            setIsFlipped(false);
        } else {
            const data = await res.json();
            addToast(data.message, "danger");
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
            <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
                <div className="flipper">
                    {/* Vorderseite - Login */}
                    <div className="front border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100" style={{ maxWidth: "400px" }}>
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
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="floatingPassword">Password</label>
                            </div>
                            <div className="d-flex justify-content-end mb-3">
                                <span role="button" className="text-primary text-decoration-underline" onClick={() => setIsFlipped(true)}>
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
                    <div className="back border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100" style={{ maxWidth: "400px" }}>
                        <h2 className="text-center mb-4">Passwort vergessen</h2>
                        <Form onSubmit={handleSubmitReset}>
                            <div className="form-floating mb-3">
                                <input className="form-control" id="floatingName" placeholder="Name" type="text" required />
                                <label htmlFor="floatingName">E-Mail</label>
                            </div>
                            <div className="d-flex justify-content-end mb-3">
                                <span role="button" className="text-primary text-decoration-underline" onClick={() => setIsFlipped(false)}>
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
        </div>
    );
}

export default Login;
