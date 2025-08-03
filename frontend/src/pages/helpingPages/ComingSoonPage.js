import { Card } from "react-bootstrap";

function ComingSoonPage() {
  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex flex-column gap-3">
        <Card>
          <Card.Header>Kommt Bald</Card.Header>
          <Card.Body>
            <ul>
              <li>Viele neue Funktionen</li>
            </ul>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default ComingSoonPage;
