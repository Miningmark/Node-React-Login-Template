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
import { ThemeContext } from "contexts/ThemeContext";

import { ReactComponent as UserDefaultIcon } from "assets/icons/account_circle.svg";

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
  const { theme } = useContext(ThemeContext);

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

    async function loadAvatar(userId) {
      const avatarRes = await axiosProtected.get(`/userManagement/getAvatar/${userId}`, {
        responseType: "blob",
      });
      if (avatarRes.status === 200 && avatarRes.data) {
        return URL.createObjectURL(avatarRes.data);
      } else {
        return null;
      }
    }

    const handleUserAdd = (data) => {
      setUsers((prevUsers) => [...prevUsers, data]);
    };

    const handleUserUpdate = async (updatedUser) => {
      const oldUser = users.find((user) => user.id === updatedUser.id);
      if (!oldUser) {
        console.warn("User not found for update");
        return;
      }
      const newUser = { ...oldUser, ...updatedUser };

      if (newUser.avatar === "changed") {
        newUser.avatar = await loadAvatar(newUser.id);
      }

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

    socket.emit("subscribe:userManagement:users:watchList");
    socket.emit("subscribe:userManagement:permissions:watchList");

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

    async function loadAvatar(userId) {
      const avatarRes = await axiosProtected.get(`/userManagement/getAvatar/${userId}`, {
        responseType: "blob",
      });
      if (avatarRes.status === 200 && avatarRes.data) {
        return URL.createObjectURL(avatarRes.data);
      } else {
        return null;
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await axiosProtected.get("/userManagement/getUsers", {
          signal: controller.signal,
        });
        const userdata = response.data.users || [];

        const usersWithAvatars = await Promise.all(
          userdata.map(async (user) => ({
            ...user,
            avatar: await loadAvatar(user.id),
          }))
        );

        setUsers(usersWithAvatars);
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
  }, [addToast, axiosProtected]);

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
                style={{ maxHeight: `calc(100dvh - ${heightOffset + 140}px)`, overflowY: "auto" }}
              >
                <ResizableTable
                  columns={[
                    {
                      title: "Username",
                      id: "username",
                      render: (row, value) => (
                        <div
                          style={{ cursor: "pointer", fontWeight: "bold" }}
                          onClick={() => handleUserClick(row.id)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {row.avatar ? (
                              <img
                                src={row.avatar}
                                alt="Avatar"
                                className="rounded-circle"
                                style={{ width: "32px", height: "32px" }}
                              />
                            ) : (
                              <UserDefaultIcon
                                fill={theme === "light" ? "black" : "var(--bs-body-color)"}
                                width={32}
                                height={32}
                              />
                            )}
                            <span>{value}</span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Email",
                      id: "email",
                      render: (row) => <span>{row.email}</span>,
                    },
                    {
                      title: "Active",
                      id: "isActive",
                      render: (row) => (
                        <span className="text-center">{row.isActive ? "✅" : "❌"}</span>
                      ),
                    },
                    {
                      title: "Blocked",
                      id: "isDisabled",
                      render: (row) => (
                        <span className="text-center">{row.isDisabled ? "✅" : "❌"}</span>
                      ),
                    },
                  ]}
                  rows={filteredUsers.filter((user) => user.username !== "SuperAdmin")}
                  tableHeight={`calc(100dvh - ${heightOffset + 142}px)`}
                  handleSort={handleSort}
                />
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
