import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import ServerLogFilterOptionsModal from "components/adminPage/ServerLogFilterOptionsModal";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { convertToLocalTimeStamp } from "util/timeConverting";
import ShowServerlogEntry from "components/adminPage/ShowServerlogEntry";
import CreatePermissionModal from "components/adminPage/CreatePermissionModal";
import ResizableTable from "components/util/ResizableTable";
import { SocketContext } from "contexts/SocketProvider";

import "components/adminPage/adminPage.css";

function clearFilters(filters) {
  const clearedFilters = { ...filters };
  Object.keys(clearedFilters).forEach((key, index) => {
    console.log("test", index, key, clearedFilters[key]);
    if (
      clearedFilters[key] === "" ||
      clearedFilters[key] === null ||
      clearedFilters[key] === undefined ||
      clearedFilters[key].length === 0
    ) {
      delete clearedFilters[key];
    } else {
      if (key === "createdAtFrom" || key === "createdAtTo") {
        clearedFilters[key] = new Date(clearedFilters[key]).toISOString();
      }
      if (key === "userIds") {
        clearedFilters[key] = clearedFilters[key].map((id) => Number(id));
      }
    }
  });

  console.log("Cleared Filters:", clearedFilters);
  return clearedFilters;
}

function AdminPage() {
  const [serverLog, setServerLog] = useState([]);
  const [filteredServerLog, setFilteredServerLog] = useState(null);
  const [loadingServerLog, setLoadingServerLog] = useState(false);
  const [serverlogOffset, setServerlogOffset] = useState(0);
  const [serverLogMaxEntries, setServerLogMaxEntries] = useState(null);
  const [filteredServerlogOffset, setFilteredServerlogOffset] = useState(0);
  const [filteredServerLogMaxEntries, setFilteredServerLogMaxEntries] = useState(null);
  const [loadingServerLogPart, setLoadingServerLogPart] = useState(true);
  const [allRouteGroups, setAllRouteGroups] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingAllRouteGroups, setLoadingAllRouteGroups] = useState(true);
  const [loadingAllPermissions, setLoadingAllPermissions] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServerLog, setSelectedServerLog] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [showFilterOptionsModal, setShowFilterOptionsModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const [showCreateUserNotificationModal, setShowCreateUserNotificationModal] = useState(false);
  const [userNotifications, setUserNotifications] = useState(null);
  const [selectedUserNotification, setSelectedUserNotification] = useState(null);
  const [loadingUserNotifications, setLoadingUserNotifications] = useState(false);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const serverLogQueueRef = useRef([]);
  const intervalRef = useRef(null);

  console.log("selectedServerLog ID", selectedServerLog);
  console.log(
    "selectedServerLog",
    serverLog.find((log) => log.id === selectedServerLog)
  );

  useEffect(() => {
    if (socket) {
      function handleNewServerLog(data) {
        serverLogQueueRef.current.push(data);
        console.log("Neuer Server-Log-Eintrag empfangen:", data);
      }

      intervalRef.current = setInterval(() => {
        const queue = serverLogQueueRef.current;
        if (queue.length === 0) return;

        // Leere Queue frühzeitig, damit spätere Logs nicht verloren gehen
        serverLogQueueRef.current = [];

        // Neue Logs oben anhängen
        setServerLog((prev) => [...[...queue].reverse(), ...(prev || [])]);
        setFilteredServerLogMaxEntries((prev) => prev + queue.length);
        setServerlogOffset((prev) => prev + queue.length);

        // Filter anwenden (optional)
        const matchingLogs = queue.filter((log) => {
          if (!activeFilters || Object.keys(activeFilters).length === 0) return true;

          return (
            (!activeFilters.types?.length || activeFilters.types.includes(log.type)) &&
            (!activeFilters.userIds?.length ||
              activeFilters.userIds.map(Number).includes(log.userId)) &&
            (!activeFilters.createdAtFrom ||
              new Date(log.createdAt) >= new Date(activeFilters.createdAtFrom)) &&
            (!activeFilters.createdAtTo ||
              new Date(log.createdAt) <= new Date(activeFilters.createdAtTo)) &&
            (!activeFilters.ipv4Address ||
              log.ipv4Address?.toLowerCase().includes(activeFilters.ipv4Address.toLowerCase())) &&
            (!activeFilters.message ||
              log.message?.toLowerCase().includes(activeFilters.message.toLowerCase()))
          );
        });

        if (matchingLogs.length > 0) {
          setFilteredServerLog((prev) => [...matchingLogs.reverse(), ...(prev || [])]);
          setFilteredServerLogMaxEntries((prev) => prev + matchingLogs.length);
          setFilteredServerlogOffset((prev) => prev + matchingLogs.length);
        }
      }, 100); // alle 100ms prüfen

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

      socket.emit("subscribe:adminPage:serverLogs:watchList");

      socket.on("adminPage:serverLogs:create", handleNewServerLog);

      socket.on("adminPage:permissions:create", handlePermissionCreate);
      socket.on("adminPage:permissions:update", handlePermissionUpdate);
      socket.on("adminPage:permissions:delete", handlePermissionDelete);

      return () => {
        socket.off("adminPage:serverLogs:create", handleNewServerLog);

        socket.off("adminPage:permissions:create", handlePermissionCreate);
        socket.off("adminPage:permissions:update", handlePermissionUpdate);
        socket.off("adminPage:permissions:delete", handlePermissionDelete);

        clearInterval(intervalRef.current);
      };
    }
  }, [socket, activeFilters, setFilteredServerLog, setServerLog]);

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

  const mergeNewLogs = (existingLogs, newLogs) => {
    const existingIds = new Set(existingLogs.map((log) => log.id));
    return [...existingLogs, ...newLogs.filter((log) => !existingIds.has(log.id))];
  };

  const fetchServerLogs = async (offset = 0) => {
    setLoadingServerLogPart(true);
    try {
      const { data } = await axiosProtected.get(`/adminPage/getServerLogs/50-${offset}`);
      const logs = data?.serverLogs || [];

      setServerLog((prev) => mergeNewLogs(prev || [], logs));
      setServerlogOffset((prev) => prev + 50);
      setServerLogMaxEntries(Number(data?.serverLogCount) || null);
    } catch (error) {
      if (error.name !== "CanceledError") {
        addToast("Fehler beim Laden des ServerLogs", "danger");
      }
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const fetchFilteredLogs = async (filters, offset = 0) => {
    setLoadingServerLogPart(true);

    try {
      const { data } = await axiosProtected.post(
        `/adminPage/getFilteredServerLogs/50-${offset}`,
        clearFilters(filters)
      );
      const logs = data?.serverLogs || [];

      setFilteredServerLog((prev) => mergeNewLogs(prev || [], logs));
      setFilteredServerlogOffset(offset + 50);
      setFilteredServerLogMaxEntries(Number(data?.serverLogCount) || 0);
    } catch (error) {
      if (error.name !== "CanceledError") {
        addToast("Fehler beim Laden der gefilterten Logs", "danger");
      }
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const promises = [];

      if (checkAccess(["adminPageServerLogRead"])) {
        promises.push(
          axiosProtected
            .get(`/adminPage/getFilterOptionsServerLog`)
            .then((res) => setFilterOptions(res?.data?.filterOptions || []))
        );
      }

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
      setLoadingServerLog(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    checkAccess(["adminPageServerLogRead"]) && fetchServerLogs();
  }, []);

  function handleServerLogSearch(filters) {
    setActiveFilters(filters);
    setFilteredServerlogOffset(0);
    setFilteredServerLog(null);
    fetchFilteredLogs(filters, 0);
  }

  console.log("filteredServerLogMaxEntries", filteredServerLogMaxEntries);
  console.log("filteredServerlogOffset", filteredServerlogOffset);
  console.log("activeFilters", activeFilters);

  return (
    <>
      <Container className="page-wrapper mt-4">
        <h2>AdminPage</h2>

        <div>
          <Tabs defaultActiveKey="serverLog" id="adminPage-tabs">
            {checkAccess(["adminPageServerLogRead"]) ? (
              <Tab
                eventKey="serverLog"
                title="ServerLog"
                className="border-end border-bottom border-start p-3 mb-4"
                style={{
                  maxHeight: "calc(100vh - 70px)",
                  overflowY: "auto",
                }}
              >
                {!loadingServerLog && serverLog?.length > 0 ? (
                  <>
                    <div className="d-flex gap-2 mb-3">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setShowFilterOptionsModal(true)}
                      >
                        Such/Filter Optionen
                      </button>

                      {activeFilters ? (
                        <>
                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => {
                              setActiveFilters(null);
                              setFilteredServerLog(null);
                              setFilteredServerlogOffset(0);
                            }}
                          >
                            Such/Filter löschen
                          </button>
                        </>
                      ) : null}
                    </div>

                    <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                      <ResizableTable
                        columns={[
                          { title: "ID", width: 50 },
                          { title: "Zeitstempel", width: 180 },
                          { title: "Type", width: 60 },
                          { title: "Nachricht" },
                        ]}
                        tableHeight="calc(100vh - 302px)"
                      >
                        <tbody>
                          {(activeFilters ? filteredServerLog : serverLog)?.map((log) => (
                            <tr
                              key={log.id}
                              onClick={() => setSelectedServerLog(log.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{log.id}</td>
                              <td className="text-center">
                                {convertToLocalTimeStamp(log.createdAt)}
                              </td>
                              <td className="text-center">{log.type}</td>
                              <td className="text-center">{log.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </ResizableTable>
                    </div>
                    <div className="text-center my-3">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (activeFilters) {
                            fetchFilteredLogs(activeFilters, filteredServerlogOffset);
                          } else {
                            console.log("Lade mehr Server-Logs", serverlogOffset);
                            fetchServerLogs(serverlogOffset);
                          }
                        }}
                        disabled={
                          loadingServerLogPart ||
                          (activeFilters
                            ? filteredServerlogOffset >= filteredServerLogMaxEntries
                            : serverlogOffset >= serverLogMaxEntries)
                        }
                      >
                        {loadingServerLogPart ? "Lade mehr..." : "Mehr laden"}
                      </button>
                    </div>
                  </>
                ) : (
                  <TableLoadingAnimation />
                )}
              </Tab>
            ) : null}

            {checkAccess(["adminPagePermissionsRead", "adminPagePermissionsWrite"]) ? (
              <Tab
                eventKey="allPermissions"
                title="Berechtigungsmatrix"
                className="border-end border-bottom border-start p-3 p mb-4"
                style={{ maxHeight: "calc(100vh - 70px)", overflowY: "auto" }}
              >
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
              </Tab>
            ) : null}

            {true ? (
              <Tab
                eventKey="userNotifications"
                title="User Notifications"
                className="border-end border-bottom border-start p-3 mb-4"
                style={{
                  maxHeight: "calc(100vh - 70px)",
                  overflowY: "auto",
                }}
              >
                {!loadingUserNotifications && userNotifications !== null ? (
                  <>
                    <div className="d-flex gap-2 mb-3">
                      {true ? (
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => setShowCreateUserNotificationModal(true)}
                        >
                          +
                        </button>
                      ) : null}

                      <InputGroup className="flex-grow-1">
                        <FormControl
                          placeholder="Suche in Benachrichtigungen"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                      <button className="btn btn-primary" type="button" onClick={() => {}}>
                        Suchen
                      </button>
                    </div>

                    <div
                      className="border"
                      style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}
                    >
                      <Table striped bordered hover fixed className="mb-0">
                        <thead className="border" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                          <tr className="border">
                            <th className="text-center">ID</th>
                            <th className="text-center">Titel</th>
                            <th className="text-center">Freigegeben</th>
                            <th className="text-center">Datum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userNotifications.map((notification) => (
                            <tr
                              key={notification.id}
                              onClick={() => setSelectedUserNotification(notification.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{notification.id}</td>
                              <td className="text-center">{notification.title}</td>
                              <td className="text-center">{notification.active}</td>
                              <td className="text-center">
                                {convertToLocalTimeStamp(notification.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {/* //TODO: Button ändern auf notifications                 */}
                      <div className="text-center my-3">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            if (activeFilters) {
                              fetchFilteredLogs(activeFilters, filteredServerlogOffset);
                            } else {
                              console.log("Lade mehr Server-Logs", serverlogOffset);
                              fetchServerLogs(serverlogOffset);
                            }
                          }}
                          disabled={
                            loadingServerLogPart ||
                            (activeFilters
                              ? filteredServerLogMaxEntries &&
                                filteredServerlogOffset >= filteredServerLogMaxEntries
                              : serverLogMaxEntries && serverlogOffset >= serverLogMaxEntries)
                          }
                        >
                          {loadingServerLogPart ? "Lade mehr..." : "Mehr laden"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <TableLoadingAnimation />
                )}
              </Tab>
            ) : null}
          </Tabs>
        </div>
      </Container>

      {selectedServerLog ? (
        <ShowServerlogEntry
          show={!!selectedServerLog}
          handleClose={() => setSelectedServerLog(null)}
          serverLogEntry={serverLog.find((log) => log.id === selectedServerLog)}
        />
      ) : null}

      {showFilterOptionsModal ? (
        <ServerLogFilterOptionsModal
          show={!!showFilterOptionsModal}
          handleClose={() => setShowFilterOptionsModal(false)}
          filterOptions={filterOptions}
          handleFilterOptions={handleServerLogSearch}
          activeFilters={activeFilters}
        />
      ) : null}

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

export default AdminPage;
