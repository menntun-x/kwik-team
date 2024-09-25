import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css"; // Use bubble or dark theme styles
import { getStoredNotes, saveNotes } from "../utils/storage";

const NoteEditor: React.FC = () => {
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    // Load stored notes when the component mounts
    getStoredNotes().then((storedNotes) => {
      if (storedNotes) setNotes(storedNotes);
    });
  }, []);

  const handleNoteChange = (value: string) => {
    setNotes(value);
    saveNotes(value); // Save notes to storage
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
    <div className="note-editor-container">
      <ReactQuill
        theme="bubble"
        value={notes}
        onChange={handleNoteChange}
        placeholder="Write your notes here..."
      />
      <footer>
        <div>Total characters: {notes.length}</div>
        <button onClick={printNotes} style={{ backgroundColor: '#ef233c', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>
          Print
        </button>
      </footer>
    </div>
  );
};

export default NoteEditor;