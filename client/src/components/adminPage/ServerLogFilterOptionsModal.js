import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";


const ServerLogFilterOptionsModal = ({filterOptions, handleFilterOptions,handleClose,show})=>{
    const [formData, setFormData] = useState({
        logLevel: "",
        user: "",
        fromTimestamp: "",
        toTimestamp: "",
        ipAddress: "",
        messageText: ""
    });

    console.log("filterOptions",filterOptions)

function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleSearch() {
        handleFilterOptions(formData);
        handleClose();
    }


    return(
        <>
             <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Filter/Such Optionen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Log Level</Form.Label>
                        <Form.Select name="logLevel" value={formData.logLevel} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            <option value="INFO">INFO</option>
                            <option value="WARN">WARN</option>
                            <option value="ERROR">ERROR</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>User</Form.Label>
                        <Form.Select name="user" value={formData.user} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            <option value="admin">admin</option>
                            <option value="user1">user1</option>
                            <option value="user2">user2</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Von Timestamp</Form.Label>
                        <Form.Control type="datetime-local" name="fromTimestamp" value={formData.fromTimestamp} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Bis Timestamp</Form.Label>
                        <Form.Control type="datetime-local" name="toTimestamp" value={formData.toTimestamp} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>IPv4 Adresse</Form.Label>
                        <Form.Control type="text" placeholder="z. B. 192.168.0.1" name="ipAddress" value={formData.ipAddress} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Nachrichtentext</Form.Label>
                        <Form.Control type="text" placeholder="Nachricht enthält..." name="messageText" value={formData.messageText} onChange={handleChange} />
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