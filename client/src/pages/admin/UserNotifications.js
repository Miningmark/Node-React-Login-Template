import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { convertToLocalTimeStamp } from "util/timeConverting";
import ResizableTable from "components/util/ResizableTable";
import { SocketContext } from "contexts/SocketProvider";

const UserNotificationsPage = () => {
  const [loadingUserNotifications, setLoadingUserNotifications] = useState(true);
  const [heightOffset, setHeightOffset] = useState(160);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const updateOffset = () => {
      setHeightOffset(window.innerWidth > 768 ? 80 : 0);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  return (
    <>
      <Container
        className="page-wrapper mt-4"
        style={{ height: `calc(100dvh - ${heightOffset}px)` }}
      >
        <h2>Benutzer Nachrichten</h2>
        <div>{!loadingUserNotifications ? <></> : <TableLoadingAnimation />}</div>
      </Container>
    </>
  );
};

export default UserNotificationsPage;
