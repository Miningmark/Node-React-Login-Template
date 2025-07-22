import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { Container } from "react-bootstrap";
import sortingAlgorithm from "util/sortingAlgorithm";
import ServerLogFilterOptionsModal from "components/adminPage/ServerLogFilterOptionsModal";
import TableLoadingAnimation from "components/TableLoadingAnimation";
import { convertToLocalTimeStamp } from "util/timeConverting";
import ShowServerlogEntry from "components/adminPage/ShowServerlogEntry";
import ResizableTable from "components/util/ResizableTable";
import { SocketContext } from "contexts/SocketProvider";

function clearFilters(filters) {
  const clearedFilters = { ...filters };
  Object.keys(clearedFilters).forEach((key, index) => {
    if (
      clearedFilters[key] === "" ||
      clearedFilters[key] === null ||
      clearedFilters[key] === undefined ||
      clearedFilters[key].length === 0
    ) {
      delete clearedFilters[key];
    } else {
      if (key === "createdAtFrom" || key === "createdAtTo") {
        clearedFilters[key] = new Date(clearedFilters[key]).toISOString();
      }
      if (key === "userIds") {
        clearedFilters[key] = clearedFilters[key].map((id) => Number(id));
      }
    }
  });

  return clearedFilters;
}

function ServerLogPage() {
  const [serverLog, setServerLog] = useState([]);
  const [filteredServerLog, setFilteredServerLog] = useState(null);
  const [loadingServerLog, setLoadingServerLog] = useState(false);
  const [serverlogOffset, setServerlogOffset] = useState(0);
  const [serverLogMaxEntries, setServerLogMaxEntries] = useState(null);
  const [filteredServerlogOffset, setFilteredServerlogOffset] = useState(0);
  const [filteredServerLogMaxEntries, setFilteredServerLogMaxEntries] = useState(null);
  const [loadingServerLogPart, setLoadingServerLogPart] = useState(true);
  const [selectedServerLog, setSelectedServerLog] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [showFilterOptionsModal, setShowFilterOptionsModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [heightOffset, setHeightOffset] = useState(160);

  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();
  const { socket } = useContext(SocketContext);

  const serverLogQueueRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const updateOffset = () => {
      setHeightOffset(window.innerWidth > 768 ? 80 : 0);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  useEffect(() => {
    if (socket) {
      function handleNewServerLog(data) {
        serverLogQueueRef.current.push(data);
      }

      intervalRef.current = setInterval(() => {
        const queue = serverLogQueueRef.current;
        if (queue.length === 0) return;

        // Leere Queue frühzeitig, damit spätere Logs nicht verloren gehen
        serverLogQueueRef.current = [];

        const serverLogIds = new Set(serverLog.map((l) => l.id));

        const newEntries = queue.filter((log) => !serverLogIds.has(log.id));

        // Neue Logs oben anhängen
        setServerLog((prev) => [...[...newEntries].reverse(), ...(prev || [])]);
        setFilteredServerLogMaxEntries((prev) => prev + newEntries.length);
        setServerlogOffset((prev) => prev + newEntries.length);

        // Filter anwenden (optional)
        const matchingLogs = newEntries.filter((log) => {
          if (!activeFilters || Object.keys(activeFilters).length === 0) return true;

          return (
            (!activeFilters.types?.length || activeFilters.types.includes(log.type)) &&
            (!activeFilters.userIds?.length ||
              activeFilters.userIds.map(Number).includes(log.userId)) &&
            (!activeFilters.createdAtFrom ||
              new Date(log.createdAt) >= new Date(activeFilters.createdAtFrom)) &&
            (!activeFilters.createdAtTo ||
              new Date(log.createdAt) <= new Date(activeFilters.createdAtTo)) &&
            (!activeFilters.ipv4Address ||
              log.ipv4Address?.toLowerCase().includes(activeFilters.ipv4Address.toLowerCase())) &&
            (!activeFilters.message ||
              log.message?.toLowerCase().includes(activeFilters.message.toLowerCase()))
          );
        });

        if (matchingLogs.length > 0) {
          setFilteredServerLog((prev) => [...matchingLogs.reverse(), ...(prev || [])]);
          setFilteredServerLogMaxEntries((prev) => prev + matchingLogs.length);
          setFilteredServerlogOffset((prev) => prev + matchingLogs.length);
        }
      }, 100); // alle 100ms prüfen

      socket.emit("subscribe:adminPage:serverLogs:watchList");

      socket.on("adminPage:serverLogs:create", handleNewServerLog);

      return () => {
        socket.off("adminPage:serverLogs:create", handleNewServerLog);

        clearInterval(intervalRef.current);
      };
    }
  }, [socket, activeFilters, setFilteredServerLog, setServerLog, serverLog]);

  const mergeNewLogs = (existingLogs, newLogs) => {
    const existingIds = new Set(existingLogs.map((log) => log.id));
    return [...existingLogs, ...newLogs.filter((log) => !existingIds.has(log.id))];
  };

  const fetchServerLogs = async (offset = 0) => {
    setLoadingServerLogPart(true);
    try {
      const { data } = await axiosProtected.get(`/adminPage/getServerLogs/50-${offset}`);
      const logs = data?.serverLogs || [];

      setServerLog((prev) => mergeNewLogs(prev || [], logs));
      setServerlogOffset((prev) => prev + 50);
      setServerLogMaxEntries(Number(data?.serverLogCount) || null);
    } catch (error) {
      if (error.name !== "CanceledError") {
        addToast("Fehler beim Laden des ServerLogs", "danger");
      }
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const fetchFilteredLogs = async (filters, offset = 0) => {
    setLoadingServerLogPart(true);

    try {
      const { data } = await axiosProtected.post(
        `/adminPage/getFilteredServerLogs/50-${offset}`,
        clearFilters(filters)
      );
      const logs = data?.serverLogs || [];

      setFilteredServerLog((prev) => mergeNewLogs(prev || [], logs));
      setFilteredServerlogOffset(offset + 50);
      setFilteredServerLogMaxEntries(Number(data?.serverLogCount) || 0);
    } catch (error) {
      if (error.name !== "CanceledError") {
        addToast("Fehler beim Laden der gefilterten Logs", "danger");
      }
    } finally {
      setLoadingServerLogPart(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const { data } = await axiosProtected.get(`/adminPage/getFilterOptionsServerLog`);
      setFilterOptions(data?.filterOptions || []);

      fetchServerLogs();
    } catch (error) {
      addToast("Fehler beim Laden des Serverlogs", "danger");
    } finally {
      setLoadingServerLog(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  function handleServerLogSearch(filters) {
    setActiveFilters(filters);
    setFilteredServerlogOffset(0);
    setFilteredServerLog(null);
    fetchFilteredLogs(filters, 0);
  }

  const sortedServerLog = useMemo(() => {
    if (!serverLog || serverLog.length === 0) return [];
    if (activeFilters && filteredServerLog) {
      return sortingAlgorithm(filteredServerLog, "id", "desc");
    } else {
      return sortingAlgorithm(serverLog, "id", "desc");
    }
  }, [serverLog, activeFilters, filteredServerLog]);

  return (
    <>
      <Container
        className="page-wrapper mt-4"
        style={{ height: `calc(100dvh - ${heightOffset}px)` }}
      >
        <h2>Serverlog</h2>

        <div>
          {!loadingServerLog && serverLog?.length > 0 ? (
            <>
              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => setShowFilterOptionsModal(true)}
                >
                  Such/Filter Optionen
                </button>

                {activeFilters ? (
                  <>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => {
                        setActiveFilters(null);
                        setFilteredServerLog(null);
                        setFilteredServerlogOffset(0);
                      }}
                    >
                      Such/Filter löschen
                    </button>
                  </>
                ) : null}
              </div>

              <div
                style={{ maxHeight: `calc(100dvh - ${heightOffset + 160}px)`, overflowY: "auto" }}
              >
                <ResizableTable
                  columns={[
                    { title: "ID", width: 50 },
                    { title: "Zeitstempel", width: 180 },
                    { title: "Type", width: 60 },
                    { title: "Nachricht" },
                  ]}
                  tableHeight={`calc(100dvh - ${heightOffset + 162}px)`}
                >
                  <tbody>
                    {sortedServerLog.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedServerLog(log.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{log.id}</td>
                        <td className="text-center">{convertToLocalTimeStamp(log.createdAt)}</td>
                        <td className="text-center">{log.type}</td>
                        <td className="text-center">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </ResizableTable>
              </div>
              <div className="text-center my-3">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (activeFilters) {
                      fetchFilteredLogs(activeFilters, filteredServerlogOffset);
                    } else {
                      console.log("Lade mehr Server-Logs", serverlogOffset);
                      fetchServerLogs(serverlogOffset);
                    }
                  }}
                  disabled={
                    loadingServerLogPart ||
                    (activeFilters
                      ? filteredServerlogOffset >= filteredServerLogMaxEntries
                      : serverlogOffset >= serverLogMaxEntries)
                  }
                >
                  {loadingServerLogPart ? "Lade mehr..." : "Mehr laden"}
                </button>
              </div>
            </>
          ) : (
            <TableLoadingAnimation />
          )}
        </div>
      </Container>

      {selectedServerLog ? (
        <ShowServerlogEntry
          show={!!selectedServerLog}
          handleClose={() => setSelectedServerLog(null)}
          serverLogEntry={serverLog.find((log) => log.id === selectedServerLog)}
        />
      ) : null}

      {showFilterOptionsModal ? (
        <ServerLogFilterOptionsModal
          show={!!showFilterOptionsModal}
          handleClose={() => setShowFilterOptionsModal(false)}
          filterOptions={filterOptions}
          handleFilterOptions={handleServerLogSearch}
          activeFilters={activeFilters}
        />
      ) : null}
    </>
  );
}

export default ServerLogPage;
