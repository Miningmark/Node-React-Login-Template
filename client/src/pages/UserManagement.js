import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { useToast } from "../components/ToastContext";
import useAxiosProtected from "../hook/useAxiosProtected";
import { useNavigate } from "react-router-dom";
import { convertToLocalTime } from "../util/timeConverting";
import { AuthContext } from "../contexts/AuthContext";
import {
  Table,
  InputGroup,
  FormControl,
  Tabs,
  Tab,
  Container,
  Modal,
  Button,
} from "react-bootstrap";
import sortingAlgorithm from "../util/sortingAlgorithm";

const UserDetailsModal = ({ show, handleClose, user, updateUser, allPermissions }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [touched, setTouched] = useState({ email: false });
  const [isSaving, setIsSaving] = useState(false);

  const { routeGroups } = useContext(AuthContext);
  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  console.log("UserDetailsModal", user);
  console.log("editedUser", editedUser);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleCheckboxChange = (permission) => {
    setEditedUser((prev) => {
      const alreadyIncluded = prev.permissions.some((p) => p.name === permission.name);

      return {
        ...prev,
        permissions: alreadyIncluded
          ? prev.permissions.filter((p) => p.name !== permission.name)
          : [...prev.permissions, permission],
      };
    });
  };

  const getChangedFields = (original, edited) => {
    const changed = {};

    if (original.username !== edited.username) changed.username = edited.username;
    if (original.email !== edited.email) changed.email = edited.email;
    if (original.isActive !== edited.isActive) changed.isActive = edited.isActive;
    if (original.isDisabled !== edited.isDisabled) changed.isDisabled = edited.isDisabled;

    return changed;
  };

  const havePermissionsChanged = () => {
    const originalIds = user.permissions.map((p) => p.id).sort();
    const editedIds = editedUser.permissions.map((p) => p.id).sort();
    return JSON.stringify(originalIds) !== JSON.stringify(editedIds);
  };

  async function handleSave() {
    setIsSaving(true);

    const changedFields = getChangedFields(user, editedUser);
    const permissionsChanged = havePermissionsChanged();
    const newPermissions = editedUser.permissions.map((perm) => perm.id);

    try {
      const payload = {
        id: editedUser.id,
        ...(Object.keys(changedFields).length > 0 ? changedFields : {}),
        ...(permissionsChanged ? { permissionIds: newPermissions } : {}),
      };

      if (Object.keys(payload).length > 1) {
        await axiosProtected.post("/userManagement/updateUser", payload);
      }

      addToast("User erfolgreich Bearbeitet", "success");
      updateUser(editedUser);
      setEditMode(false);
    } catch (error) {
      addToast(error.response?.data?.message || "Änderung fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  }

  const closeModal = () => {
    setEditMode(false);
    setEditedUser(null);
    handleClose();
  };

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Bearbeitungsmodus" : user?.username || "User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editMode ? (
          <>
            <div className="form-floating mb-3">
              <input
                type="text"
                className={`form-control ${touched.username ? "is-valid" : ""}`}
                id="floatingUsername"
                placeholder="Username"
                value={editedUser.username}
                onChange={handleChange}
                onBlur={() => setTouched({ ...touched, username: true })}
                name="username"
              />
              <label htmlFor="floatingUsername">Username</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className={`form-control ${touched.email ? "is-valid" : ""}`}
                id="floatingEmail"
                placeholder="E-Mail"
                value={editedUser.email}
                onChange={handleChange}
                onBlur={() => setTouched({ ...touched, email: true })}
                name="email"
              />
              <label htmlFor="floatingEmail">E-Mail</label>
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="activeCheckbox"
                checked={editedUser.isActive}
                onChange={() => setEditedUser({ ...editedUser, isActive: !editedUser.isActive })}
              />
              <label className="form-check-label" htmlFor="activeCheckbox">
                Aktiv
              </label>
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="blockedCheckbox"
                checked={editedUser.isDisabled}
                onChange={() =>
                  setEditedUser({ ...editedUser, isDisabled: !editedUser.isDisabled })
                }
              />
              <label className="form-check-label" htmlFor="blockedCheckbox">
                Gesperrt
              </label>
            </div>

            <p>
              <strong>Berechtigungen:</strong>
            </p>

            {allPermissions.map((perm) => (
              <div key={perm.id} className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`perm-${perm.id}`}
                  checked={editedUser.permissions.some((p) => p.name === perm.name)}
                  onChange={() => handleCheckboxChange(perm)}
                />
                <label className="form-check-label" htmlFor={`perm-${perm.id}`}>
                  {perm.name}
                </label>
              </div>
            ))}
          </>
        ) : (
          <>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Berechtigungen:</strong>
            </p>
            <ul>
              {user?.permissions?.length > 0 ? (
                user.permissions.map((permission, index) => <li key={index}>{permission.name}</li>)
              ) : (
                <li>Keine Berechtigungen</li>
              )}
            </ul>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {editMode ? (
          <>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={isSaving}
              style={{ width: "100px" }}
            >
              {isSaving ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Speichern"
              )}
            </Button>
            <Button variant="secondary" onClick={() => setEditMode(false)} disabled={isSaving}>
              Abbrechen
            </Button>
          </>
        ) : (
          <>
            {routeGroups.includes("userManagementWrite") && (
              <Button variant="primary" onClick={() => setEditMode(true)}>
                Bearbeitungsmodus
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose}>
              Schließen
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const UserManagement = () => {
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  console.log("USERS", users);
  console.log("Selected User", selectedUser);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { routeGroups } = useContext(AuthContext);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const response = await axiosProtected.get("/userManagement/getUsers", {
          signal: controller.signal,
        });
        console.log("User-Fetch erfolgreich", response.data.users);
        setUsers(response.data.users);
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

    const fetchAllPermissions = async () => {
      try {
        const response = await axiosProtected.get("/userManagement/getAllPermissions", {
          signal: controller.signal,
        });
        console.log("Permissions-Fetch erfolgreich", response.data.permissions);
        setAllPermissions(response.data.permissions);
      } catch (error) {
        if (error.name === "CanceledError") {
          console.log("Permissions-Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der Berechtigungen", "danger");
        }
      }
    };

    fetchUsers();

    if (routeGroups?.includes("userManagementWrite")) {
      fetchAllPermissions();
    }

    return () => {
      controller.abort();
    };
  }, []);

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

  const handleUpdateUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  return (
    <>
      <Container className="mt-4">
        <h2>User-Management</h2>
        <Tabs defaultActiveKey="user" id="user-management-tabs">
          <Tab eventKey="user" title="User">
            {!loadingUsers && users.length > 0 ? (
              <>
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
                      <th className="d-none d-sm-table-cell" onClick={() => handleSort("email")}>
                        Email 🔽
                      </th>
                      <th onClick={() => handleSort("isActive")}>Active 🔽</th>
                      <th onClick={() => handleSort("isDisabled")}>Blocked 🔽</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td
                          style={{
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          onClick={() => {
                            handleUserClick(user.id);
                          }}
                        >
                          {user.username}
                        </td>
                        <td className="d-none d-sm-table-cell">{user.email}</td>
                        <td className="text-center">{user.isActive ? "✅" : "❌"}</td>
                        <td className="text-center">{user.isDisabled ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th className="d-none d-sm-table-cell">Email</th>
                    <th>Active</th>
                    <th>Blocked</th>
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
          <Tab eventKey="roles" title="Roles">
            <p>Hier können Rollen verwaltet werden.</p>
          </Tab>
          <Tab eventKey="test" title="Test">
            <p>Testbereich für Entwickler.</p>
          </Tab>
        </Tabs>
      </Container>

      {selectedUser ? (
        <UserDetailsModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          user={users.find((user) => selectedUser === user.id)}
          updateUser={handleUpdateUser}
          allPermissions={allPermissions}
        />
      ) : null}
    </>
  );
};

export default UserManagement;
