import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import snow theme styles
import { getStoredNotes, saveNotes } from "../utils/storage";
import { getStoredTheme, saveTheme } from "../utils/theme"; // New theme storage utils

const NoteEditor: React.FC = () => {
  const [notes, setNotes] = useState<string>("");
  const [theme, setTheme] = useState<string>("dark"); // Default theme

  useEffect(() => {
    // Load stored notes and theme when the component mounts
    getStoredNotes().then((storedNotes) => {
      if (storedNotes) setNotes(storedNotes);
    });
    getStoredTheme().then((storedTheme) => {
      if (storedTheme) setTheme(storedTheme);
    });
  }, []);

  const handleNoteChange = (value: string) => {
    setNotes(value);
    saveNotes(value); // Save notes to storage
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    saveTheme(newTheme); // Save theme to storage
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

  return (
    <div className={`note-editor-container ${theme}`}>
      <ReactQuill
        theme="snow" // Use snow theme for Quill
        value={notes}
        onChange={handleNoteChange}
        placeholder="Write your notes here..."
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }], // Heading levels
            ["bold", "italic", "underline", "strike"], // Text formatting
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            ["blockquote", "code-block"], // Block quote and code block
            ["link", "image"], // Link and image
            ["clean"], // Remove formatting button
          ],
        }}
      />

      <footer>
        <div className="theme-selector">
          <label htmlFor="theme-select" className="theme-label">
            Theme:
          </label>
          <div className="custom-select">
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <button onClick={printNotes} className="print-button">
          Print
        </button>
        <div className="footer-credits">Made with ♥ by Raj Kumar Dubey</div>
      </footer>
    </div>
  );
};

export default NoteEditor;
