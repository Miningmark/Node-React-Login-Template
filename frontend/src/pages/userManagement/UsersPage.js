import { useState, useEffect, useContext, useMemo } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { AuthContext } from "contexts/AuthContext";
import { InputGroup, FormControl, Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import UserDetailsModal from "components/userManagement/UserDetailsModal";
import CreateUserModal from "components/userManagement/CreateUserModal";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { SocketContext } from "contexts/SocketProvider";
import ResizableTable from "components/util/ResizableTable";

import "components/userManagement/userManagement.css";

const UsersPage = () => {
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

  const [heightOffset, setHeightOffset] = useState(160);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const updateOffset = () => {
      setHeightOffset(window.innerWidth > 768 ? 80 : 0);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("subscribe:userManagement:users:watchList");

    const handleUserAdd = (data) => {
      setUsers((prevUsers) => [...prevUsers, data]);
    };

    const handleUserUpdate = (updatedUser) => {
      const oldUser = users.find((user) => user.id === updatedUser.id);
      if (!oldUser) {
        console.warn("User not found for update");
        return;
      }
      const newUser = { ...oldUser, ...updatedUser };
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === updatedUser.id ? newUser : user))
      );
    };

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

    socket.on("userManagement:users:create", handleUserAdd);
    socket.on("userManagement:users:update", handleUserUpdate);

    socket.on("userManagement:permissions:create", handlePermissionCreate);
    socket.on("userManagement:permissions:update", handlePermissionUpdate);
    socket.on("userManagement:permissions:delete", handlePermissionDelete);

    return () => {
      socket.off("userManagement:users:create", handleUserAdd);
      socket.off("userManagement:users:update", handleUserUpdate);

      socket.off("userManagement:permissions:create", handlePermissionCreate);
      socket.off("userManagement:permissions:update", handlePermissionUpdate);
      socket.off("userManagement:permissions:delete", handlePermissionDelete);
    };
  }, [socket, users]);

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
          console.warn("User-Fetch abgebrochen");
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
          console.warn("Permissions-Fetch abgebrochen");
        } else {
          addToast("Fehler beim Laden der Berechtigungen", "danger");
        }
      }
    };

    fetchUsers();
    fetchAllPermissions();

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
      <Container
        className="page-wrapper mt-4"
        style={{ height: `calc(100dvh - ${heightOffset}px)` }}
      >
        <h2>Benutzer Verwaltung</h2>
        <div>
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
                style={{ maxHeight: `calc(100dvh - ${heightOffset + 160}px)`, overflowY: "auto" }}
              >
                <ResizableTable
                  columns={[
                    { title: "Username", id: "username" },
                    { title: "Email", id: "email", width: 150 },
                    { title: "Active", id: "isActive", width: 80 },
                    { title: "Blocked", id: "isDisabled", width: 80 },
                  ]}
                  tableHeight={`calc(100dvh - ${heightOffset + 162}px)`}
                  handleSort={handleSort}
                >
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
                          <td className="">{user.email}</td>
                          <td className="text-center">{user.isActive ? "✅" : "❌"}</td>
                          <td className="text-center">{user.isDisabled ? "✅" : "❌"}</td>
                        </tr>
                      ))}
                  </tbody>
                </ResizableTable>
              </div>
            </>
          ) : (
            <TableLoadingAnimation />
          )}
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
        />
      ) : null}
    </>
  );
};

export default UsersPage;
