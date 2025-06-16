import { useState, useRef, useEffect, useContext,useMemo } from "react";
import { useToast } from "../components/ToastContext";
import useAxiosProtected from "../hook/useAxiosProtected";
import { useNavigate } from "react-router-dom";
import { convertToLocalTime } from "../util/timeConverting";
import { AuthContext } from "../contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container } from "react-bootstrap";
import sortingAlgorithm from "../util/sortingAlgorithm";


const defaultUsers = [
    { id: 1, username: "MaxMustermann", email: "max@example.com", active: true, blocked: false },
    { id: 2, username: "ErikaMustermann", email: "erika@example.com", active: true, blocked: false },
    { id: 3, username: "TechGuru", email: "techguru@example.com", active: false, blocked: true },
    { id: 4, username: "CodeMaster", email: "code@example.com", active: true, blocked: false },
    { id: 5, username: "JohnDoe", email: "john@example.com", active: false, blocked: true },
    { id: 6, username: "JaneDoe", email: "jane@example.com", active: true, blocked: false },
    { id: 7, username: "SuperAdmin", email: "admin@example.com", active: true, blocked: false },
    { id: 8, username: "User123", email: "user123@example.com", active: false, blocked: true },
    { id: 9, username: "HappyCoder", email: "happycoder@example.com", active: true, blocked: false },
    { id: 10, username: "ReactFan", email: "reactfan@example.com", active: true, blocked: false },
    { id: 11, username: "BootstrapUser", email: "bootstrap@example.com", active: true, blocked: false },
    { id: 12, username: "DebugMaster", email: "debug@example.com", active: false, blocked: true },
    { id: 13, username: "Fixer", email: "fixer@example.com", active: true, blocked: false },
    { id: 14, username: "CSSWizard", email: "css@example.com", active: false, blocked: true },
    { id: 15, username: "JSNinja", email: "jsninja@example.com", active: true, blocked: false },
    { id: 16, username: "BackendBoss", email: "backend@example.com", active: false, blocked: true },
    { id: 17, username: "FrontendFan", email: "frontend@example.com", active: true, blocked: false },
    { id: 18, username: "DatabaseDude", email: "database@example.com", active: true, blocked: false },
    { id: 19, username: "SecurityExpert", email: "security@example.com", active: true, blocked: false },
    { id: 20, username: "TestUser", email: "test@example.com", active: false, blocked: true },
];



const UserManagement =()=>{
    const [users,setUsers] = useState(defaultUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");

    /* 
     // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users
    const sortUsers = (column) => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);
        setSortColumn(column);

        filteredUsers.sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });
    };
    */

    const filteredUsers = useMemo(() => {
    if (!users) return [];

    const searchLower = search.toLowerCase();

    const filtered = search
      ? users.filter((item) =>
          Object.values(item).some((value) => {
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchLower);
            }
            if (typeof value === "number") {
              return value.toString().includes(search);
            }

            return false;
          })
        )
      : users;

    return sortingAlgorithm(filtered, sortColumn, sortOrder);
  }, [users, searchTerm, sortColumn, sortOrder]);

  function handleSort(columnId) {
    if (columnId === sortColumn) {
      setSortOrder(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortOrder("asc");
    }
  }

    return(
    <>
        <Container className="mt-4">
            <h2>User-Management</h2>
            <Tabs defaultActiveKey="user" id="user-management-tabs">
                <Tab eventKey="user" title="User">
                    <InputGroup className="mb-3">
                        <FormControl
                            placeholder="Suche nach Username oder Email"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("username")}>Username 🔽</th>
                                <th onClick={() => handleSort("email")}>Email 🔽</th>
                                <th onClick={() => handleSort("active")}>Active 🔽</th>
                                <th onClick={() => handleSort("blocked")}>Blocked 🔽</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.active ? "✔️" : "❌"}</td>
                                    <td>{user.blocked ? "✔️" : "❌"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Tab>
                <Tab eventKey="roles" title="Roles">
                    <p>Hier können Rollen verwaltet werden.</p>
                </Tab>
                <Tab eventKey="test" title="Test">
                    <p>Testbereich für Entwickler.</p>
                </Tab>
            </Tabs>
        </Container>

    </>)
};

export default UserManagement;