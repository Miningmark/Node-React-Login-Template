import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { Container } from "react-bootstrap";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { convertToLocalTimeStamp } from "util/timeConverting";
import ResizableTable from "components/util/ResizableTable";
import { SocketContext } from "contexts/SocketProvider";
import { AuthContext } from "contexts/AuthContext";
import CreateUserNotification from "components/adminPage/CreateUserNotification";

const UserNotificationsPage = () => {
  const [userNotifications, setUserNotifications] = useState([]);
  const [userNotificationsOffset, setUserNotificationsOffset] = useState(0);
  const [userNotificationsMaxEntries, setUserNotificationsMaxEntries] = useState(0);
  const [loadingUserNotifications, setLoadingUserNotifications] = useState(true);

  const [showCreateNotificationModal, setShowCreateNotificationModal] = useState(false);
  const [showEditNotificationModal, setShowEditNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [heightOffset, setHeightOffset] = useState(160);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const updateOffset = () => {
      setHeightOffset(window.innerWidth > 768 ? 80 : 0);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  useEffect(() => {
    if (socket) {
      function handleUserNotificationCreated(data) {
        setUserNotifications((prev) => [data, ...prev]);
      }

      function handleUserNotificationUpdated(data) {
        setUserNotifications((prev) =>
          prev.map((notification) => (notification.id === data.id ? data : notification))
        );
      }

      function handleUserNotificationDeleted(data) {
        setUserNotifications((prev) => prev.filter((notification) => notification.id !== data.id));
      }

      socket.emit("subscribe:adminPage:notifications:watchList");

      socket.on("adminPage:notifications:create", handleUserNotificationCreated);
      socket.on("adminPage:notifications:update", handleUserNotificationUpdated);
      socket.on("adminPage:notifications:delete", handleUserNotificationDeleted);

      return () => {
        socket.off("adminPage:notifications:create", handleUserNotificationCreated);
        socket.off("adminPage:notifications:update", handleUserNotificationUpdated);
        socket.off("adminPage:notifications:delete", handleUserNotificationDeleted);
      };
    }
  }, [socket]);

  useEffect(() => {
    fetchUserNotifications();
  }, []);

  async function fetchUserNotifications(offset = 0) {
    setLoadingUserNotifications(true);
    try {
      const response = await axiosProtected.get(`/adminPage/getNotifications/50-${offset}`);
      const notifications = response?.data?.notifications || [];
      setUserNotifications((prev) => mergeNewNotifications(prev || [], notifications));
      setUserNotificationsOffset((prev) => prev + notifications.length);
      setUserNotificationsMaxEntries(response?.data?.maxEntries || null);
    } catch (error) {
      addToast("Fehler beim Laden der UserNotifications", "danger");
    } finally {
      setLoadingUserNotifications(false);
    }
  }

  const mergeNewNotifications = (existingNotifications, newNotifications) => {
    const existingIds = new Set(existingNotifications.map((n) => n.id));
    return [...existingNotifications, ...newNotifications.filter((n) => !existingIds.has(n.id))];
  };

  return (
    <>
      <Container
        className="page-wrapper mt-4"
        style={{ height: `calc(100dvh - ${heightOffset}px)` }}
      >
        <h2>Benutzer Benachrichtigungen</h2>
        <div>
          {!loadingUserNotifications ? (
            <>
              <div className="d-flex gap-2 mb-3">
                {checkAccess(["userManagementCreate"]) && (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      setShowCreateNotificationModal(true);
                    }}
                  >
                    Neue Benachrichtigung
                  </button>
                )}
              </div>
              <div
                style={{ maxHeight: `calc(100dvh - ${heightOffset + 160}px)`, overflowY: "auto" }}
              >
                <ResizableTable
                  columns={[
                    { title: "ID", width: 50 },
                    { title: "Name" },
                    { title: "Von" },
                    { title: "Bis" },
                  ]}
                  tableHeight={`calc(100dvh - ${heightOffset + 162}px)`}
                >
                  <tbody>
                    {userNotifications.map((notification) => (
                      <tr
                        key={notification.id}
                        onClick={() => {
                          setSelectedNotification(notification.id);
                          setShowEditNotificationModal(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{notification.id}</td>
                        <td className="text-center">{notification.name}</td>
                        <td className="text-center">
                          {convertToLocalTimeStamp(notification.notifyFrom)}
                        </td>
                        <td className="text-center">
                          {convertToLocalTimeStamp(notification.notifyTo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ResizableTable>
              </div>
              <div className="text-center my-3">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    fetchUserNotifications(userNotificationsOffset);
                  }}
                  disabled={
                    loadingUserNotifications ||
                    userNotificationsOffset >= userNotificationsMaxEntries
                  }
                >
                  {loadingUserNotifications ? "Lade mehr..." : "Mehr laden"}
                </button>
              </div>
            </>
          ) : (
            <TableLoadingAnimation />
          )}
        </div>
      </Container>

      {showCreateNotificationModal && (
        <CreateUserNotification
          show={showCreateNotificationModal}
          handleClose={() => setShowCreateNotificationModal(false)}
          notification={null}
        />
      )}

      {selectedNotification && (
        <CreateUserNotification
          show={showEditNotificationModal}
          handleClose={() => setSelectedNotification(null)}
          notification={userNotifications.find((n) => n.id === selectedNotification)}
        />
      )}
    </>
  );
};

export default UserNotificationsPage;
