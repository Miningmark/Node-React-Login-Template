import { useState, useRef, useEffect, useContext,useMemo } from "react";
import { useToast } from "../components/ToastContext";
import useAxiosProtected from "../hook/useAxiosProtected";
import { useNavigate } from "react-router-dom";
import { convertToLocalTime } from "../util/timeConverting";
import { AuthContext } from "../contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container,Modal, Button  } from "react-bootstrap";
import sortingAlgorithm from "../util/sortingAlgorithm";


const defaultUsers = [
    { id: 1, username: "MaxMustermann", email: "max@example.com", active: true, blocked: false, permissions: ["admin", "user"] },
    { id: 2, username: "ErikaMustermann", email: "erika@example.com", active: true, blocked: false, permissions: ["user"] },
    { id: 3, username: "TechGuru", email: "techguru@example.com", active: false, blocked: true, permissions: ["test"] },
    { id: 4, username: "CodeMaster", email: "code@example.com", active: true, blocked: false, permissions: ["admin", "user"] },
    { id: 5, username: "JohnDoe", email: "john@example.com", active: false, blocked: true, permissions: ["test"] },
    { id: 6, username: "JaneDoe", email: "jane@example.com", active: true, blocked: false, permissions: ["user"] },
    { id: 7, username: "SuperAdmin", email: "admin@example.com", active: true, blocked: false, permissions: ["admin"] },
    { id: 8, username: "User123", email: "user123@example.com", active: false, blocked: true, permissions: ["test"] },
    { id: 9, username: "HappyCoder", email: "happycoder@example.com", active: true, blocked: false, permissions: ["user"] },
    { id: 10, username: "ReactFan", email: "reactfan@example.com", active: true, blocked: false, permission: ["user"] },
    { id: 11, username: "BootstrapUser", email: "bootstrap@example.com", active: true, blocked: false, permissions: ["admin", "user"] },
    { id: 12, username: "DebugMaster", email: "debug@example.com", active: false, blocked: true, permissions: ["test"] },
    { id: 13, username: "Fixer", email: "fixer@example.com", active: true, blocked: false, permissions: ["user"] },
    { id: 14, username: "CSSWizard", email: "css@example.com", active: false, blocked: true, permissions: ["test"] },
    { id: 15, username: "JSNinja", email: "jsninja@example.com", active: true, blocked: false, permission: ["admin", "user"] },
    { id: 16, username: "BackendBoss", email: "backend@example.com", active: false, blocked: true, permissions: ["test"] },
    { id: 17, username: "FrontendFan", email: "frontend@example.com", active: true, blocked: false, permissions: ["user"] },
    { id: 18, username: "DatabaseDude", email: "database@example.com", active: true, blocked: false, permissions: ["admin"] },
    { id: 19, username: "SecurityExpert", email: "security@example.com", active: true, blocked: false, permissions: ["admin", "user"] },
    { id: 20, username: "TestUser", email: "test@example.com", active: false, blocked: true, permissions: ["test"] },
];

const allPermissions = ["admin", "user","tester","kanban","finanzen"];

const UserDetailsModal = ({ show, handleClose, user, updateUser }) => {
    const [editMode, setEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState(user);

    if (!user) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({ ...editedUser, [name]: value });
    };

    const handleCheckboxChange = (permission) => {
        setEditedUser((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter((p) => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleSave = () => {
        updateUser(editedUser);
        setEditMode(false);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{editMode ? "Bearbeitungsmodus" : user?.username || "User"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editMode ? (
                    <>
                        <InputGroup className="mb-2">
                            <FormControl
                                name="username"
                                value={editedUser.username}
                                onChange={handleChange}
                            />
                        </InputGroup>
                        <InputGroup className="mb-2">
                            <FormControl
                                name="email"
                                type="email"
                                value={editedUser.email}
                                onChange={handleChange}
                            />
                        </InputGroup>
                        <p><strong>Permissions:</strong></p>
                        {allPermissions.map((perm) => (
                            <div key={perm} className="mb-2">
                                <input
                                    type="checkbox"
                                    checked={editedUser.permissions.includes(perm)}
                                    onChange={() => handleCheckboxChange(perm)}
                                />
                                <label className="ms-2">{perm}</label>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Permissions:</strong></p>
                        <ul>
                            {user?.permissions?.length > 0 ? (
                                user.permissions.map((permission, index) => <li key={index}>{permission}</li>)
                            ) : (
                                <li>Keine Berechtigungen</li>
                            )}
                        </ul>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {editMode ? (
                    <Button variant="success" onClick={handleSave}>Speichern</Button>
                ) : (
                    <Button variant="primary" onClick={() => setEditMode(true)}>Bearbeitungsmodus</Button>
                )}
                <Button variant="secondary" onClick={handleClose}>Schließen</Button>
            </Modal.Footer>
        </Modal>
    );
};



  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{user?.username || "User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Active:</strong> {user?.active ? "✔️ Ja" : "❌ Nein"}</p>
        <p><strong>Blocked:</strong> {user?.blocked ? "✔️ Ja" : "❌ Nein"}</p>
        <p><strong>Permissions</strong></p>
        <ul>
            {user?.permissions?.length > 0 ? (
                user.permissions.map((permission, index) => <li key={index}>{permission}</li>)
            ) : (
                <li>Keine Berechtigungen</li>
            )}
        </ul>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Schließen</Button>
      </Modal.Footer>
    </Modal>
  );
};




const UserManagement =()=>{
    const [users,setUsers] = useState(defaultUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortColumn, setSortColumn] = useState("username");
    const [sortOrder, setSortOrder] = useState("asc");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const filteredUsers = useMemo(() => {
    if (!users) return [];

    const searchLower = searchTerm.toLowerCase();

    const filtered = searchTerm
      ? users.filter((item) =>
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
      : users;

    return sortingAlgorithm(filtered, sortColumn, sortOrder);
  }, [users, searchTerm, sortColumn, sortOrder]);

  function handleSort(columnId) {
    if (columnId === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortOrder("asc");
    }
  }

  const handleUserClick = (user) => {
  setSelectedUser(user);
  setShowModal(true);
};


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
                                <th className="d-none d-sm-table-cell" onClick={() => handleSort("email")}>Email 🔽</th>
                                <th onClick={() => handleSort("active")}>Active 🔽</th>
                                <th onClick={() => handleSort("blocked")}>Blocked 🔽</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td style={{ cursor: "pointer", fontWeight:"bold" }} onClick={() => handleUserClick(user)}>
                                        {user.username}
                                    </td>
                                    <td className="d-none d-sm-table-cell">{user.email}</td>
                                    <td className="text-center">{user.active ? "✅" : "❌"}</td>
                                    <td className="text-center">{user.blocked ? "✅" : "❌"}</td>
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

        {selectedUser && (
            <UserDetailsModal show={showModal} handleClose={() => setShowModal(false)} user={selectedUser} />
        )}


    </>)
};

export default UserManagement;