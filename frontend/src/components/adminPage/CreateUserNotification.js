import { useState, useContext, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import ConfirmModal from "components/util/ConfirmModal";
import { AuthContext } from "contexts/AuthContext";
import TextEditor from "components/util/TextEditor";
import { convertToInputDateTime } from "util/timeConverting";

const CreateUserNotification = ({ show, handleClose, notification }) => {
  const [name, setName] = useState(notification ? notification.name : "");
  const [description, setDescription] = useState(notification ? notification.description : "");
  const [notifyFrom, setNotifyFrom] = useState(
    notification ? convertToInputDateTime(notification.notifyFrom) : ""
  );
  const [notifyTo, setNotifyTo] = useState(
    notification ? convertToInputDateTime(notification.notifyTo) : ""
  );
  const [resendNotification, setResendNotification] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(!notification);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);

  console.log("notification", notification);

  const closeModal = () => {
    setName("");
    setDescription("");
    setNotifyFrom("");
    setNotifyTo("");
    handleClose();
  };

  async function handleSave() {
    setIsSaving(true);
    try {
      await axiosProtected.post("/adminPage/createNotification", {
        name,
        description,
        notifyFrom: new Date(notifyFrom).toISOString(),
        notifyTo: new Date(notifyTo).toISOString(),
      });
      addToast("Benachrichtigung erfolgreich erstellt", "success");
      closeModal();
    } catch (error) {
      addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
      handleClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit() {
    setIsSaving(true);
    try {
      await axiosProtected.post("/adminPage/updateNotification", {
        id: notification.id,
        name,
        description,
        notifyFrom: new Date(notifyFrom).toISOString(),
        notifyTo: new Date(notifyTo).toISOString(),
      });
      addToast("Benachrichtigung erfolgreich bearbeitet", "success");
      closeModal();
    } catch (error) {
      addToast(error.response?.data?.message || "Bearbeitung fehlgeschlagen", "danger");
      handleClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      await axiosProtected.post(`/adminPage/deleteNotification`, { id: notification.id });
      addToast("Benachrichtigung erfolgreich gelöscht", "success");
      handleClose();
    } catch (error) {
      addToast(error.response?.data?.message || "Löschen fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  }

  console.log("message", description);

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
              type="datetime-local"
              className={`form-control ${touched.startDate && !notifyFrom ? "is-invalid" : ""}`}
              id="floatingStartDate"
              value={notifyFrom}
              onChange={(e) => setNotifyFrom(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, startDate: true }))}
              name="startDate"
              disabled={!isEditing}
            />
            <label htmlFor="floatingStartDate">Anzeige von</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="datetime-local"
              className={`form-control ${touched.endDate && !notifyTo ? "is-invalid" : ""}`}
              id="floatingEndDate"
              value={notifyTo}
              onChange={(e) => setNotifyTo(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, endDate: true }))}
              name="endDate"
              disabled={!isEditing}
            />
            <label htmlFor="floatingEndDate">Anzeige bis</label>
          </div>

          {isEditing && (
            <div className="form-check mb-2">
              <input
                type="datetime-local"
                id="floatingResendNotification"
                checked={resendNotification}
                onChange={(e) => setResendNotification(e.target.value)}
                name="resendNotification"
                disabled={!isEditing}
              />
              <label htmlFor="floatingResendNotification">Erneute Benachtichtigung</label>
            </div>
          )}

          <div className="form-floating mb-3">
            <TextEditor
              value={description}
              onChange={setDescription}
              readOnly={!isEditing}
              placeholder={notification ? "" : "Nachricht eingeben..."}
            />
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
              onClick={() => {
                isEditing ? handleEdit() : handleSave();
              }}
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

          <Button
            variant="secondary"
            onClick={() => {
              isEditing ? setIsEditing(false) : closeModal();
            }}
            disabled={isSaving}
          >
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

      {}
    </>
  );
};

export default CreateUserNotification;
