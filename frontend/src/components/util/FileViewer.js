import { useState, useContext, useEffect } from "react";
import { Modal, Button, ModalFooter } from "react-bootstrap";
import { useToast } from "components/ToastContext";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const TEXT_EXTENSIONS = [".txt", ".log", ".csv", ".json"];
const PDF_EXTENSIONS = [".pdf"];
const OFFICE_EXTENSIONS = [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];

const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1).toLowerCase();
};

const FileViewer = ({ show, handleClose, file }) => {
  const [error, setError] = useState("");
  const [textContent, setTextContent] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (!file) return;

    const ext = getFileExtension(file.name);

    if (TEXT_EXTENSIONS.includes(ext)) {
      setLoadingText(true);
      fetch(file.url)
        .then((res) => {
          if (!res.ok) throw new Error("Datei konnte nicht geladen werden");
          return res.text();
        })
        .then((text) => {
          setTextContent(text);
          setLoadingText(false);
        })
        .catch(() => {
          setError("Textdatei konnte nicht geladen werden");
          setLoadingText(false);
        });
    } else {
      setTextContent("");
    }
  }, [file]);

  const closeModal = () => {
    setError("");
    setTextContent("");
    handleClose();
  };

  function handleDownload() {
    const link = document.createElement("a");
    link.href = file.url || file;
    link.download = file.name || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!file) return null;

  const ext = getFileExtension(file.name);

  return (
    <Modal show={show} onHide={closeModal} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Datei anzeigen: {file.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          minHeight: "300px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {error && <div className="text-danger mb-2">{error}</div>}

        {IMAGE_EXTENSIONS.includes(ext) && (
          <img
            src={file.url || file}
            alt={file.name}
            style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
        )}

        {PDF_EXTENSIONS.includes(ext) && (
          <embed src={file.url || file} type="application/pdf" width="100%" height="70vh" />
        )}

        {TEXT_EXTENSIONS.includes(ext) && (
          <>
            {loadingText ? (
              <div>Lädt...</div>
            ) : (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                }}
              >
                {textContent}
              </pre>
            )}
          </>
        )}

        {OFFICE_EXTENSIONS.includes(ext) && (
          <div>
            <p>
              Die Vorschau für Office-Dateien ({ext}) wird nicht unterstützt. Bitte laden Sie die
              Datei herunter, um sie zu öffnen.
            </p>
          </div>
        )}

        {![
          ...IMAGE_EXTENSIONS,
          ...PDF_EXTENSIONS,
          ...TEXT_EXTENSIONS,
          ...OFFICE_EXTENSIONS,
        ].includes(ext) && (
          <div>
            <p>Vorschau für diesen Dateityp wird nicht unterstützt.</p>
          </div>
        )}
      </Modal.Body>
      <ModalFooter>
        <Button variant="primary" onClick={handleDownload}>
          Herunterladen
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Schließen
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FileViewer;
