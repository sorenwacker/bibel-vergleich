// Database module for Electron main process using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

// Initialize database
function initDB() {
    const dbPath = path.join(__dirname, 'bible.db');

    db = new Database(dbPath, { readonly: true });
    db.pragma('journal_mode = WAL');

    console.log('Database initialized at:', dbPath);
    return db;
}

// Get verse from database
function getVerse(bookName, chapter, verse) {
    if (!db) {
        initDB();
    }

    // Try all available translations
    const query = db.prepare(`
        SELECT translation, text
        FROM verses
        WHERE book = ? AND chapter = ? AND verse = ?
        ORDER BY translation
    `);

    const results = query.all(bookName, chapter, verse);

    if (results.length === 0) {
        return null;
    }

    // Build translations object
    const translations = {};
    results.forEach(row => {
        translations[row.translation] = row.text;
    });

    return {
        number: verse,
        translations: translations
    };
}

// Get verse for specific translation
function getVerseTranslation(bookName, chapter, verse, translation) {
    if (!db) {
        initDB();
    }

    const query = db.prepare(`
        SELECT text
        FROM verses
        WHERE book = ? AND chapter = ? AND verse = ? AND translation = ?
        LIMIT 1
    `);

    const result = query.get(bookName, chapter, verse, translation);
    return result ? result.text : null;
}

// Get all available translations
function getTranslations() {
    if (!db) {
        initDB();
    }

    const query = db.prepare(`
        SELECT DISTINCT translation
        FROM verses
        ORDER BY translation
    `);

    return query.all().map(row => row.translation);
}

// Get statistics
function getStats() {
    if (!db) {
        initDB();
    }

    const query = db.prepare(`
        SELECT
            translation,
            COUNT(*) as verse_count,
            COUNT(DISTINCT book) as book_count
        FROM verses
        GROUP BY translation
        ORDER BY translation
    `);

    return query.all();
}

module.exports = {
    initDB,
    getVerse,
    getVerseTranslation,
    getTranslations,
    getStats
};
