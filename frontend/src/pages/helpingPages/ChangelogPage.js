import { Card } from "react-bootstrap";
import { changelog } from "util/changelogList";

function ChangelogPage() {
  return (
    <div className="container mt-5 mb-5">
      <h1 className=" pb-3">Changelog</h1>
      <div className="d-flex flex-column gap-3">
        {changelog.map((entry, index) => (
          <Card key={index}>
            <Card.Header>{entry.title}</Card.Header>
            <Card.Body>
              <ul>
                {entry.updates.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mb-0 pb-0">{entry.version}</p>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ChangelogPage;
