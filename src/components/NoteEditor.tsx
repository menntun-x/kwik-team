import React, { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons/faExpand";
import { faCompress } from "@fortawesome/free-solid-svg-icons/faCompress";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { faPrint } from "@fortawesome/free-solid-svg-icons/faPrint";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import {
  getStoredNotesList,
  saveNotesList,
  getStoredNoteById,
  saveNoteContent,
} from "../utils/storage";
import { getStoredTheme, saveTheme } from "../utils/theme";
import { v4 as uuidv4 } from "uuid";

const themes = ["dark", "light", "solarized", "high-contrast", "pastel"];

interface Note {
  id: string;
  title: string;
  content: string;
}

const NoteEditor: React.FC = () => {
  const [notesList, setNotesList] = useState<any[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [currentNoteContent, setCurrentNoteContent] = useState<string>("");
  const [theme, setTheme] = useState<string>("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReactQuill>(null);

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

  // Load notes from Chrome storage when component mounts
  useEffect(() => {
    chrome.storage.local.get("notesList", (data) => {
      if (data.notesList) {
        setNotesList(data.notesList);
      }
    });
  }, []);

  // Save current note content every time it changes (optional)
  useEffect(() => {
    if (currentNoteId) {
      const debounceSave = setTimeout(() => {
        saveNoteContent(currentNoteId, currentNoteContent);
      }, 1000); // Auto-save after 1 second of inactivity
      return () => clearTimeout(debounceSave);
    }
  }, [currentNoteContent, currentNoteId]);

  // Save the updated notes list to Chrome storage
  const saveNotesList = async (updatedNotesList: Note[]) => {
    chrome.storage.local.set({ notesList: updatedNotesList }, () => {
      console.log("Notes saved successfully.");
    });
  };

  // Save the current note's content before switching or creating a new one
  const saveNoteContent = async (noteId: string, content: string) => {
    const updatedNotesList = notesList.map((note) =>
      note.id === noteId ? { ...note, content } : note
    );
    setNotesList(updatedNotesList);
    await saveNotesList(updatedNotesList);
  };

  // Create a new note and set it as the current note
  const createNewNote = async () => {
    // Save current note before creating a new one
    if (currentNoteId) {
      await saveNoteContent(currentNoteId, currentNoteContent);
    }

    // Create a new note
    const newNote: Note = {
      id: uuidv4(),
      title: `New Note ${Date.now()}`,
      content: "",
    };

    // Update notes list and set new note as current
    const updatedNotesList = [...notesList, newNote];
    setNotesList(updatedNotesList);
    await saveNotesList(updatedNotesList); // Save to Chrome storage

    setCurrentNoteId(newNote.id);
    setCurrentNoteContent(newNote.content);
    setIsSidebarOpen(false); // Close sidebar after creation (optional)
  };

  // Switch between notes, saving the current one before loading another
  const switchNote = async (noteId: string) => {
    // Save the current note's content before switching
    if (currentNoteId) {
      await saveNoteContent(currentNoteId, currentNoteContent);
    }

    // Load the new note
    const selectedNote = notesList.find((note) => note.id === noteId);
    if (selectedNote) {
      setCurrentNoteId(selectedNote.id);
      setCurrentNoteContent(selectedNote.content || "");
    }

    setIsSidebarOpen(false); // Close the sidebar (optional)
  };

  // Handle changes in the note content (editing)
  const handleNoteContentChange = (content: string) => {
    setCurrentNoteContent(content);
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
      // Wait for all images to load before printing
      const images = printWindow.document.images;
      const totalImages = images.length;
      let loadedImages = 0;

      // Function to check if all images have loaded
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          printWindow.document.close(); // Ensure the document is fully loaded
          printWindow.focus(); // Bring the print window to the front
          printWindow.print(); // Trigger the print
          printWindow.close(); // Close the print window after printing
        }
      };

      // If there are images, add load event listeners
      if (totalImages > 0) {
        for (let i = 0; i < totalImages; i++) {
          images[i].onload = checkAllImagesLoaded;
          images[i].onerror = checkAllImagesLoaded; // In case an image fails to load
        }
      } else {
        // No images, print immediately
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
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
      {/* Display the title of the currently editing note */}
      <div className={`note-title-wrapper ${theme}`}>
        <h1 className={`current-note-title ${theme}`}>
          {currentNoteId
            ? notesList.find((note) => note.id === currentNoteId)?.title
            : "No Note Selected"}
        </h1>
      </div>

      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={currentNoteContent}
        onChange={handleNoteContentChange}
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
        <div className={`notes-list ${theme}`}>
          <div className="notes-title-wrapper">
            {" "}
            <h3 className={`notes-title ${theme}`}>Notes</h3>
            <button
              className={`create-note-btn ${theme}`}
              onClick={createNewNote}
            >
              <FontAwesomeIcon
                icon={faPlus}
                className={`sidebar-action-icon ${theme}`}
              />
            </button>
          </div>

          <ul className={`notes-list-ul ${theme}`}>
            {notesList.map((note) => (
              <li
                key={note.id}
                className={`note-item ${
                  note.id === currentNoteId ? `active ${theme}` : theme
                }`}
              >
                <span
                  className={`note-title ${theme}`}
                  onClick={() => switchNote(note.id)}
                >
                  {note.title}
                </span>

                {/* <FontAwesomeIcon
                  icon={faTrash}
                  className={`sidebar-action-icon ${theme}`}
                  onClick={() => deleteNote(note.id)}
                /> */}
              </li>
            ))}
          </ul>
        </div>

        <div className={`sidebar-item ${theme}`} onClick={toggleFullscreen}>
          <FontAwesomeIcon
            icon={isFullscreen ? faCompress : faExpand}
            className={`sidebar-action-icon ${theme}`}
          />
          <div className="sidebar-item-title">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </div>
        </div>

        <div className={`sidebar-item ${theme} m-b-50`} onClick={printNotes}>
          <FontAwesomeIcon
            icon={faPrint}
            className={`sidebar-action-icon ${theme}`}
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
