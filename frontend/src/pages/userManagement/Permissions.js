import { useState, useEffect, useContext, useMemo } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { SocketContext } from "contexts/SocketProvider";
import ResizableTable from "components/util/ResizableTable";

const PermissionsPage = () => {
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [allPermissions, setAllPermissions] = useState([]);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
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

  useEffect(() => {
    if (!socket) return;

    const handlePermissionCreate = (newPermission) => {
      setAllPermissions((prevPermissions) => [...prevPermissions, newPermission]);
    };

    const handlePermissionUpdate = (updatedPermission) => {
      setAllPermissions((prevPermissions) =>
        prevPermissions.map((permission) =>
          permission.id === updatedPermission.id ? updatedPermission : permission
        )
      );
    };

    const handlePermissionDelete = (deletedPermission) => {
      setAllPermissions((prevPermissions) =>
        prevPermissions.filter((permission) => permission.id !== deletedPermission.id)
      );
    };

    socket.emit("subscribe:userManagement:permissions:watchList");

    socket.on("userManagement:permissions:create", handlePermissionCreate);
    socket.on("userManagement:permissions:update", handlePermissionUpdate);
    socket.on("userManagement:permissions:delete", handlePermissionDelete);

    return () => {
      socket.off("userManagement:permissions:create", handlePermissionCreate);
      socket.off("userManagement:permissions:update", handlePermissionUpdate);
      socket.off("userManagement:permissions:delete", handlePermissionDelete);
    };
  }, [socket]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const response = await axiosProtected.get("/userManagement/getPermissions", {
          signal: controller.signal,
        });
        setAllPermissions(response.data.permissions);
      } catch (error) {
        if (error.name === "CanceledError") {
          console.warn("Permissions-Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der Berechtigungen", "danger");
        }
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchAllPermissions();

    return () => {
      controller.abort();
    };
  }, [addToast, axiosProtected]);

  const filteredPermissions = useMemo(() => {
    if (!allPermissions) return [];

    return sortingAlgorithm(allPermissions, sortColumn, sortOrder);
  }, [allPermissions, sortColumn, sortOrder]);

  function handleSort(columnId) {
    if (columnId === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortOrder("asc");
    }
  }

  return (
    <>
      <Container
        className="page-wrapper mt-4"
        style={{ height: `calc(100dvh - ${heightOffset}px)` }}
      >
        <h2>Rechte Übersicht</h2>
        <div>
          {!loadingPermissions && allPermissions?.length > 0 ? (
            <ResizableTable
              columns={[
                { title: "Name", id: "name" },
                { title: "Beschreibung", id: "description" },
              ]}
              tableHeight={`calc(100dvh - ${heightOffset + 62}px)`}
              handleSort={handleSort}
              rows={filteredPermissions.filter(
                (permission) => permission.name !== "SuperAdmin Berechtigung"
              )}
            />
          ) : (
            <TableLoadingAnimation />
          )}
        </div>
      </Container>
    </>
  );
};

export default PermissionsPage;
