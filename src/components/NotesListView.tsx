import React from "react";
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
  selectedNoteId?: string;
}

const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  onNoteSelect,
  onCreateNewNote,
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
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default NotesListView;
