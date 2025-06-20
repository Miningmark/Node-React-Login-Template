import { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { AuthContext } from "contexts/AuthContext";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";

const ShowServerlogEntry = ({ show, handleClose, serverLogEntry }) => {
  const { routeGroups } = useContext(AuthContext);
  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  if (!serverLogEntry) return null;

  const handleDelete = async () => {
    try {
      await axiosProtected.delete(`/adminPage/deleteServerLog/${serverLogEntry.id}`);
      addToast("Serverlog-Eintrag erfolgreich gelöscht", "success");
      handleClose();
    } catch (error) {
      addToast("Fehler beim Löschen des Serverlog-Eintrags", "danger");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Serverlog-Eintrag Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>ID:</strong> {serverLogEntry.id}
        </p>
        <p>
          <strong>Timestamp:</strong> {new Date(serverLogEntry.timestamp).toLocaleString()}
        </p>
        <p>
          <strong>Route:</strong> {serverLogEntry.route}
        </p>
        <p>
          <strong>Message:</strong> {serverLogEntry.message}
        </p>
        <p>
          <strong>User:</strong> {serverLogEntry.user ? serverLogEntry.user.username : "System"}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Schließen
        </Button>
        {routeGroups.includes("admin") && (
          <Button variant="danger" onClick={handleDelete}>
            Löschen
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ShowServerlogEntry;
