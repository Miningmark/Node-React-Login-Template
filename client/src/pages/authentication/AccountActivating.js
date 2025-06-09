import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../components/ToastContext";
import { axiosPublic } from "../../util/axios";

import "bootstrap/dist/css/bootstrap.min.css";

function AccountActivating() {
  const [status, setStatus] = useState("loading");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus((prev) => {
        if (prev !== "error") addToast("Kein Token in der URL vorhanden", "danger");
        return "error";
      });
      return;
    }

    let hasActivated = false;

    async function activateAccount(token) {
      if (hasActivated) return;
      hasActivated = true;

      try {
        await axiosPublic.post("/account-activation", { token });

        addToast("Account erfolgreich aktiviert", "success");
        setStatus("success");
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        if (error.response?.data?.redirect) {
          addToast(
            error.response?.data?.message ||
              "Aktivierung bereits abgelaufen, bitte erneut Registrieren.",
            "danger"
          );
          setTimeout(() => navigate(error.response?.data?.redirect), 2000);
        } else {
          addToast(
            error.response?.data?.message || "Serverfehler beim Aktivieren des Accounts",
            "danger"
          );
          setStatus("error");
        }
      }
    }

    activateAccount(token);
  }, [searchParams]);

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
        className="border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100 d-flex justify-content-center align-items-center"
        style={{ maxWidth: "400px", minHeight: "150px" }} // Höhe anpassen je nach Bedarf
      >
        {status === "loading" && <h4>Account wird aktiviert...</h4>}
        {status === "success" && <h4>Account wurde erfolgreich aktiviert! Weiterleitung...</h4>}
        {status === "error" && <h4>Aktivierung fehlgeschlagen</h4>}
      </div>
    </div>
  );
}

export default AccountActivating;
