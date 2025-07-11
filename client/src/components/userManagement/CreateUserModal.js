import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";

const CreateUserModal = ({ show, handleClose, allPermissions, onUserCreated }) => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    isActive: false,
    isDisabled: false,
    permissions: [],
  });
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (permission) => {
    setNewUser((prev) => {
      const alreadyIncluded = prev.permissions.some((p) => p.name === permission.name);
      return {
        ...prev,
        permissions: alreadyIncluded
          ? prev.permissions.filter((p) => p.name !== permission.name)
          : [...prev.permissions, permission],
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        username: newUser.username,
        email: newUser.email,
        isActive: newUser.isActive,
        isDisabled: newUser.isDisabled,
        permissionIds: newUser.permissions.map((p) => p.id),
      };

      const response = await axiosProtected.post("/userManagement/createUser", payload);
      addToast("User erfolgreich erstellt", "success");

      if (onUserCreated)
        onUserCreated({ ...payload, id: response.data.userId, permissions: newUser.permissions });
      handleClose();
    } catch (error) {
      addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setNewUser({
      username: "",
      email: "",
      isActive: true,
      isDisabled: false,
      permissions: [],
    });
    setTouched({});
    handleClose();
  };

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Neuen User erstellen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-floating mb-3">
          <input
            type="text"
            className={`form-control ${touched.username && !newUser.username ? "is-invalid" : ""}`}
            id="floatingUsername"
            placeholder="Username"
            value={newUser.username}
            onChange={handleChange}
            onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
            name="username"
          />
          <label htmlFor="floatingUsername">Username</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="email"
            className={`form-control ${touched.email && !newUser.email ? "is-invalid" : ""}`}
            id="floatingEmail"
            placeholder="E-Mail"
            value={newUser.email}
            onChange={handleChange}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            name="email"
          />
          <label htmlFor="floatingEmail">E-Mail</label>
        </div>
        <p>
          <strong>Berechtigungen:</strong>
        </p>
        {allPermissions.length < 2 ? <p>Noch keine berechtigungen erstellt.</p> : null}
        {allPermissions
          .filter((permission) => permission.name !== "SuperAdmin Berechtigung")
          .map((perm) => (
            <div key={perm.id} className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id={`perm-${perm.id}`}
                checked={newUser.permissions.some((p) => p.name === perm.name)}
                onChange={() => handleCheckboxChange(perm)}
              />
              <label className="form-check-label" htmlFor={`perm-${perm.id}`}>
                {perm.name}
              </label>
            </div>
          ))}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={handleSave}
          disabled={isSaving || !newUser.username || !newUser.email}
          style={{ width: "100px" }}
        >
          {isSaving ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            "Erstellen"
          )}
        </Button>
        <Button variant="secondary" onClick={closeModal} disabled={isSaving}>
          Abbrechen
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUserModal;
