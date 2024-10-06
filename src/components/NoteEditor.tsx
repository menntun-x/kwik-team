import React, { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faBars,
  faPrint,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  getStoredNotesList,
  saveNotesList,
  getStoredNoteById,
  saveNoteContent,
} from "../utils/storage";
import { getStoredTheme, saveTheme } from "../utils/theme";

const themes = ["dark", "light", "solarized", "high-contrast", "pastel"];

const NoteEditor: React.FC = () => {
  const [notesList, setNotesList] = useState<any[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [currentNoteContent, setCurrentNoteContent] = useState<string>("");
  const [theme, setTheme] = useState<string>("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReactQuill>(null);

  // Fetch notes and theme on load
  useEffect(() => {
    getStoredNotesList().then((storedNotesList) => {
      setNotesList(storedNotesList);
      if (storedNotesList.length > 0) {
        setCurrentNoteId(storedNotesList[0].id);
        setCurrentNoteContent(storedNotesList[0].content);
      }
    });
    getStoredTheme().then((storedTheme) => {
      if (storedTheme) setTheme(storedTheme);
    });
  }, []);

  // Handle sidebar outside click
  useEffect(() => {
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

  // Create a new blank note without clearing the current one
  const createNewNote = () => {
    const newNote = {
      id: uuidv4(),
      title: `New Note ${notesList.length + 1}`,
      content: "",
    };
    const updatedNotesList = [...notesList, newNote];
    setNotesList(updatedNotesList);
    setCurrentNoteId(newNote.id);
    saveNotesList(updatedNotesList);
    loadNote(newNote.id);
    setIsSidebarOpen(false); // Close the sidebar
  };

  // Load a note by its ID without clearing other notes
  const loadNote = async (noteId: string) => {
    const note = await getStoredNoteById(noteId);
    if (note) {
      setCurrentNoteId(note.id);
      setCurrentNoteContent(note.content);
      setIsSidebarOpen(false); // Close the sidebar when loading a note
    }
  };

  // Save the content of the currently active note
  const handleNoteChange = (value: string) => {
    setCurrentNoteContent(value);
    if (currentNoteId) {
      saveNoteContent(currentNoteId, value);
      const updatedNotesList = notesList.map((note) =>
        note.id === currentNoteId ? { ...note, content: value } : note
      );
      setNotesList(updatedNotesList);
    }
  };

  // Delete a note by its ID
  const deleteNote = (noteId: string) => {
    const filteredNotes = notesList.filter((note) => note.id !== noteId);
    setNotesList(filteredNotes);

    // If the current note is deleted, switch to another note or show blank
    if (currentNoteId === noteId) {
      if (filteredNotes.length > 0) {
        setCurrentNoteId(filteredNotes[0].id);
        setCurrentNoteContent(filteredNotes[0].content);
      } else {
        setCurrentNoteId(null);
        setCurrentNoteContent("");
      }
    }
    saveNotesList(filteredNotes);
  };

  // Theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const printNotes = () => {
    const editorContent = editorRef.current?.getEditor().root.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Notes</title>
            <style>
              body { font-family: "Helvetica Neue", Arial, sans-serif; padding: 20px; }
              h1, h2, p { margin-bottom: 12px; }
              a { color: #000; text-decoration: underline; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <div class="print-content">${editorContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`note-editor-container ${theme}`}>
      {/* Display the title of the currently editing note */}
      <div className="note-title-wrapper">
        <h1 className="current-note-title">
          {currentNoteId
            ? notesList.find((note) => note.id === currentNoteId)?.title
            : "No Note Selected"}
        </h1>
      </div>

      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={currentNoteContent}
        onChange={handleNoteChange}
        placeholder="Write your notes here..."
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

        <div className="notes-list">
          <h3>Notes</h3>
          <button
            className={`create-note-btn ${theme}`}
            onClick={createNewNote}
          >
            <FontAwesomeIcon icon={faPlus} /> New Note
          </button>
          <ul>
            {notesList.map((note) => (
              <li
                key={note.id}
                className={`note-item ${
                  note.id === currentNoteId ? "active" : ""
                }`}
              >
                <span onClick={() => loadNote(note.id)}>{note.title}</span>
                <FontAwesomeIcon
                  icon={faTrash}
                  className="delete-icon"
                  onClick={() => deleteNote(note.id)}
                />
              </li>
            ))}
          </ul>
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

        <div className={`sidebar-item ${theme}`} onClick={printNotes}>
          <FontAwesomeIcon
            icon={faPrint}
            className={`sidebar-item-icon ${theme}`}
          />
          <div className="sidebar-item-title">Print Notes</div>
        </div>

        <div className={`footer-credits ${theme}`}>
          <span>Made with ❤️ by Raj Kumar Dubey</span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
