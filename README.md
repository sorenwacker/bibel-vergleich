# Bibel Vergleich

Desktop-App zum parallelen Vergleichen deutscher Bibelübersetzungen.

## Features

- 📖 6 deutsche Bibelübersetzungen parallel vergleichen:
  - Luther 1912
  - Elberfelder 1871
  - Schlachter 1951
  - Schlachter 2000
  - Menge-Bibel
  - Hoffnung für Alle
- 📚 Alle 66 Bibelbücher verfügbar (Altes und Neues Testament)
- 🎨 VS Code-inspiriertes Darkmode-Design
- ⌨️ Keyboard-Navigation (Pfeiltasten für Kapitel/Vers)
- 💾 State-Persistenz (letzte Auswahl wird automatisch geladen)
- 🔌 Offline-Support via Service Worker
- 📊 Responsive Layout mit Side-by-side Vergleich
- 🖥️ Native Desktop-App (Windows, macOS, Linux)

## Installation & Entwicklung

### Voraussetzungen
- Node.js (v14 oder höher)
- npm

### Setup

```bash
# Dependencies installieren
npm install
```

## Verwendung

### Entwicklungsserver starten

```bash
npm run dev
```

Öffne dann http://localhost:3000 im Browser.

### Electron-App starten

```bash
npm start
```

### Desktop-App bauen

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux

# Alle Plattformen
npm run build:all
```

Die fertigen Apps befinden sich im `dist/` Ordner.

## Bedienung

1. **Buch auswählen**: Wähle ein Bibelbuch aus der Dropdown-Liste
2. **Kapitel/Vers eingeben**: Gib Kapitel und Vers ein
3. **Übersetzungen wählen**: Wähle gewünschte Übersetzungen aus
4. **Vergleichen**: Die Vergleichsansicht lädt automatisch

### Keyboard-Shortcuts

- `←` / `→` : Vorheriges / Nächstes Kapitel
- `↑` / `↓` : Vorheriger / Nächster Vers

## Technologie

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Desktop**: Electron
- **API**: [Bolls.life Bible API](https://bolls.life)
- **Offline**: Service Worker für Caching

## Lizenz

MIT
