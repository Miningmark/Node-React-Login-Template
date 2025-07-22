import { useState, useEffect, useContext, useMemo } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { Table, InputGroup, FormControl, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import CreatePermissionModal from "components/adminPage/CreatePermissionModal";
import { SocketContext } from "contexts/SocketProvider";

import "components/adminPage/adminPage.css";

function PermissionMatrixPage() {
  const [allRouteGroups, setAllRouteGroups] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingAllRouteGroups, setLoadingAllRouteGroups] = useState(true);
  const [loadingAllPermissions, setLoadingAllPermissions] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
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

      socket.emit("subscribe:adminPage:permissions:watchList");

      socket.on("adminPage:permissions:create", handlePermissionCreate);
      socket.on("adminPage:permissions:update", handlePermissionUpdate);
      socket.on("adminPage:permissions:delete", handlePermissionDelete);

      return () => {
        socket.off("adminPage:permissions:create", handlePermissionCreate);
        socket.off("adminPage:permissions:update", handlePermissionUpdate);
        socket.off("adminPage:permissions:delete", handlePermissionDelete);
      };
    }
  }, [socket]);

  const filteredPermission = useMemo(() => {
    if (!allPermissions) return [];

    const searchLower = searchTerm.toLowerCase();

    const filtered = searchTerm
      ? allPermissions.filter((item) =>
          Object.values(item).some((value) => {
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchLower);
            }
            if (typeof value === "number") {
              return value.toString().includes(searchTerm);
            }

            return false;
          })
        )
      : allPermissions;

    return sortingAlgorithm(filtered, "name", "asc");
  }, [allPermissions, searchTerm]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const promises = [];

        if (checkAccess(["adminPagePermissionsRead", "adminPagePermissionsWrite"])) {
          promises.push(
            axiosProtected
              .get(`/adminPage/getRouteGroups`)
              .then((res) => setAllRouteGroups(res?.data?.routeGroups || [])),
            axiosProtected
              .get(`/adminPage/getPermissionsWithRouteGroups`)
              .then((res) => setAllPermissions(res?.data?.permissions || []))
          );
        }
        await Promise.all(promises);
      } catch (error) {
        addToast("Fehler beim Laden von Initialdaten", "danger");
      } finally {
        setLoadingAllRouteGroups(false);
        setLoadingAllPermissions(false);
      }
    };

    loadInitialData();
  }, [addToast, axiosProtected, checkAccess]);

  return (
    <>
      <Container className="page-wrapper mt-4">
        <h2>Berechtigungsmatrix</h2>

        <div>
          {!loadingAllRouteGroups && !loadingAllPermissions && allRouteGroups?.length > 0 ? (
            <>
              <div className="d-flex gap-2 mb-3">
                {checkAccess(["adminPagePermissionsWrite"]) ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => setShowCreatePermissionModal(true)}
                  >
                    +
                  </button>
                ) : null}

                <InputGroup className="flex-grow-1">
                  <FormControl
                    placeholder="Suche in Benutzerrechten"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>

              <div
                className="table-container special-table"
                style={{ maxHeight: "calc(100vh - 185px)", overflowY: "auto" }}
              >
                <Table striped bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Zugriffsrechte</th>
                      {allRouteGroups.map((routeGroup) => (
                        <th
                          key={routeGroup.id}
                          title={routeGroup.description}
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            whiteSpace: "nowrap",
                            padding: "10px",
                            textAlign: "left",
                            verticalAlign: "bottom",
                          }}
                        >
                          {routeGroup.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermission
                      .filter((permission) => permission.name !== "SuperAdmin Berechtigung")
                      .map((permission) => (
                        <tr key={permission.id}>
                          <td
                            style={{
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            title={permission.description}
                            onClick={() => setSelectedPermission(permission)}
                          >
                            {permission.name}
                          </td>
                          {allRouteGroups.map((route, index) => (
                            <td key={index}>
                              <input
                                type="checkbox"
                                checked={permission.routeGroups.some(
                                  (rg) => rg.name === route.name
                                )}
                                disabled
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            <TableLoadingAnimation />
          )}
        </div>
      </Container>

      {showCreatePermissionModal ? (
        <CreatePermissionModal
          show={!!showCreatePermissionModal}
          handleClose={() => setShowCreatePermissionModal(false)}
          allPermissions={allPermissions}
          allRouteGroups={allRouteGroups}
          permission={null}
        />
      ) : null}

      {selectedPermission ? (
        <CreatePermissionModal
          show={!!selectedPermission}
          handleClose={() => setSelectedPermission(false)}
          allPermissions={allPermissions}
          allRouteGroups={allRouteGroups}
          permission={allPermissions.find((p) => p.id === selectedPermission?.id) || null}
        />
      ) : null}
    </>
  );
}

export default PermissionMatrixPage;
