const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { initDB, getVerse, getVerseTranslation, getTranslations, getStats } = require('./db');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#0f172a',
        titleBarStyle: 'default',
        show: false
    });

    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Open DevTools automatically for debugging
        mainWindow.webContents.openDevTools();
    });

    // Create menu
    const template = [
        {
            label: 'Datei',
            submenu: [
                {
                    label: 'Beenden',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Bearbeiten',
            submenu: [
                { label: 'Rückgängig', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Wiederholen', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Ausschneiden', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Kopieren', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Einfügen', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Alles auswählen', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                { label: 'Neu laden', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Entwicklertools', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Vollbild', accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Über Bibel Vergleich',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Über Bibel Vergleich',
                            message: 'Bibel Vergleich v1.0.0',
                            detail: 'Eine Desktop-App zum parallelen Vergleichen deutscher Bibelübersetzungen.\n\nEntwickelt mit Electron.',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    // Add macOS specific menu items
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.name,
            submenu: [
                { label: 'Über ' + app.name, role: 'about' },
                { type: 'separator' },
                { label: 'Dienste', role: 'services' },
                { type: 'separator' },
                { label: app.name + ' ausblenden', accelerator: 'Command+H', role: 'hide' },
                { label: 'Andere ausblenden', accelerator: 'Command+Alt+H', role: 'hideOthers' },
                { label: 'Alle einblenden', role: 'unhide' },
                { type: 'separator' },
                { label: 'Beenden', accelerator: 'Command+Q', click: () => { app.quit(); } }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await initDB();
    createWindow();
});

// IPC handlers for database operations
ipcMain.handle('get-verse', async (event, bookName, chapter, verse) => {
    return getVerse(bookName, chapter, verse);
});

ipcMain.handle('get-verse-translation', async (event, bookName, chapter, verse, translation) => {
    return getVerseTranslation(bookName, chapter, verse, translation);
});

ipcMain.handle('get-translations', async () => {
    return getTranslations();
});

ipcMain.handle('get-stats', async () => {
    return getStats();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Security: Prevent navigation to external sites
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Allow only file:// protocol
        if (parsedUrl.protocol !== 'file:') {
            event.preventDefault();
        }
    });
});
