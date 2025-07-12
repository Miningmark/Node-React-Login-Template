import { useState, useEffect, useContext, useMemo, use } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { Table, InputGroup, FormControl, Tabs, Tab, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import UserDetailsModal from "components/userManagement/UserDetailsModal";
import CreateUserModal from "components/userManagement/CreateUserModal";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { SocketContext } from "contexts/SocketProvider";

import "components/userManagement/userManagement.css";

const UserManagement = () => {
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUser, setCreateUser] = useState(false);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { routeGroups, checkAccess } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    socket.emit("subscribe:users:watchList");

    const handleUserAdd = (data) => {
      console.log("New user added:", data);
      //setUsers((prevUsers) => [...prevUsers, data]);
    };

    const handleUserUpdate = (updatedUser) => {
      const oldUser = users.find((user) => user.id === updatedUser.id);
      if (!oldUser) {
        console.warn("User not found for update:", updatedUser);
        return;
      }
      const newUser = { ...oldUser, ...updatedUser };
      console.log("Updating user:", newUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === updatedUser.id ? newUser : user))
      );
    };

    socket.on("listen:users:watchList", handleUserAdd);
    socket.on("users:create", handleUserAdd);
    socket.on("users:update", handleUserUpdate);

    return () => {
      socket.off("listen:users:watchList", handleUserAdd);
      socket.off("users:create", handleUserAdd);
      socket.off("users:update", handleUserUpdate);
    };
  }, [socket]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const response = await axiosProtected.get("/userManagement/getUsers", {
          signal: controller.signal,
        });
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
        const response = await axiosProtected.get("/userManagement/getPermissions", {
          signal: controller.signal,
        });
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

  const handleNewUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  return (
    <>
      <Container className="page-wrapper mt-4">
        <h2>User-Management</h2>
        <div>
          <Tabs defaultActiveKey="user" id="user-management-tabs">
            <Tab
              eventKey="user"
              title="Benutzer"
              className="tab-contend border p-3 mb-4"
              style={{ maxHeight: "calc(100vh - 70px)", overflowY: "auto" }}
            >
              {!loadingUsers && users?.length > 0 ? (
                <>
                  <div className="d-flex gap-2 mb-3">
                    <InputGroup className="flex-grow-1">
                      <FormControl
                        placeholder="Suche Benutzer oder Email"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    {checkAccess(["userManagementCreate"]) && (
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          setShowCreateModal(true);
                          setCreateUser(true);
                        }}
                      >
                        Neuer Benutzer
                      </button>
                    )}
                  </div>

                  <div
                    className="table-wrapper border"
                    style={{ maxHeight: "calc(100vh - 185px)", overflowY: "auto" }}
                  >
                    <Table striped bordered hover className="mb-0">
                      <thead className="border" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th onClick={() => handleSort("username")}>Username 🔽</th>
                          <th
                            className="d-none d-sm-table-cell"
                            onClick={() => handleSort("email")}
                          >
                            Email 🔽
                          </th>
                          <th onClick={() => handleSort("isActive")}>Active 🔽</th>
                          <th onClick={() => handleSort("isDisabled")}>Blocked 🔽</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers
                          .filter((user) => user.username !== "SuperAdmin")
                          .map((user) => (
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
                  </div>
                </>
              ) : (
                <TableLoadingAnimation />
              )}
            </Tab>
            <Tab
              eventKey="allPermissions"
              title="Alle Rechte"
              className="tab-contend border p-3 p mb-4"
            >
              <h2>Alle Berechtigungen</h2>
              {!loadingUsers && allPermissions?.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Beschreibung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPermissions
                      .filter((permission) => permission.name !== "SuperAdmin Berechtigung")
                      .map((permission) => (
                        <tr key={permission.id}>
                          <td>{permission.name}</td>
                          <td>{permission.description}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <TableLoadingAnimation />
              )}
            </Tab>
          </Tabs>
        </div>
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

      {createUser ? (
        <CreateUserModal
          show={showCreateModal}
          handleClose={() => {
            setShowCreateModal(false);
            setCreateUser(false);
          }}
          allPermissions={allPermissions}
          onUserCreated={handleNewUser}
        />
      ) : null}
    </>
  );
};

export default UserManagement;
