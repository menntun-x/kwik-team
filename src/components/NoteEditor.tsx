import React, { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getStoredNotes, saveNotes } from "../utils/storage";
import { getStoredTheme, saveTheme } from "../utils/theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons/faExpand";
import { faCompress } from "@fortawesome/free-solid-svg-icons/faCompress";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { faPrint } from "@fortawesome/free-solid-svg-icons/faPrint";


const themes = ["dark", "light", "solarized", "high-contrast", "pastel"];

const NoteEditor: React.FC = () => {
  const [notes, setNotes] = useState<string>("");
  const [theme, setTheme] = useState<string>("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStoredNotes().then((storedNotes) => {
      if (storedNotes) setNotes(storedNotes);
    });
    getStoredTheme().then((storedTheme) => {
      if (storedTheme) setTheme(storedTheme);
    });

    // Close sidebar when clicking outside of it
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleNoteChange = (value: string) => {
    setNotes(value);
    saveNotes(value);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const printNotes = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Notes</title>
            <style>
              body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #2b2d42; color: #edf2f4; }
              .print-content { padding: 20px; }
              h1, h2, p { margin-bottom: 12px; }
              a { color: #ef233c; text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="print-content">${notes}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`note-editor-container ${theme}`}>
      <ReactQuill
        theme="snow"
        value={notes}
        onChange={handleNoteChange}
        placeholder="Write your notes here..."
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link", "image"],
            ["clean"],
          ],
        }}
      />

      {!isSidebarOpen && (
        <button className={`hamburger-icon ${theme}`} onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      <div
        className={`sidebar ${isSidebarOpen ? "open" : ""} ${theme}`}
        ref={sidebarRef}
      >
        <div className="theme-selector">
          <h3>Select Theme</h3>
          <div className="theme-options">
            {themes.map((t) => (
              <label
                key={t}
                className={`theme-option ${t === theme ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t}
                  checked={theme === t}
                  onChange={() => handleThemeChange(t)}
                />
                <div className={`theme-icon theme-icon-${t}`}></div>
                <span className="theme-name">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={`sidebar-item ${theme}`} onClick={toggleFullscreen}>
          <FontAwesomeIcon
            icon={isFullscreen ? faCompress : faExpand}
            className={`sidebar-item-icon ${theme}`}
          />
          <div className="sidebar-item-title">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </div>
        </div>

        <div className={`sidebar-item ${theme}`} onClick={() => window.print()}>
          <FontAwesomeIcon
            icon={faPrint}
            className={`sidebar-item-icon ${theme}`}
          />
          <div className="sidebar-item-title">Print Notes</div>
        </div>

        <div className="footer-credits">Made with ❤️ by Raj Kumar Dubey</div>
      </div>
    </div>
  );
};

export default NoteEditor;
