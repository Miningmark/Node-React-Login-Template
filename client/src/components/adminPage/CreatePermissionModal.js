import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";

const CreatePermissionModal = ({ show, handleClose, handleNewPermissions, allPermissions, allRouteGroups }) => {
  const [name, setName] = useState("");
  const [description,setDescription]=useState("");
  const [routeGroupIds,setRouteGroupIds]=useState([]);
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
     
      const response = await axiosProtected.post("/adminPage/createPermission", {name:name,description:description,routeGroupIds:routeGroupIds});
      addToast("Permission erfolgreich erstellt", "success");
      console.log(response.data);

      //handleNewPermissions();
      //handleClose();
    } catch (error) {
      addToast(error.response?.data?.message || "Erstellung fehlgeschlagen", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setName("");
    setDescription("");
    setRouteGroupIds([]);
    setTouched({});
    handleClose();
  };

    const handleCheckboxChange = (routeGroupId) => {
    setRouteGroupIds((prev) => 
        prev.includes(routeGroupId)
        ? prev.filter((id) => id !== routeGroupId)
        : [...prev, routeGroupId]
    );
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
            className={`form-control ${touched.name && !name ? "is-invalid" : ""}`}
            id="floatingName"
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
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
            onChange={(e)=>setDescription(e.target.value)}
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
              checked={routeGroupIds.some((p) => p === routeGroup.id)}
              onChange={() => handleCheckboxChange(routeGroup.id)}
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
