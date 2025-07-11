import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";

const ServerLogFilterOptionsModal = ({
  filterOptions,
  handleFilterOptions,
  handleClose,
  show,
  activeFilters,
}) => {
  const [formData, setFormData] = useState(
    activeFilters || {
      types: [],
      userIds: [],
      createdAtFrom: "",
      createdAtTo: "",
      ipv4Address: "",
      searchString: "",
    }
  );

  console.log("filterOptions", filterOptions);

  function handleChange(e) {
    const { name, options, type } = e.target;

    if (type === "select-multiple") {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    }
  }

  function handleSearch() {
    console.log("formData", formData);

    handleFilterOptions(formData);
    handleClose();
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Filter/Such Optionen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Log Level</Form.Label>
              <Form.Select multiple name="types" value={formData.types} onChange={handleChange}>
                <option value="">Bitte wählen...</option>
                {filterOptions.types.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Select multiple name="userIds" value={formData.userIds} onChange={handleChange}>
                <option value="">Bitte wählen...</option>
                {filterOptions.users.map((user, index) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Von Timestamp</Form.Label>
              <Form.Control
                type="datetime-local"
                name="createdAtFrom"
                value={formData.createdAtFrom}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bis Timestamp</Form.Label>
              <Form.Control
                type="datetime-local"
                name="createdAtTo"
                value={formData.createdAtTo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>IPv4 Adresse</Form.Label>
              <Form.Control
                type="text"
                placeholder="z. B. 192.168.0.1"
                name="ipv4Address"
                value={formData.ipv4Address}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Logtext</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nachricht enthält..."
                name="searchString"
                value={formData.searchString}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSearch}>
            Suchen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ServerLogFilterOptionsModal;
