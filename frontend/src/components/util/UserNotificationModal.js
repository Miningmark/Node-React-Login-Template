import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { convertToLocalTimeStamp } from "util/timeConverting";
import DOMPurify from "dompurify";

export default function UserNotificationModal({ notification, notificationRead }) {
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(false);

  console.log("UserNotificationModal", notification);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  async function handleNotificationRead() {
    setLoading(true);
    try {
      await axiosProtected.post("/user/confirmPendingNotification", { id: notification.id });
      addToast(`Benachrichtigung ${notification.name} als gelesen markiert`, "success");
      notificationRead(notification.id);
      setShow(false);
    } catch (error) {
      addToast(
        error.response?.data?.message || "Fehler beim als gelesen Markieren der Benachrichtigung",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal
        show={show}
        onHide={() => {
          notificationRead(notification.id);
          setShow(false);
        }}
        backdrop="static"
        keyboard={false}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{notification.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.description) }} />
          <p>
            Gültig bis: <span>{convertToLocalTimeStamp(notification.notifyTo)}</span>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              notificationRead(notification.id);
              setShow(false);
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              "Schließen"
            )}
          </Button>
          <Button variant="primary" onClick={handleNotificationRead} disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              "Als gelesen markieren"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
