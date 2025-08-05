import { useEffect, useContext } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { Container } from "react-bootstrap";
import { SocketContext } from "contexts/SocketProvider";

const MaintenancePage = ({ maintenanceMode, toggleMaintenanceMode }) => {
  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      function handleMaintenanceChange(data) {
        addToast(`Wartungsmodus ${data.active ? "aktiviert" : "deaktiviert"}`, "success");
        toggleMaintenanceMode();
      }

      socket.emit("subscribe:adminPage:maintenanceMode:watchList");

      socket.on("adminPage:maintenanceMode:update", handleMaintenanceChange);

      return () => {
        socket.off("adminPage:maintenanceMode:update", handleMaintenanceChange);
      };
    }
  }, [socket]);

  async function handleMaintenanceChange() {
    try {
      await axiosProtected.post("adminPage/updateMaintenanceMode", {
        active: !maintenanceMode,
      });
      //addToast(`Wartungsmodus ${!maintenanceMode ? "aktiviert" : "deaktiviert"}`, "success");
      //toggleMaintenanceMode();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Fehler beim Speichern der Wartungseinstellungen",
        "danger"
      );
    }
  }

  return (
    <>
      <Container className="page-wrapper mt-4">
        <h1>Wartungsmodus</h1>
        <p>
          Der Wartungsmodus ist <strong>{maintenanceMode ? "aktiviert" : "deaktiviert"}</strong>.
          <br />
          {maintenanceMode
            ? " Bitte deaktivieren Sie den Wartungsmodus, wenn Sie die Anwendung wieder für alle Benutzer zugänglich machen möchten."
            : " Aktivieren Sie den Wartungsmodus, wenn Sie Wartungsarbeiten durchführen möchten."}
        </p>
        <button className="btn btn-primary" onClick={handleMaintenanceChange}>
          Wartungsmodus {maintenanceMode ? "deaktivieren" : "aktivieren"}
        </button>
      </Container>
    </>
  );
};
export default MaintenancePage;
