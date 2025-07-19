import { useState, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import ConfirmModal from "components/util/ConfirmModal";
import { AuthContext } from "contexts/AuthContext";

const CreatePermissionModal = ({
  show,
  handleClose,
  allPermissions,
  allRouteGroups,
  permission,
}) => {
  const [name, setName] = useState(permission ? permission.name : "");
  const [description, setDescription] = useState(permission ? permission.description : "");
  const [selectedRouteGroups, setSelectedRouteGroups] = useState(
    permission ? permission.routeGroups : []
  );
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(!permission);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);

  const handleSave = async () => {
    if (allPermissions.includes(name)) {
      addToast("Berechtigung mit dem selben Namen existiert bereits!", "danger");
      return;
    }
    setIsSaving(true);
    const routeGroupIds = selectedRouteGroups.map((rg) => rg.id);

    if (permission) {
      const changedData = { id: permission.id };

      if (name !== permission.name) {
        changedData.name = name;
      }
      if (description !== permission.description) {
        changedData.description = description;
      }

      // Vergleiche routeGroups (IDs vergleichen)
      const originalRouteGroupIds = permission.routeGroups.map((rg) => rg.id).sort();
      const currentRouteGroupIds = selectedRouteGroups.map((rg) => rg.id).sort();

      const areRouteGroupsChanged =
        JSON.stringify(originalRouteGroupIds) !== JSON.stringify(currentRouteGroupIds);

      if (areRouteGroupsChanged) {
        changedData.routeGroupIds = currentRouteGroupIds;
      }
      if (Object.keys(changedData).length === 1) {
        // Nur `id` ist enthalten
        addToast("Keine Änderungen vorgenommen", "info");
        setIsSaving(false);
        return;
      }
      try {
        await axiosProtected.post("/adminPage/updatePermission", changedData);
        addToast("Permission erfolgreich aktualisiert", "success");

        handleClose();
      } catch (error) {
        addToast(error.response?.data?.message || "Bearbeitung fehlgeschlagen", "danger");
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        await axiosProtected.post("/adminPage/createPermission", {
          name: name,
          description: description,
          routeGroupIds: routeGroupIds,
        });
        addToast("Permission erfolgreich erstellt", "success");

        handleClose();
      } catch (error) {
        addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const closeModal = () => {
    setName("");
    setDescription("");
    setSelectedRouteGroups([]);
    setTouched({});
    handleClose();
  };

  const handleCheckboxChange = (routeGroup) => {
    setSelectedRouteGroups((prev) =>
      prev.some((p) => p.id === routeGroup.id)
        ? prev.filter((p) => p.id !== routeGroup.id)
        : [...prev, routeGroup]
    );
  };

  const handleDelete = async () => {
    if (!permission) return;

    setIsSaving(true);
    try {
      await axiosProtected.post("/adminPage/deletePermission", { id: permission.id });
      addToast("Berechtigung erfolgreich gelöscht", "success");
      handleClose();
    } catch (error) {
      addToast(error.response?.data?.message || "Löschen fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {permission ? "Berechtigung Bearbeiten" : "Neue Berechtigung erstellen"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${touched.name && !name ? "is-invalid" : ""}`}
              id="floatingName"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              name="name"
              disabled={!isEditing}
            />
            <label htmlFor="floatingName">Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control `}
              id="floatingDescription"
              placeholder="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
              name="description"
              disabled={!isEditing}
            />
            <label htmlFor="floatingDescription">Beschreibung</label>
          </div>

          <p>
            <strong>Berechtigungen:</strong>
          </p>
          {allRouteGroups.map((routeGroup) => (
            <div key={routeGroup.id} className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id={`routeGroup-${routeGroup.id}`}
                checked={selectedRouteGroups.some((p) => p.id === routeGroup.id)}
                onChange={() => handleCheckboxChange(routeGroup)}
                disabled={!isEditing}
              />
              <label className="form-check-label" htmlFor={`routeGroup-${routeGroup.id}`}>
                {routeGroup.name}
              </label>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          {permission && checkAccess(["adminPagePermissionsWrite"]) && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={isSaving}>
              Löschen
            </Button>
          )}

          {checkAccess(["adminPagePermissionsWrite"]) && !isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Bearbeiten
            </Button>
          )}

          {checkAccess(["adminPagePermissionsWrite"]) && isEditing && (
            <Button
              variant="success"
              onClick={handleSave}
              disabled={isSaving || !name}
              style={{ width: "100px" }}
            >
              {isSaving ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                <span>Speichern</span>
              )}
            </Button>
          )}

          <Button variant="secondary" onClick={closeModal} disabled={isSaving}>
            Abbrechen
          </Button>
        </Modal.Footer>
      </Modal>

      {confirmDelete && (
        <ConfirmModal
          show={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          name={permission ? permission.name : ""}
          onResult={(result) => {
            if (result) handleDelete();
            setConfirmDelete(false);
          }}
        />
      )}
    </>
  );
};

export default CreatePermissionModal;
