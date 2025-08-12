import React, { useState, useContext, useEffect } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { Container } from "react-bootstrap";
import { Card } from "react-bootstrap";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { convertToLocalTimeStamp } from "util/timeConverting";
import ResizableTable from "components/util/ResizableTable";
import { SocketContext } from "contexts/SocketProvider";
import { AuthContext } from "contexts/AuthContext";
import DOMPurify from "dompurify";
import CreateBugReport from "components/helpingPages/CreateBugReport";

function BugReportPage() {
  const [reportetBugs, setReportedBugs] = useState([]);
  const [loadingReportetBugs, setLoadingReportetBugs] = useState(false);
  const [showCreateBugModal, setShowCreateBugModal] = useState(false);
  const [showEditBugModal, setShowEditBugModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);

  const [heightOffset, setHeightOffset] = useState(160);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { checkAccess } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const updateOffset = () => {
      setHeightOffset(window.innerWidth > 768 ? 80 : 0);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  useEffect(() => {
    async function fetchReportedBugs() {
      setLoadingReportetBugs(true);
      try {
        //const responseActiveBugs = await axiosProtected.get("/bugReport/getReportedBugs");
        const responseOwnBugs = await axiosProtected.get("/bugReport/getOwnBugReports/500-0");

        //console.log("Active Bugs:", responseActiveBugs.data);
        console.log("My Bugs:", responseOwnBugs.data.bugReports);
        setReportedBugs(responseOwnBugs.data.bugReports);
      } catch (error) {
        addToast(
          error.response?.data?.message || "Laden von Eingereichten Bug's fehlgeschlagen",
          "danger"
        );
      } finally {
        setLoadingReportetBugs(false);
      }
    }

    fetchReportedBugs();
  }, []);

  return (
    <>
      <Container
        className="page-wrapper mt-4"
        style={{ height: `calc(100dvh - ${heightOffset}px)` }}
      >
        <h2>Bug's / Verbesserungen</h2>
        <div>
          {!loadingReportetBugs ? (
            <>
              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    setShowCreateBugModal(true);
                  }}
                >
                  Neuer Bug/Verbesserung
                </button>
              </div>
              <div
                style={{
                  maxHeight: `calc(100dvh - ${heightOffset + 160}px)`,
                  overflowY: "auto",
                  border: "1px solid #dee2e6",
                  padding: "10px",
                  borderRadius: "5px",
                  gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {reportetBugs.map((bug, index) => (
                  <Card key={index}>
                    <Card.Header>{bug.name}</Card.Header>
                    <Card.Body>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(bug.description),
                        }}
                      />
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedBug(bug.id);
                            setShowEditBugModal(true);
                          }}
                        >
                          Bearbeiten
                        </button>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Status: {bug.status}</span>
                        <span className="text-muted">{convertToLocalTimeStamp(bug.createdAt)}</span>
                      </div>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <TableLoadingAnimation />
          )}
        </div>
      </Container>

      {showCreateBugModal && (
        <CreateBugReport
          show={true}
          handleClose={() => setShowCreateBugModal(false)}
          bugReport={null}
        />
      )}

      {showEditBugModal && (
        <CreateBugReport
          show={true}
          handleClose={() => setShowEditBugModal(false)}
          bugReport={reportetBugs.find((bug) => bug.id === selectedBug)}
        />
      )}
    </>
  );
}

export default BugReportPage;
