import { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { AuthContext } from "contexts/AuthContext";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";

const UserDetailsModal = ({ show, handleClose, user, allPermissions }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [touched, setTouched] = useState({ email: false });
  const [isSaving, setIsSaving] = useState(false);

  const { routeGroups } = useContext(AuthContext);
  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

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

  const handleSave = async () => {
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
      setEditMode(false);
    } catch (error) {
      addToast(error.response?.data?.message || "Änderung fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setEditMode(false);
    setEditedUser(null);
    handleClose();
  };

  async function handleDeleteAvatar() {
    setIsSaving(true);
    try {
      await axiosProtected.post(`/userManagement/deleteAvatar/${user.id}`);
      addToast("Avatar erfolgreich gelöscht", "success");
      setEditedUser((prev) => ({ ...prev, avatar: null }));
    } catch (error) {
      addToast(error.response?.data?.message || "Avatar löschen fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  }

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
            {allPermissions
              .filter((permission) => permission.name !== "SuperAdmin Berechtigung")
              .map((perm) => (
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
            {user.avatar ? (
              <div className="mb-3 d-flex flex-column align-items-start">
                <p>
                  <strong>Avatar</strong>
                </p>
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="rounded-circle"
                  style={{ width: "128px", height: "128px", borderRadius: "50%" }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={handleDeleteAvatar}
                  disabled={isSaving}
                  style={{
                    display: "inline-block",
                    marginTop: "12px",
                    padding: "8px 12px",
                    background: "#007bff",
                    color: "white",
                    borderRadius: "4px",
                  }}
                >
                  {isSaving ? (
                    <span
                      className="spinner-border spinner-border-sm ms-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "Avatar Löschen"
                  )}
                </button>
              </div>
            ) : null}
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

export default UserDetailsModal;
