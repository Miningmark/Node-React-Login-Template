import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";

const CreatePermissionModal = ({
  show,
  handleClose,
  handleNewPermission,
  handleEditPermission,
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

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  const handleSave = async () => {
    if (allPermissions.includes(name)) {
      addToast("Berechtigung mit dem selben Namen existiert bereits!", "danger");
      return;
    }
    setIsSaving(true);
    const routeGroupIds = selectedRouteGroups.map((rg) => rg.id);

    if (permission) {
      try {
        await axiosProtected.post("/adminPage/updatePermission", {
          id: permission.id,
          name: name,
          description: description,
          routeGroupIds: routeGroupIds,
        });
        addToast("Permission erfolgreich aktualisiert", "success");

        handleEditPermission({
          id: permission.id,
          name: name,
          description: description,
          routeGroups: selectedRouteGroups,
        });
        handleClose();
      } catch (error) {
        addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        const response = await axiosProtected.post("/adminPage/createPermission", {
          name: name,
          description: description,
          routeGroupIds: routeGroupIds,
        });
        addToast("Permission erfolgreich erstellt", "success");

        handleNewPermission({
          id: response.data.permissionId,
          name: name,
          description: description,
          routeGroups: selectedRouteGroups,
        });
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

  return (
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
          />
          <label htmlFor="floatingName">Name</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className={`form-control ${touched.description && !description ? "is-invalid" : ""}`}
            id="floatingDescription"
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
            name="description"
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
            />
            <label className="form-check-label" htmlFor={`routeGroup-${routeGroup.id}`}>
              {routeGroup.name}
            </label>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={handleSave}
          disabled={isSaving || !name || !description}
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

export default CreatePermissionModal;
