import { useEffect, useRef, useState, useContext } from "react";
import { ThemeContext } from "contexts/ThemeContext";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Theme importieren
import "./css/quillDarkMode.css";

export default function NachrichtEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Nachricht eingeben...",
}) {
  const { theme } = useContext(ThemeContext);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      // Setzt Anfangswert
      quillRef.current.root.innerHTML = value || "";

      // Ändert bei Benutzerinput
      quillRef.current.on("text-change", () => {
        const html = editorRef.current.querySelector(".ql-editor").innerHTML;
        onChange(html);
      });
    }

    // Editor aktualisieren, wenn sich value ändert
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value, onChange, placeholder]);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  return (
    <div className={`mb-3 ${theme === "light" ? "" : "dark"}`}>
      <label className="form-label">Nachricht</label>
      <div ref={editorRef} className={`quill-editor`} style={{ height: "200px" }} />
    </div>
  );
}
