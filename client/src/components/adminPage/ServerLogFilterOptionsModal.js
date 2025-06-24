import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";

const ServerLogFilterOptionsModal = ({ filterOptions, handleFilterOptions, handleClose, show }) => {
  const [formData, setFormData] = useState({
    logLevel: [],
    user: [],
    fromTimestamp: "",
    toTimestamp: "",
    ipAddress: "",
    messageText: "",
  });

  console.log("filterOptions", filterOptions);

  function handleChange(e) {
    const { name, options, type } = e.target;

    if (type === "select-multiple") {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData(prev => ({ ...prev, [name]: e.target.value }));
    }
  }


  function handleSearch() {
    console.log("formData", formData);
    //handleFilterOptions(formData);
    //handleClose();
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
              <Form.Select
                multiple
                name="logLevel"
                value={formData.logLevel}
                onChange={handleChange}
              >
                 <option value="">Bitte wählen...</option>
                {filterOptions.levels.map((level, index) => (
                  <option key={index} value={level}>
                    {level}
                  </option>
                ))}
              </Form.Select>

            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Select  multiple name="user" value={formData.user} onChange={handleChange}>
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
                name="fromTimestamp"
                value={formData.fromTimestamp}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bis Timestamp</Form.Label>
              <Form.Control
                type="datetime-local"
                name="toTimestamp"
                value={formData.toTimestamp}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>IPv4 Adresse</Form.Label>
              <Form.Control
                type="text"
                placeholder="z. B. 192.168.0.1"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Logtext</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nachricht enthält..."
                name="messageText"
                value={formData.messageText}
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
