import React, { useRef, useEffect, useState } from "react";
import "./css/ResizableTable.css";
import Table from "react-bootstrap/Table";

//Icons
import { ReactComponent as ArrowUpIcon } from "assets/icons/arrow_up.svg";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow_down.svg";
import { ReactComponent as ArrowForwardIcon } from "assets/icons/arrow_forward.svg";

const ResizableTable = ({ columns, tableHeight = 300, handleSort = null, rows, onRowClick }) => {
  const tableRef = useRef();
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [columnOrder, setColumnOrder] = useState(columns);

  const resizeIntervalRef = useRef(null);

  useEffect(() => {
    const table = tableRef.current;
    const headers = table.querySelectorAll("thead th");
    const totalTableWidth = table.parentElement.clientWidth - 36;

    const MIN_WIDTH = 50;

    const fixedWidths = columns.map((col) => col.width || null);
    const totalFixedWidth = fixedWidths.reduce((sum, w) => (w ? sum + w : sum), 0);

    const numDynamic = fixedWidths.filter((w) => !w).length;
    let remainingWidth = totalTableWidth - totalFixedWidth;

    // Fall: Alle Spalten haben fixe Breite, aber zu wenig → vergrößern
    if (numDynamic === 0 && totalFixedWidth < totalTableWidth) {
      const extraPerCol = Math.floor((totalTableWidth - totalFixedWidth) / columns.length);
      fixedWidths.forEach((w, i) => (fixedWidths[i] = w + extraPerCol));
    }

    // Fall: Einige Spalten haben keine Breite → verteile verbleibenden Platz
    if (numDynamic > 0) {
      const defaultWidth = Math.max(Math.floor(remainingWidth / numDynamic), MIN_WIDTH);
      fixedWidths.forEach((w, i) => {
        if (!w) fixedWidths[i] = defaultWidth;
      });
    }

    // Wende die berechneten Breiten an und setze Resizer
    headers.forEach((th, index) => {
      const width = fixedWidths[index];
      th.style.width = `${width}px`;

      // Zellen im Body setzen
      table.querySelectorAll(`tbody td:nth-child(${index + 1})`).forEach((td) => {
        td.style.width = `${width}px`;
      });

      // Resizer-Element erstellen
      const resizer = document.createElement("div");
      resizer.classList.add("resizer");
      th.appendChild(resizer);
      th.style.position = "relative";

      // Variablen für Resizing
      let startX, startWidth;

      const resizeColumn = (colIndex, newWidth) => {
        if (newWidth < MIN_WIDTH) return;
        const px = `${newWidth}px`;

        // Alle header-Zellen dieser Spalte
        table.querySelectorAll(`th:nth-child(${colIndex + 1})`).forEach((headerCell) => {
          headerCell.style.width = px;
        });

        // Alle body-Zellen dieser Spalte
        table.querySelectorAll(`tbody td:nth-child(${colIndex + 1})`).forEach((td) => {
          td.style.width = px;
        });
      };

      // Maus-Events
      const onMouseDown = (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = th.offsetWidth;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e) => {
        const delta = e.clientX - startX;
        const newWidth = startWidth + delta;
        resizeColumn(index, newWidth);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      // Touch-Events
      const onTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startWidth = th.offsetWidth;
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
      };

      const onTouchMove = (e) => {
        const delta = e.touches[0].clientX - startX;
        const newWidth = startWidth + delta;
        resizeColumn(index, newWidth);
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      // Listener anhängen
      resizer.addEventListener("mousedown", onMouseDown);
      resizer.addEventListener("touchstart", onTouchStart, { passive: false });
    });
  }, []);

  const handleHeaderClick = (e, colId) => {
    if (e.target.classList.contains("resizer") || e.target.closest(".resize-button")) {
      return;
    }

    if (!handleSort) return;

    if (sortedColumn === colId) {
      // Toggle direction
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
      handleSort(colId);
    } else {
      // Set new column and reset to ascending
      setSortedColumn(colId);
      setSortDirection("asc");
      handleSort(colId);
    }
  };

  const startAutoResize = (index, direction = "right") => {
    const table = tableRef.current;
    const wrapper = table.parentElement;

    const resize = () => {
      const header = table.querySelector(`th:nth-child(${index + 1})`);
      if (!header) return;

      const currentWidth = header.offsetWidth;
      const newWidth = currentWidth + 5;

      // Breite anwenden
      table.querySelectorAll(`th:nth-child(${index + 1})`).forEach((th) => {
        th.style.width = `${newWidth}px`;
      });

      // Scroll anpassen
      if (direction === "right") {
        wrapper.scrollLeft = wrapper.scrollWidth;
      } else if (direction === "left") {
        const rect = header.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        if (rect.left < wrapperRect.left) {
          header.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        }
      }
    };

    resizeIntervalRef.current = setInterval(resize, 50);
  };

  const stopAutoResize = () => {
    if (resizeIntervalRef.current) {
      clearInterval(resizeIntervalRef.current);
      resizeIntervalRef.current = null;
    }
  };

  return (
    <div
      className="resizable-table-wrapper"
      style={{
        height: `${tableHeight}`,
        overflow: "auto",
        position: "relative",
        border: "1px solid #dee2e6",
      }}
    >
      <Table striped bordered hover ref={tableRef} className=" resizable-table mb-0">
        <thead
          className="border"
          style={{
            position: "sticky",
            top: "0px",
            zIndex: 2,
          }}
        >
          <tr>
            {columnOrder.map((col, index) => (
              <th
                className="text-center "
                key={index}
                style={{
                  minWidth: "50px",
                  cursor: `${handleSort ? "pointer" : "default"}`,
                }}
                onClick={(e) => handleHeaderClick(e, col.id || null)}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("colIndex", index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = parseInt(e.dataTransfer.getData("colIndex"), 10);
                  const to = index;
                  if (from !== to) {
                    const newOrder = [...columnOrder];
                    const [moved] = newOrder.splice(from, 1);
                    newOrder.splice(to, 0, moved);
                    setColumnOrder(newOrder);
                  }
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {col.title}
                  {sortedColumn === col.id &&
                    (sortDirection === "asc" ? (
                      <ArrowDownIcon style={{ width: "24px", height: "24px" }} />
                    ) : (
                      <ArrowUpIcon style={{ width: "24px", height: "24px" }} />
                    ))}
                </span>
                {index === columns.length - 1 && (
                  <button
                    className="resize-button"
                    onMouseDown={() => startAutoResize(index)}
                    onMouseUp={stopAutoResize}
                    onMouseLeave={stopAutoResize}
                    onTouchStart={() => startAutoResize(index)}
                    onTouchEnd={stopAutoResize}
                    onTouchCancel={stopAutoResize}
                  >
                    <ArrowForwardIcon width="24" height="24" />
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: `${onRowClick ? "pointer" : ""}` }}
            >
              {columnOrder.map((col) => (
                <td key={col.id}> {col.render ? col.render(row[col.id], row) : row[col.id]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ResizableTable;
