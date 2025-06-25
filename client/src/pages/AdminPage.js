import { useState, useEffect, useContext, useMemo } from "react";
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

import "components/adminPage/adminPage.css";
import { all } from "axios";

function AdminPage() {
  const [serverLog, setServerLog] = useState(null);
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

  //console.log("serverLog:", serverLog);
  //console.log("serverlogOffset:", serverlogOffset);
  //console.log("serverLogMaxEntries:", serverLogMaxEntries);
  //console.log("filtered-ServerLog", filteredServerLog);
  //console.log("allRouteGroups", allRouteGroups);
  //console.log("allPermissions", allPermissions);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { routeGroups } = useContext(AuthContext);

  const fetchServerLog = async () => {
    try {
      const response = await axiosProtected.get(`/adminPage/getServerLog/50-${serverlogOffset}`);

      if (!serverLog) {
        setServerLog(response.data.serverLogs);
      } else {
        setServerLog((prevLogs) => {
          const existingIds = new Set(prevLogs.map((log) => log.id));
          const newLogs = response.data.serverLogs.filter((log) => !existingIds.has(log.id));
          return [...prevLogs, ...newLogs];
        });
      }

      setServerlogOffset((prevOffset) => prevOffset + 50);
      setServerLogMaxEntries(Number(response?.data?.serverLogCount) || null);
    } catch (error) {
      if (error.name === "CanceledError") {
        console.log("Server-Log-Fetch abgebrochen");
      } else {
        addToast("Fehler beim Laden des ServerLogs", "danger");
      }
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const refreshServerLog = async () => {
    setLoadingServerLogPart(true);
    try {
      const response = await axiosProtected.get(`/adminPage/getServerLog/50-0`);
      const newLogs = response.data.serverLogs;

      if (!serverLog?.length) {
        setServerLog(newLogs);
      } else {
        // IDs der bisherigen Logs
        const existingIds = new Set(serverLog.map((log) => log.id));
        // Nur neue Logs, die noch nicht existieren
        const onlyNewLogs = newLogs.filter((log) => !existingIds.has(log.id));

        if (onlyNewLogs.length) {
          setServerLog((prev) => [...onlyNewLogs, ...prev]);
        }
      }

      setServerLogMaxEntries(Number(response?.data?.serverLogCount) || null);
    } catch (error) {
      addToast("Fehler beim Aktualisieren des ServerLogs", "danger");
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const fetchFilteredServerLog = async (filters, offset = filteredServerlogOffset) => {
    try {
      const response = await axiosProtected.post(
        `/adminPage/getFilteredServerLog/50-${offset}`,
        filters
      );

      const newLogs = response.data.serverLogs || [];

      setFilteredServerLog((prev) => {
        if (!prev) return newLogs;

        const existingIds = new Set(prev.map((log) => log.id));
        const filteredNewLogs = newLogs.filter((log) => !existingIds.has(log.id));

        return [...prev, ...filteredNewLogs];
      });

      setFilteredServerlogOffset((prev) => prev + 50);
      setFilteredServerLogMaxEntries(Number(response?.data?.serverLogCount) || null);
    } catch (error) {
      if (error.name !== "CanceledError") {
        addToast("Fehler beim Laden der gefilterten Logs", "danger");
      }
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const refreshFilteredServerLog = async () => {
    if (!activeFilters) return;
    setLoadingServerLogPart(true);
    try {
      const response = await axiosProtected.post(
        `/adminPage/getFilteredServerLog/50-0`,
        activeFilters
      );
      const newLogs = response.data.serverLogs || [];

      if (!filteredServerLog?.length) {
        setFilteredServerLog(newLogs);
      } else {
        // IDs der bisherigen Logs
        const existingIds = new Set(filteredServerLog.map((log) => log.id));
        // Nur neue Logs, die noch nicht existieren
        const onlyNewLogs = newLogs.filter((log) => !existingIds.has(log.id));

        if (onlyNewLogs.length) {
          setFilteredServerLog((prev) => [...onlyNewLogs, ...prev]);
        }
      }

      setFilteredServerLogMaxEntries(Number(response?.data?.serverLogCount) || null);
    } catch {
      addToast("Fehler beim Aktualisieren der gefilterten Logs", "danger");
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axiosProtected.get(`/adminPage/getFilterOptionsServerLog`);
        console.log("Server-Log-Fetch erfolgreich:", response?.data);
        setFilterOptions(response?.data?.filterOptions);
      } catch (error) {
        if (error.name === "CanceledError") {
          console.log("Server-Log Filter Optionen Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der Server-Log Filter Optionen", "danger");
        }
      }
    };

    const fetchAllRouteGroups = async () => {
      try {
        const response = await axiosProtected.get(`/adminPage/getAllRouteGroups`);
        console.log("All Route Groups-Fetch erfolgreich:", response?.data);
        setAllRouteGroups(response?.data?.routeGroups);
        setLoadingAllRouteGroups(false);
      } catch (error) {
        if (error.name === "CanceledError") {
          console.log("Route Groups Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der Route Groups", "danger");
        }
      }
    };

    const fetchAllPermissions = async () => {
      try {
        const response = await axiosProtected.get(`/adminPage/getAllPermissionsWithRouteGroups`);
        console.log("All Permissions-Fetch erfolgreich:", response?.data);
        setAllPermissions(response?.data?.permissions);
        setLoadingAllPermissions(false);
      } catch (error) {
        if (error.name === "CanceledError") {
          console.log("Permissions Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der Permissions", "danger");
        }
      }
    };

    fetchFilterOptions();
    fetchAllRouteGroups();
    fetchAllPermissions();
    fetchServerLog();
    setLoadingServerLog(false);
  }, []);

  async function handleServerLogSearch(filterOptions) {
    setLoadingServerLogPart(true);
    setFilteredServerlogOffset(0);
    setFilteredServerLog(null);
    setActiveFilters(filterOptions);
    fetchFilteredServerLog(filterOptions, 0);
  }

  function handleNewPermission(permission) {
    console.log(permission);
    setAllPermissions((prev) => [...prev, permission]);
    setShowCreatePermissionModal(false);
  }

  function handleEditPermission(permission) {
    console.log(permission);
    setAllPermissions((prev) => prev.map((p) => (p.id === permission.id ? permission : p)));
    setSelectedPermission(null);
  }

  function handleDeletePermission(permissionId) {
    setAllPermissions((prev) => prev.filter((p) => p.id !== permissionId));
    setSelectedPermission(null);
  }

  return (
    <>
      <Container className="page-wrapper mt-4">
        <h2>AdminPage</h2>

        <div>
          <Tabs defaultActiveKey="serverLog" id="adminPage-tabs">
            <Tab
              eventKey="serverLog"
              title="ServerLog"
              className="border p-3 mb-4"
              style={{ maxHeight: "calc(100vh - 70px)", overflowY: "auto" }}
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
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={refreshFilteredServerLog}
                        >
                          Gefilterte aktualisieren
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={refreshServerLog}
                      >
                        Aktualisieren
                      </button>
                    )}
                  </div>

                  <div
                    className="border"
                    style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}
                  >
                    <Table striped bordered hover className="mb-0">
                      <thead className="border" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th className="text-center">ID</th>
                          <th className="text-center">Zeitstempel</th>
                          <th className="text-center">Level</th>
                          <th className="text-center">Nachricht</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activeFilters ? filteredServerLog : serverLog)?.map((log) => (
                          <tr key={log.id} onClick={() => setSelectedServerLog(log.id)}>
                            <td style={{ cursor: "pointer", fontWeight: "bold" }}>{log.id}</td>
                            <td className="text-center">
                              {convertToLocalTimeStamp(log.timestamp)}
                            </td>
                            <td className="text-center">{log.level}</td>
                            <td className="text-center">{log.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <button
                      className="btn btn-secondary mt-2"
                      onClick={() => {
                        setLoadingServerLogPart(true);
                        if (activeFilters) {
                          fetchFilteredServerLog(activeFilters, filteredServerlogOffset);
                        } else {
                          fetchServerLog();
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
                      {loadingServerLogPart ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        "Mehr laden"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <TableLoadingAnimation />
              )}
            </Tab>
            <Tab
              eventKey="allPermissions"
              title="Berechtigungsmatrix"
              className="border p-3 p mb-4"
              style={{ maxHeight: "calc(100vh - 70px)", overflowY: "auto" }}
            >
              {!loadingAllRouteGroups && !loadingAllPermissions && allRouteGroups?.length > 0 ? (
                <>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => setShowCreatePermissionModal(true)}
                    >
                      +
                    </button>
                    <InputGroup className="flex-grow-1">
                      <FormControl
                        placeholder="Suche in Logs"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleServerLogSearch}
                    >
                      Suchen
                    </button>
                  </div>

                  <div
                    className="border table-container"
                    style={{ maxHeight: "calc(100vh - 185px)", overflowY: "auto" }}
                  >
                    <Table striped bordered hover className="mb-0">
                      <thead className="border">
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
                        {allPermissions.map((permission) => (
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
          handleNewPermission={handleNewPermission}
          handleEditPermission={null}
          permission={null}
        />
      ) : null}

      {selectedPermission ? (
        <CreatePermissionModal
          show={!!selectedPermission}
          handleClose={() => setSelectedPermission(false)}
          allPermissions={allPermissions}
          allRouteGroups={allRouteGroups}
          handleNewPermission={null}
          handleEditPermission={handleEditPermission}
          handleDeletePermission={handleDeletePermission}
          permission={allPermissions.find((p) => p.id === selectedPermission?.id) || null}
        />
      ) : null}
    </>
  );
}

export default AdminPage;
