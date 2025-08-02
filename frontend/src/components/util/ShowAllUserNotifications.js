import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { convertToLocalTimeStamp } from "util/timeConverting";
import DOMPurify from "dompurify";

//Icons
import { ReactComponent as ArrowBackIcon } from "assets/icons/arrow_back.svg";
import { ReactComponent as ArrowForwardIcon } from "assets/icons/arrow_forward.svg";

export default function ShowAllUserNotifications({ handleClose }) {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [show, setShow] = useState(true);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await axiosProtected.get("/user/getActiveNotifications");
        setNotifications(response.data.activeNotifications);
        setLoading(false);
      } catch (error) {
        addToast(
          error.response?.data?.message || "Fehler beim Laden der Benachrichtigungen",
          "danger"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  function closeModal() {
    setShow(false);
    handleClose();
  }

  async function handleNotificationRead() {
    setIsSaving(true);
    try {
      await axiosProtected.post("/user/confirmPendingNotification", {
        id: notifications[selectedNotification].id,
      });
      setNotifications((prev) =>
        prev.map((notification, index) =>
          index === selectedNotification ? { ...notification, confirmed: true } : notification
        )
      );
      addToast(
        `Benachrichtigung ${notifications[selectedNotification].name} als gelesen markiert`,
        "success"
      );
    } catch (error) {
      addToast(
        error.response?.data?.message || "Fehler beim als gelesen Markieren der Benachrichtigung",
        "danger"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal show={show} onHide={closeModal} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {loading
            ? "Alle Benachrichtigungen"
            : notifications.length > 0
            ? notifications[selectedNotification].name
            : "Benachrichtigungen"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span> Lade Benachrichtigungen...</span>
          </div>
        ) : (
          <div>
            {notifications.length === 0 ? (
              <p className="text-center m-4">Keine Benachrichtigungen vorhanden.</p>
            ) : (
              <>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(notifications[selectedNotification].description),
                  }}
                />
                <p>
                  Gültig bis:{" "}
                  <span>
                    {convertToLocalTimeStamp(notifications[selectedNotification].notifyTo)}
                  </span>
                </p>
              </>
            )}
          </div>
        )}
      </Modal.Body>

      {!loading && notifications.length > 0 && (
        <Modal.Footer>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button
              disabled={selectedNotification === 0}
              onClick={() => setSelectedNotification((prev) => prev - 1)}
            >
              <ArrowBackIcon width="24" height="24" />
            </Button>

            {notifications[selectedNotification].confirmed ? (
              <span className="text-success">Benachrichtigung bereits gelesen</span>
            ) : (
              <Button variant="primary" onClick={handleNotificationRead} disabled={isSaving}>
                {isSaving ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Als gelesen markieren"
                )}
              </Button>
            )}

            <Button
              disabled={selectedNotification === notifications.length - 1}
              onClick={() => setSelectedNotification((prev) => prev + 1)}
            >
              <ArrowForwardIcon width="24" height="24" />
            </Button>
          </div>
        </Modal.Footer>
      )}

      {loading ||
        (notifications.length === 0 ? (
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Schließen
            </Button>
          </Modal.Footer>
        ) : null)}
    </Modal>
  );
}
