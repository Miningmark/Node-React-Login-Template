import React, { useRef, useEffect, useState } from "react";
import "./css/ResizableTable.css";
import Table from "react-bootstrap/Table";

import { ReactComponent as ArrowUpIcon } from "assets/icons/arrow_up.svg";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow_down.svg";

const ResizableTable = ({ columns, tableHeight = 300, handleSort = null, children }) => {
  const tableRef = useRef();
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const table = tableRef.current;
    const headers = table.querySelectorAll("th");

    headers.forEach((th, index) => {
      const resizer = document.createElement("div");
      resizer.classList.add("resizer");
      th.appendChild(resizer);
      th.style.position = "relative";

      let startX, startWidth;

      const onMouseDown = (e) => {
        startX = e.clientX;
        startWidth = th.offsetWidth;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e) => {
        const newWidth = startWidth + (e.clientX - startX);
        th.style.width = newWidth + "px";
        table.querySelectorAll(`th:nth-child(${index + 1})`).forEach((headerCell) => {
          headerCell.style.width = newWidth + "px";
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      resizer.addEventListener("mousedown", onMouseDown);
    });
  }, []);

  const handleHeaderClick = (e, colId) => {
    if (e.target.classList.contains("resizer")) return;

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
            {columns.map((col, index) => (
              <th
                className="text-center "
                key={index}
                style={{
                  minWidth: "50px",
                  width: col.width ? `${col.width}px` : undefined,
                  cursor: `${handleSort ? "pointer" : "default"}`,
                }}
                onClick={(e) => handleHeaderClick(e, col.id || null)}
              >
                {col.title}
                {sortedColumn === col.id && (
                  <span
                    style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    {sortDirection === "asc" ? (
                      <ArrowDownIcon style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <ArrowUpIcon style={{ width: "100%", height: "100%" }} />
                    )}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        {children}
      </Table>
    </div>
  );
};

export default ResizableTable;
