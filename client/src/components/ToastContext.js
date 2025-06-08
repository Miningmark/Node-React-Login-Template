import React, { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastContext = createContext();

const translateVariant = (variant) => {
  switch (variant) {
    case "info":
      return "Info";
    case "success":
      return "Erfolg";
    case "danger":
      return "Fehler";
    case "warning":
      return "Warnung";
    default:
      return variant;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, variant = "info") => {
    // Varian: "info", "success", "danger", "warning"
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      <ToastContainer position="bottom-end" className="p-3">
        {toasts.map(({ id, message, variant }) => (
          <Toast
            key={id}
            onClose={() => removeToast(id)}
            delay={4000}
            autohide
            className={`text-bg-${variant}`}
          >
            <Toast.Header closeButton className={`text-bg-${variant}`}>
              <strong className="me-auto">{translateVariant(variant)}</strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
