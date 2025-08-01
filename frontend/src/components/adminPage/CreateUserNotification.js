import { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import ConfirmModal from "components/util/ConfirmModal";
import { AuthContext } from "contexts/AuthContext";

const CreateUserNotification = ({ show, handleClose, notification }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(!notification);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);

  const closeModal = () => {
    setName("");
    setMessage("");
    setStartDate("");
    setEndDate("");
    handleClose();
  };

  async function handleSave() {
    setIsSaving(true);
    try {
    } catch (error) {
      addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
      handleClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
    } catch (error) {
      addToast(error.response?.data?.message || "Löschen fehlgeschlagen", "danger");
      handleClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Modal show={show} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Benachrichtigung Bearbeiten" : "Neue Benachrichtigung erstellen"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${touched.name && !name ? "is-invalid" : ""}`}
              id="floatingName"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              name="name"
              disabled={!isEditing}
            />
            <label htmlFor="floatingName">Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="date"
              className={`form-control ${touched.startDate && !startDate ? "is-invalid" : ""}`}
              id="floatingStartDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, startDate: true }))}
              name="startDate"
              disabled={!isEditing}
            />
            <label htmlFor="floatingStartDate">Anzeige von</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="date"
              className={`form-control ${touched.endDate && !endDate ? "is-invalid" : ""}`}
              id="floatingEndDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, endDate: true }))}
              name="endDate"
              disabled={!isEditing}
            />
            <label htmlFor="floatingEndDate">Anzeige bis</label>
          </div>

          <div className="form-floating mb-3">
            <textarea
              type="text"
              className={`form-control ${touched.message && !message ? "is-invalid" : ""}`}
              id="floatingMessage"
              placeholder="Nachricht"
              value={name}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
              name="message"
              style={{ height: "150px" }}
              disabled={!isEditing}
            />
            <label htmlFor="floatingMessage">nachricht</label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {notification && checkAccess(["adminPageNotificationsWrite"]) && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={isSaving}>
              Löschen
            </Button>
          )}

          {checkAccess(["adminPageNotificationsWrite"]) && !isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Bearbeiten
            </Button>
          )}

          {checkAccess(["adminPageNotificationsWrite"]) && isEditing && (
            <Button
              variant="success"
              onClick={handleSave}
              disabled={isSaving || !name}
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

          <Button variant="secondary" onClick={closeModal} disabled={isSaving}>
            Abbrechen
          </Button>
        </Modal.Footer>
      </Modal>

      {confirmDelete && (
        <ConfirmModal
          show={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          name={notification ? notification.name : ""}
          onResult={(result) => {
            if (result) handleDelete();
            setConfirmDelete(false);
          }}
        />
      )}
    </>
  );
};

export default CreateUserNotification;
