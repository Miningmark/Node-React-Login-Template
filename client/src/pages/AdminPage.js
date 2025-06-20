import { useState, useEffect, useContext, useMemo } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import UserDetailsModal from "components/userManagement/UserDetailsModal";
import CreateUserModal from "components/userManagement/CreateUserModal";

function AdminPage() {
const [serverLog,setServerLog]=useState(null);
const [laodingServerLog,setLoadingServerLog]=useState(true);
  const [allRouteGroups, setAllRouteGroups] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingAllRouteGroups,setLoadingAllRouteGroups] =useState(true);
  const [loadingAllPermissions,setLoadingAllPermissions] =useState(true);
    const [searchTerm, setSearchTerm] = useState("");
      const [selectedServerLog,setSelectedServerLog] = useState(null);


        const axiosProtected = useAxiosProtected();
        const { addToast } = useToast();
        const { routeGroups } = useContext(AuthContext);

        useEffect(() => {
            const controller = new AbortController();
        
            const fetchServerLog = async () => {
              try {
                const response = await axiosProtected.get("/admin/getServerLog?50-0", {
                  signal: controller.signal,
                });
                setServerLog(response.data.users);
              } catch (error) {
                if (error.name === "CanceledError") {
                  console.log("User-Fetch abgebrochen");
                } else {
                  addToast("Fehler beim Laden der Userliste", "danger");
                }
              } finally {
                setLoadingUsers(false);
              }
            };
             fetchServerLog();

   

    return () => {
      controller.abort();
    };
  }, []);

  async function handleServerLogSearch() {
    //TODO: API call
    
  }



 

  return (<>
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
              {!laodingServerLog && serverLog.length > 0 ? (
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
                          <th >logLevel</th>
                          <th>user</th>
                          <th >Titel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serverLog.map((log) => (
                          <tr key={log.id} onClick={() => {
                                setSelectedServerLog(log.id);
                              }}>
                            <td
                              style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              
                            >
                              {log.id}
                            </td>
                            <td></td>
                            <td className="text-center">{log.logLevel}</td>
                            <td className="text-center">{log.user}</td>
                            <td className="text-center">{log.title}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th >logLevel</th>
                      <th>User</th>
                      <th>Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="placeholder-glow">
                        <td>
                          <span className="placeholder col-6"></span>
                        </td>
                        <td className="d-none d-sm-table-cell">
                          <span className="placeholder col-8"></span>
                        </td>
                        <td className="text-center">
                          <span className="placeholder col-3"></span>
                        </td>
                        <td className="text-center">
                          <span className="placeholder col-3"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
            <Tab eventKey="allPermissions" title="Berechtigungsmatrix" className="border p-3 p mb-4" style={{ maxHeight: "calc(100vh - 70px)", overflowY: "auto" }}
            >
              {!laodingRouteGroups && !loadingAllPermissions && routeGroups.length > 0 ? (
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
                          {routeGroups.map((routeGroup)=><th key={routeGroup.id}>{routeGroup.name}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {allPermissions.map((permission) => (
                          <tr key={permission.id} >
                            <td
                              style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              
                            >
                              {permission.name}
                            </td>
                           {permission.map((route,index)=><td key={index}>Nein</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Zugriffsrechte</th>
                      <th>/routeGroup_1</th>
                      <th>/routeGroup_2</th>
                      <th>/routeGroup_3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="placeholder-glow">
                        <td>
                          <span className="placeholder col-6"></span>
                        </td>
                        <td className="d-none d-sm-table-cell">
                          <span className="placeholder col-8"></span>
                        </td>
                        <td className="text-center">
                          <span className="placeholder col-3"></span>
                        </td>
                        <td className="text-center">
                          <span className="placeholder col-3"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </div>
      </Container>
  </>);
}

export default AdminPage;
