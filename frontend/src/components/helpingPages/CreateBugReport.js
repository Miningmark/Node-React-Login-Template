import { useState, useContext, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import TextEditor from "components/util/TextEditor";
import { convertToLocalTimeStamp } from "util/timeConverting";
import DOMPurify from "dompurify";
import FileViewer from "components/util/FileViewer";

const MAX_FILES = 3;
const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_FILE_TYPES =
  ".conf, .def, .doc, .docx, .dot, .in, .ini, .jpe, .jpeg, .jpg, .list, .log, .odp, .ods, .odt, .pdf, .png, .pot, .pps, .ppt, .pptx, .text, .txt, .webp, .xla, .xlc, .xlm, .xls, .xlsx, .xlt, .xlw";

const CreateBugReport = ({ show, handleClose, bugReport, STATUS_TYPES }) => {
  const [name, setName] = useState(bugReport ? bugReport.name : "");
  const [description, setDescription] = useState(bugReport ? bugReport.description : "");
  const [status, setStatus] = useState(bugReport ? bugReport.status : STATUS_TYPES[0].value);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(!bugReport);

  const [loadingFiles, setLoadingFiles] = useState(Array(bugReport?.fileCount).fill(true) || []);
  const [files, setFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess, userId } = useContext(AuthContext);

  useEffect(() => {
    if (checkAccess(["adminPagePermissionsWrite"]) && bugReport && bugReport?.fileCount > 0) {
      const loadFiles = async () => {
        setLoadingFiles(Array(bugReport.fileCount).fill(true));

        try {
          const fetchedFiles = [];

          for (let i = 0; i < bugReport.fileCount; i++) {
            const res = await axiosProtected.post(
              "/bugReport/getBugReportFile",
              {
                id: bugReport.id,
                fileIndex: i + 1, // 1-based index for the API
              },
              { responseType: "blob" }
            );

            const fileBlob = res.data;
            const contentType = res.headers["content-type"];
            let fileName = res.headers["content-disposition"]?.split("filename=")[1] || `file-${i}`;
            if (fileName.startsWith('"') && fileName.endsWith('"')) {
              fileName = fileName.slice(1, -1);
            }

            fetchedFiles.push({
              name: fileName,
              url: URL.createObjectURL(fileBlob),
              type: contentType.startsWith("image/") ? "image" : "file",
            });
          }

          setFiles(fetchedFiles);
        } catch (error) {
          addToast(error.response?.data?.message || "Datei laden fehlgeschlagen", "danger");
        } finally {
          setLoadingFiles(Array(bugReport.fileCount).fill(false));
        }
      };

      loadFiles();
    }
  }, [bugReport]);

  const closeModal = () => {
    setName("");
    setDescription("");
    handleClose();
  };

  async function handleSave() {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
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

  async function handleStatusChange(e) {
    const updatedBugReport = { ...bugReport, status: e.target.value };
    setStatus(updatedBugReport.status);

    try {
      await axiosProtected.post(`/bugReport/updateBugReportStatus`, {
        id: bugReport.id,
        status: updatedBugReport.status,
      });

      addToast("Status erfolgreich geändert", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Status Änderung fehlgeschlagen", "danger");
    } finally {
    }
  }

  return (
    <>
      <Modal show={show} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {bugReport ? bugReport.name : "Neuer Bug/Verbesserung erstellen"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!bugReport ? (
            <div className="form-floating mb-3">
              <input
                type="text"
                className={`form-control ${touched.title && !name ? "is-invalid" : ""}`}
                id="floatingTitle"
                placeholder="Title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                name="title"
                disabled={!isEditing}
                maxLength={25}
              />
              <label htmlFor="floatingTitle">Titel</label>
            </div>
          ) : null}

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
                  accept={ACCEPTED_FILE_TYPES}
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
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {checkAccess(["adminPagePermissionsWrite"]) &&
                loadingFiles.map((item, index) => {
                  const file = files[index];

                  return (
                    <div
                      key={index}
                      style={{
                        flex: "1 1 0",
                        maxWidth: `${100 / loadingFiles.length}%`,
                        aspectRatio: item ? "1 / 1" : "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        overflow: "hidden",
                      }}
                    >
                      {item ? (
                        <span
                          className="spinner-border spinner-border-xxl"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : file && file.name.toLowerCase().endsWith(".webp") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedFile(file)}
                        />
                      ) : file && file.name.toLowerCase().endsWith(".pdf") ? (
                        <embed
                          src={file.url}
                          type="application/pdf"
                          width="100%"
                          height="300px"
                          style={{ borderRadius: "8px", cursor: "pointer" }}
                        />
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "0.9rem",
                            padding: "5px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedFile(file)}
                        >
                          📄 {file ? file.name : "Datei"}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {bugReport ? (
            <div className="text-muted mt-3 mb-0">
              {checkAccess(["adminPageNotificationsWrite"]) && !isEditing ? (
                <>
                  <Form className="mb-3 mt-5">
                    <Form.Group className="mb-0">
                      <Form.Label>Status</Form.Label>
                      <Form.Select name="types" value={status} onChange={handleStatusChange}>
                        {STATUS_TYPES.map((type, index) => (
                          <option key={index} value={type.value}>
                            {type.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Form>
                </>
              ) : bugReport.userId === userId ? (
                <>
                  <Form className="mb-3 mt-5">
                    <Form.Group className="mb-0">
                      <Form.Label>Status</Form.Label>
                      <Form.Select name="types" value={status} onChange={handleStatusChange}>
                        {STATUS_TYPES.map((type, index) => (
                          <option key={index} value={type.value} disabled={type.value !== "CLOSED"}>
                            {type.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Form>
                </>
              ) : (
                <>
                  <br />
                  <span>Status: {bugReport.status}</span>
                  <br />
                </>
              )}

              <span>{convertToLocalTimeStamp(bugReport.createdAt)}</span>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {bugReport ? null : (
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
          )}

          <Button
            variant="secondary"
            onClick={() => {
              isEditing && bugReport ? setIsEditing(false) : closeModal();
            }}
            disabled={isSaving}
          >
            {bugReport ? "Schließen" : "Abbrechen"}
          </Button>
        </Modal.Footer>
      </Modal>

      {selectedFile && (
        <FileViewer show={true} handleClose={() => setSelectedFile(null)} file={selectedFile} />
      )}
    </>
  );
};

export default CreateBugReport;
