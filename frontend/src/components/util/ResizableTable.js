import React, { useRef, useEffect, useState } from "react";
import "./css/ResizableTable.css";
import Table from "react-bootstrap/Table";

//Icons
import { ReactComponent as ArrowUpIcon } from "assets/icons/arrow_up.svg";
import { ReactComponent as ArrowDownIcon } from "assets/icons/arrow_down.svg";
import { ReactComponent as ArrowForwardIcon } from "assets/icons/arrow_forward.svg";

const ResizableTable = ({ columns, tableHeight = 300, handleSort = null, children }) => {
  const tableRef = useRef();
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const resizeIntervalRef = useRef(null);

  useEffect(() => {
    const table = tableRef.current;
    const headers = table.querySelectorAll("th");

    headers.forEach((th, index) => {
      const resizer = document.createElement("div");
      resizer.classList.add("resizer");
      th.appendChild(resizer);
      th.style.position = "relative";

      let startX, startWidth;

      // Maus
      const onMouseDown = (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = th.offsetWidth;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e) => {
        const pointerX = e.clientX;
        const newWidth = startWidth + (pointerX - startX);
        resizeColumn(index, newWidth);
        handleAutoScroll(pointerX);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      // Touch
      const onTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startWidth = th.offsetWidth;
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
      };

      const onTouchMove = (e) => {
        const pointerX = e.touches[0].clientX;
        const newWidth = startWidth + (pointerX - startX);
        resizeColumn(index, newWidth);
        handleAutoScroll(pointerX);
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      const resizeColumn = (colIndex, width) => {
        if (width < 50) return; // optional: minimale Breite
        th.style.width = width + "px";
        table.querySelectorAll(`th:nth-child(${colIndex + 1})`).forEach((headerCell) => {
          headerCell.style.width = width + "px";
        });
      };

      const handleAutoScroll = (pointerX) => {
        const wrapper = table.parentElement;
        const { left, right } = wrapper.getBoundingClientRect();

        const SCROLL_MARGIN = 30; // wie nah am Rand muss man sein
        const SCROLL_SPEED = 10; // px pro event

        if (pointerX > right - SCROLL_MARGIN) {
          wrapper.scrollLeft += SCROLL_SPEED;
        }
      };

      resizer.addEventListener("mousedown", onMouseDown);
      resizer.addEventListener("touchstart", onTouchStart, { passive: false });
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

  const startAutoResize = (index) => {
    const table = tableRef.current;
    const wrapper = table.parentElement;

    const resize = () => {
      const header = table.querySelector(`th:nth-child(${index + 1})`);
      const currentWidth = header.offsetWidth;
      const newWidth = currentWidth + 5;

      header.style.width = `${newWidth}px`;
      table.querySelectorAll(`th:nth-child(${index + 1})`).forEach((th) => {
        th.style.width = `${newWidth}px`;
      });

      wrapper.scrollLeft = wrapper.scrollWidth;
    };

    resizeIntervalRef.current = setInterval(resize, 50); // alle 50ms verbreitern
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
        {children}
      </Table>
    </div>
  );
};

export default ResizableTable;
