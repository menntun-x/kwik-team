import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faPlusCircle, faStickyNote } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "./NotesListView.scss";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NotesListViewProps {
  notes: Note[];
  onNoteSelect: (noteId: string) => void;
  onCreateNewNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onEditNoteTitle: (noteId: string, newTitle: string) => void; // New prop for title editing
  selectedNoteId?: string;
}

const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  onNoteSelect,
  onCreateNewNote,
  onDeleteNote,
  onEditNoteTitle,
  selectedNoteId,
}) => {
  const [editableNoteId, setEditableNoteId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleTitleClick = (note: Note) => {
    setEditableNoteId(note.id);
    setTitleInput(note.title); // Initialize with the current note's title
    setError("");
  };

  const handleTitleBlur = (noteId: string) => {
    if (titleInput.trim()) {
      onEditNoteTitle(noteId, titleInput.trim()); // Call prop to update title
      setEditableNoteId(null); // Disable editing mode
      setError("");
    } else {
      setError("Title cannot be empty");
    }
  };
  return (
    <div className="notes-list-view">
      {notes.length === 0 ? (
        <div className="no-notes">
          <div className="no-notes-content">
            <FontAwesomeIcon icon={faStickyNote} className="no-notes-icon" />
            <p className="no-notes-text">
              No notes available. Let’s start your first one!
            </p>
            <button className="create-note-button" onClick={onCreateNewNote}>
              <FontAwesomeIcon
                icon={faPlusCircle}
                className="sidebar-action-icon"
              />{" "}
              Create Your First Note
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="notes-header">
            <h2>All Notes</h2>
            <button className="create-note-button" onClick={onCreateNewNote}>
              <FontAwesomeIcon
                icon={faPlusCircle}
                className="sidebar-action-icon"
              />{" "}
              Create New Note
            </button>
          </div>
          <ul className="notes-list">
            {notes.map((note) => (
              <li
                key={note.id}
                className={`note-item ${
                  selectedNoteId === note.id ? "selected" : ""
                }`}
                onClick={() => onNoteSelect(note.id)}
              >
                <div className="note-meta">
                  {editableNoteId === note.id ? (
                    <>
                      <input
                        type="text"
                        value={titleInput}
                        className={`edit-title-input ${
                          error ? "input-error" : ""
                        }`}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={() => handleTitleBlur(note.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {error && <p className="error-message">{error}</p>}
                    </>
                  ) : (
                    <div className="title-edit-wrapper">
                      <h3 className="note-title">{note.title}</h3>
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="edit-title-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTitleClick(note);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  className="delete-note-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="sidebar-action-icon"
                  />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default NotesListView;
