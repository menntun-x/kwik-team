export const getStoredNotes = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["notes"], (result) => {
      resolve(result.notes || "");
    });
  });
};

export const saveNotes = async (notes: string) => {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ notes }, () => {
      resolve();
    });
  });
};
