export interface Note {
  id: string;
  title: string;
  content: string;
}

export const getStoredNotesList = async (): Promise<Note[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["notesList"], (result) => {
      resolve(result.notesList || []);
    });
  });
};

export const saveNotesList = async (notesList: Note[]) => {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ notesList }, () => {
      resolve();
    });
  });
};

export const getStoredNoteById = async (id: string): Promise<Note | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["notesList"], (result) => {
      const notesList: Note[] = result.notesList || [];
      const note = notesList.find((note) => note.id === id) || null;
      resolve(note);
    });
  });
};

export const saveNoteContent = async (id: string, content: string) => {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(["notesList"], (result) => {
      const notesList: Note[] = result.notesList || [];
      const noteIndex = notesList.findIndex((note) => note.id === id);

      if (noteIndex !== -1) {
        notesList[noteIndex].content = content; // Ensure the correct note gets updated
        chrome.storage.local.set({ notesList }, () => {
          console.log(`Content saved for note ${id}`);
          resolve();
        });
      }
    });
  });
};

