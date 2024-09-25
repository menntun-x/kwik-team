import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
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

  return (
    <div className="note-editor-container">
      <ReactQuill
        theme="snow"
        value={notes}
        onChange={handleNoteChange}
        placeholder="Write your notes here..."
      />
    </div>
  );
};

export default NoteEditor;
