import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faStickyNote } from "@fortawesome/free-solid-svg-icons";
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
  onEditNoteTitle: (noteId: string, newTitle: string) => void;
  theme: string;
  selectedNoteId?: string;
}

const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  onNoteSelect,
  onCreateNewNote,
  onDeleteNote,
  onEditNoteTitle,
  theme,
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
    <div className={`notes-list-view ${theme}`}>
      {notes.length === 0 ? (
        <div className={`no-notes ${theme}`}>
          <div className={`no-notes-content ${theme}`}>
            <FontAwesomeIcon
              icon={faStickyNote}
              className={`no-notes-icon ${theme}`}
            />
            <p className={`no-notes-text ${theme}`}>
              No notes available. Let’s start your first one!
            </p>
            <button
              className={`create-note-button ${theme}`}
              onClick={onCreateNewNote}
            >
              Create Your First Note
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`notes-header ${theme}`}>
            <h2 className={`${theme}`}>All Notes</h2>
            <button
              className={`create-note-button ${theme}`}
              onClick={onCreateNewNote}
            >
              Create New Note
            </button>
          </div>
          <ul className={`notes-list ${theme}`}>
            {notes.map((note) => (
              <li
                key={note.id}
                className={`note-item ${
                  selectedNoteId === note.id ? "selected" : ""
                } ${theme}`}
                onClick={() => onNoteSelect(note.id)}
              >
                <div className={`note-meta ${theme}`}>
                  {editableNoteId === note.id ? (
                    <>
                      <input
                        type="text"
                        value={titleInput}
                        className={`edit-title-input ${
                          error ? "input-error" : ""
                        } ${theme}`}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={() => handleTitleBlur(note.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {error && (
                        <p className={`error-message ${theme}`}>{error}</p>
                      )}
                    </>
                  ) : (
                    <div className={`title-edit-wrapper ${theme}`}>
                      <h3 className={`note-title ${theme}`}>{note.title}</h3>
                      <FontAwesomeIcon
                        icon={faEdit}
                        className={`note-action-icon ${theme}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTitleClick(note);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  className={`delete-note-button ${theme}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={`note-action-icon ${theme}`}
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
