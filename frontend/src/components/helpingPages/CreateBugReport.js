import { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import TextEditor from "components/util/TextEditor";
import { convertToInputDateTime } from "util/timeConverting";
import DOMPurify from "dompurify";

const MAX_FILES = 3;
const MAX_IMAGE_SIZE_MB = 5;

const CreateBugReport = ({ show, handleClose, bugReport }) => {
  const [title, setTitle] = useState(bugReport ? bugReport.title : "");
  const [description, setDescription] = useState(bugReport ? bugReport.description : "");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(!bugReport);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);

  const closeModal = () => {
    setTitle("");
    setDescription("");
    handleClose();
  };

  async function handleSave() {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      selectedFiles.forEach((file, index) => {
        formData.append("files", file);
      });

      await axiosProtected.post("/bugReport/createBugReport", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      addToast("Bug/Verbesserung erfolgreich erstellt", "success");
      closeModal();
    } catch (error) {
      addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`Maximal ${MAX_FILES} Dateien erlaubt.`);
      return;
    }

    const validFiles = files.filter((file) => file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024);
    if (validFiles.length < files.length) {
      setError(`Eine oder mehrere Dateien überschreiten ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }

    setError("");

    const newPreviews = validFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        return { type: "image", src: URL.createObjectURL(file), name: file.name };
      } else {
        return { type: "file", name: file.name };
      }
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemove = (index) => {
    const updatedFiles = [...selectedFiles];
    const updatedPreviews = [...previews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  return (
    <>
      <Modal show={show} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {bugReport ? "Bug/Verbesserung Bearbeiten" : "Neuer Bug/Verbesserung erstellen"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${touched.title && !title ? "is-invalid" : ""}`}
              id="floatingTitle"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              name="title"
              disabled={!isEditing}
              maxLength={25}
            />
            <label htmlFor="floatingTitle">Titel</label>
          </div>

          <div className="form-floating mb-3">
            {isEditing ? (
              <TextEditor
                value={description}
                onChange={setDescription}
                readOnly={false}
                placeholder={bugReport ? "" : "Nachricht eingeben..."}
              />
            ) : (
              <>
                <p>
                  <strong>Nachricht</strong>
                </p>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
              </>
            )}
          </div>

          {!bugReport ? (
            <div className="card">
              <div className="card-header fw-bold">Dateien hochladen (max. 3)</div>
              <div className="card-body">
                <label
                  htmlFor="multiUpload"
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    background: "#007bff",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "1rem",
                  }}
                >
                  Dateien auswählen
                </label>
                <input
                  id="multiUpload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.txt"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= MAX_FILES}
                />
                {error && <div style={{ color: "red", marginBottom: "0.5rem" }}>{error}</div>}

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {previews.map((file, index) => (
                    <div key={index} style={{ position: "relative", width: "100px" }}>
                      {file.type === "image" ? (
                        <img
                          src={file.src}
                          alt={`Vorschau ${index + 1}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100px",
                            height: "100px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "0.5rem",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            background: "#f8f9fa",
                          }}
                        >
                          {file.name}
                        </div>
                      )}
                      <button
                        onClick={() => handleRemove(index)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          fontSize: "14px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>{checkAccess(["adminPagePermissionsWrite"]) ? <>Hallo</> : null}</div>
          )}

          {bugReport ? (
            <>
              <p>{bugReport.status}</p>
              <p>{convertToInputDateTime(bugReport.createdAt)}</p>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {checkAccess(["adminPageNotificationsWrite"]) && !isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Bearbeiten
            </Button>
          )}

          <Button
            variant="success"
            onClick={handleSave}
            disabled={isSaving}
            style={{ width: "100px" }}
          >
            {isSaving ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <span>Speichern</span>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              isEditing && bugReport ? setIsEditing(false) : closeModal();
            }}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateBugReport;
