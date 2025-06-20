import { useState, useEffect, useContext, useMemo } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";

import TableLoadingAnimation from "components/TableLoadingAnimation";
import { convertToLocalTimeStamp } from "util/timeConverting";
import ShowServerlogEntry from "components/adminPage/ShowServerlogEntry";

function AdminPage() {
  const [serverLog, setServerLog] = useState(null);
  const [laodingServerLog, setLoadingServerLog] = useState(false);
  const [serverlogOffset, setServerlogOffset] = useState(0);
  const [serverLogMaxEntries, setServerLogMaxEntries] = useState(null);
  const [loadingServerLogPart, setLoadingServerLogPart] = useState(true);
  const [allRouteGroups, setAllRouteGroups] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingAllRouteGroups, setLoadingAllRouteGroups] = useState(true);
  const [loadingAllPermissions, setLoadingAllPermissions] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [serverLogSearchOptions, setServerLogSearchOptions] = useState(null);
  const [selectedServerLog, setSelectedServerLog] = useState(null);

  console.log("serverLog:", serverLog);
  console.log("serverlogOffset:", serverlogOffset);
  console.log("serverLogMaxEntries:", serverLogMaxEntries);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { routeGroups } = useContext(AuthContext);

  const fetchServerLog = async () => {
    try {
      const response = await axiosProtected.get(`/adminPage/getServerLog/50-${serverlogOffset}`);
      console.log("Server-Log-Fetch erfolgreich:", response?.data);
      if (!serverLog) {
        setServerLog(response.data.serverLogs);
      } else {
        setServerLog((prevLogs) => [...prevLogs, ...response.data.serverLogs]);
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

  useEffect(() => {
    fetchServerLog();
    setLoadingServerLog(false);
  }, []);

  async function handleServerLogSearch() {
    //TODO: API call
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
              {!laodingServerLog && serverLog?.length > 0 ? (
                <>
                  <div className="d-flex gap-2 mb-3">
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
                    className="border"
                    style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
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
                        {serverLog.map((log) => (
                          <tr
                            key={log.id}
                            onClick={() => {
                              setSelectedServerLog(log.id);
                            }}
                          >
                            <td
                              style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                            >
                              {log.id}
                            </td>
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
                        fetchServerLog();
                      }}
                      disabled={
                        loadingServerLogPart ||
                        (serverLogMaxEntries && serverlogOffset >= serverLogMaxEntries)
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
              {!loadingAllRouteGroups && !loadingAllPermissions && routeGroups?.length > 0 ? (
                <>
                  <div className="d-flex gap-2 mb-3">
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
                    className="border"
                    style={{ maxHeight: "calc(100vh - 185px)", overflowY: "auto" }}
                  >
                    <Table striped bordered hover className="mb-0">
                      <thead className="border" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th>Zugriffsrechte</th>
                          {routeGroups.map((routeGroup) => (
                            <th key={routeGroup.id}>{routeGroup.name}</th>
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
                            >
                              {permission.name}
                            </td>
                            {permission.map((route, index) => (
                              <td key={index}>Nein</td>
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

      {selectedServerLog && (
        <ShowServerlogEntry
          show={!!selectedServerLog}
          handleClose={() => setSelectedServerLog(null)}
          serverLogEntry={serverLog.find((log) => log.id === selectedServerLog)}
        />
      )}
    </>
  );
}

export default AdminPage;
