export const getStoredTheme = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["theme"], (result) => {
      resolve(result.theme || "dark"); // Default theme is dark
    });
  });
};

export const saveTheme = async (theme: string) => {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ theme }, () => {
      resolve();
    });
  });
};
