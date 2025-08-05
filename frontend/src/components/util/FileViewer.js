import { useState, useContext, useEffect } from "react";
import { Modal, Button, ModalFooter } from "react-bootstrap";
import { useToast } from "components/ToastContext";

const FileViewer = ({ show, handleClose, path }) => {
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const closeModal = () => {
    setError("");
    setFile(null);
    setFileName("");
    handleClose();
  };

  function handleDownload() {
    const link = document.createElement("a");
    link.href = file;
    link.download = fileName;
    link.click();
  }

  return (
    <>
      <Modal show={show} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Datei anzeigen: {fileName}</Modal.Title>
        </Modal.Header>
        <Modal.Body></Modal.Body>
        <ModalFooter>
          <Button variant="primary" onClick={handleDownload}>
            Herunterladen
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Schließen
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default FileViewer;
