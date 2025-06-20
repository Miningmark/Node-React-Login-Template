import { useState, useEffect, useContext, useMemo } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";

import TableLoadingAnimation from "components/TableLoadingAnimation";

function AdminPage() {
  const [serverLog, setServerLog] = useState(null);
  const [laodingServerLog, setLoadingServerLog] = useState(false);
  const [loadingServerLogPart, setLoadingServerLogPart] = useState(true);
  const [allRouteGroups, setAllRouteGroups] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingAllRouteGroups, setLoadingAllRouteGroups] = useState(true);
  const [loadingAllPermissions, setLoadingAllPermissions] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServerLog, setSelectedServerLog] = useState(null);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { routeGroups } = useContext(AuthContext);

  const fetchServerLog = async (limit, offset) => {
    try {
      const response = await axiosProtected.get(`/adminPage/getServerLog/${limit}-${offset}`);
      if (!serverLog) {
        setServerLog(response.data.serverLogs);
      } else {
        setServerLog((prevLogs) => [...prevLogs, ...response.data.serverLogs]);
      }
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
    fetchServerLog(50, 0);
    //setLoadingServerLog(false);
  }, []);

  async function handleServerLogSearch() {
    //TODO: API call
  }

  return (
    <>
      <Container className="mt-4">
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
                    style={{ maxHeight: "calc(100vh - 185px)", overflowY: "auto" }}
                  >
                    <Table striped bordered hover className="mb-0">
                      <thead className="border" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th>ID</th>
                          <th>Zeitstempel</th>
                          <th>Level</th>
                          <th>Nachricht</th>
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
                            <td className="text-center">{log.timestamp}</td>
                            <td className="text-center">{log.level}</td>
                            <td className="text-center">{log.message}</td>
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
    </>
  );
}

export default AdminPage;
