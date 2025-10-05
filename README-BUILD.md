# Bibel Vergleich - Build Instructions

## Windows Executable erstellen

### Voraussetzungen
- Node.js installiert
- npm installiert

### Build-Schritte

1. **Abhängigkeiten installieren:**
```bash
npm install
```

2. **Windows Executable erstellen:**
```bash
npm run build:win
```

Die fertige Windows-Anwendung wird im `dist/` Ordner erstellt:
- `Bibel Vergleich Setup.exe` - Installer für Windows
- `Bibel Vergleich.exe` - Portable Version (in einem Unterordner)

### Alternative Build-Optionen

- **Nur für Mac:** `npm run build:mac`
- **Nur für Linux:** `npm run build:linux`
- **Für alle Plattformen:** `npm run build:all`

### Entwicklung

- **Electron App starten:** `npm start`
- **Web-Server für Browser-Test:** `npm run dev` (öffne dann http://localhost:3000)

## Hinweise

Die App benötigt eine Internetverbindung, um Bibeltexte von der Bolls API zu laden.

Die gebaute Windows-EXE wird etwa 150-200 MB groß sein, da sie die komplette Electron-Runtime enthält.

## Icon

Um ein eigenes Icon zu verwenden, ersetzen Sie die Datei `assets/icon.png` durch Ihr eigenes Bild (512x512 px empfohlen).

Für Windows: Konvertieren Sie das PNG zu ICO und speichern Sie es als `assets/icon.ico`
Für Mac: Konvertieren Sie das PNG zu ICNS und speichern Sie es als `assets/icon.icns`
