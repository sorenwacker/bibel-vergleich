const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getVerse: (bookName, chapter, verse) =>
        ipcRenderer.invoke('get-verse', bookName, chapter, verse),

    getVerseTranslation: (bookName, chapter, verse, translation) =>
        ipcRenderer.invoke('get-verse-translation', bookName, chapter, verse, translation),

    getTranslations: () =>
        ipcRenderer.invoke('get-translations'),

    getStats: () =>
        ipcRenderer.invoke('get-stats')
});
