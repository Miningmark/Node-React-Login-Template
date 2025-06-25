import React, { useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";

const ConfirmModal = ({ show, onClose, name, onResult }) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (show && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [show]);

  const handleConfirm = () => {
    onResult(true);
    onClose();
  };

  const handleCancel = () => {
    onResult(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Aktion bestätigen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Möchtest du die Aktion für <strong>{name}</strong> wirklich durchführen?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleConfirm} ref={confirmButtonRef}>
          Bestätigen
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
