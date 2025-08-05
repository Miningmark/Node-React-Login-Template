import { Modal, Button } from "react-bootstrap";

const ShowServerlogEntry = ({ show, handleClose, serverLogEntry }) => {
  if (!serverLogEntry) return null;

  console.log("log entry", serverLogEntry);

  const renderJsonIfPossible = (value) => {
    try {
      const parsed = JSON.parse(value);
      return <pre className=" p-2 rounded border">{JSON.stringify(parsed, null, 2)}</pre>;
    } catch {
      return <pre className=" p-2 rounded border">{value}</pre>;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Serverlog-Eintrag Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>ID:</strong> {serverLogEntry.id}
        </p>
        <p>
          <strong>Timestamp:</strong> {new Date(serverLogEntry.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Level:</strong> {serverLogEntry.type}
        </p>
        <p>
          <strong>User:</strong> {serverLogEntry.userId || "—"}
        </p>
        <p>
          <strong>Source:</strong> {serverLogEntry.source}
        </p>
        <p>
          <strong>Message:</strong> {serverLogEntry.message}
        </p>
        <p>
          <strong>Method:</strong> {serverLogEntry.method || "—"}
        </p>
        <p>
          <strong>URL:</strong> {serverLogEntry.url || "—"}
        </p>
        <p>
          <strong>Status:</strong> {serverLogEntry.status ?? "—"}
        </p>
        <p>
          <strong>IPv4 Address:</strong> {serverLogEntry.ipv4Address || "—"}
        </p>
        <p>
          <strong>User Agent:</strong> {serverLogEntry.userAgent || "—"}
        </p>

        {serverLogEntry.requestHeaders && (
          <>
            <p>
              <strong>Request Headers:</strong>
            </p>
            {renderJsonIfPossible(serverLogEntry.requestHeaders)}
          </>
        )}

        {serverLogEntry.requestBody && (
          <>
            <p>
              <strong>Request Body:</strong>
            </p>
            {renderJsonIfPossible(serverLogEntry.requestBody)}
          </>
        )}

        {serverLogEntry.response && (
          <>
            <p>
              <strong>Response:</strong>
            </p>
            {renderJsonIfPossible(serverLogEntry.response)}
          </>
        )}

        {serverLogEntry.errorStack && (
          <>
            <p>
              <strong>Error Stack:</strong>
            </p>
            {renderJsonIfPossible(serverLogEntry.errorStack)}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Schließen
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShowServerlogEntry;
