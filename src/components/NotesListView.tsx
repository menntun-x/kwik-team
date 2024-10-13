import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
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
  selectedNoteId?: string;
}

const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  onNoteSelect,
  onCreateNewNote,
  onDeleteNote,
  selectedNoteId,
}) => {
  return (
    <div className="notes-list-view">
      {notes.length === 0 ? (
        <div className="no-notes">
          <p>No notes available. Let’s start your first one!</p>
          <button className="create-note-button" onClick={onCreateNewNote}>
            <i className="icon-plus"></i> Create Your First Note
          </button>
        </div>
      ) : (
        <>
          <div className="notes-header">
            <h2>All Notes</h2>
            <button className="create-note-button" onClick={onCreateNewNote}>
              <i className="icon-plus"></i> New Note
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
                  <h3 className="note-title">{note.title}</h3>
                </div>
                <button
                  className="delete-note-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the event from bubbling up to the li
                    onDeleteNote(note.id);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className={`sidebar-action-icon`}
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
