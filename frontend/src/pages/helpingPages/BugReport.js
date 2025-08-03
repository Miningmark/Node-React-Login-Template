import React, { useState, useContext, useEffect } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";

function BugReportPage() {
  const [reportetBugs, setReportedBugs] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    async function fetchReportedBugs() {
      setLoading(true);
      try {
      } catch (error) {
        addToast(
          error.response?.data?.message || "Laden von Eingereichten Bug's fehlgeschlagen",
          "danger"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReportedBugs();
  }, []);

  return (
    <div className="container mt-5 mb-5">
      <h1>Bug Report</h1>

      <h2>Kommt bald</h2>
    </div>
  );
}

export default BugReportPage;
