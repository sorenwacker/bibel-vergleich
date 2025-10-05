// Convert SQLite database to JSON format for web app
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('bible.db', { readonly: true });

console.log('📖 Konvertiere SQLite zu JSON...\n');

// Get all unique books
const books = db.prepare(`
    SELECT DISTINCT book, MIN(rowid) as sort_order
    FROM verses
    GROUP BY book
    ORDER BY sort_order
`).all();

const bibleData = {
    books: []
};

for (const { book } of books) {
    console.log(`   ${book}...`);

    const bookData = {
        name: book,
        chapters: []
    };

    // Get all chapters for this book
    const chapters = db.prepare(`
        SELECT DISTINCT chapter
        FROM verses
        WHERE book = ?
        ORDER BY chapter
    `).all(book);

    for (const { chapter } of chapters) {
        const chapterData = {
            number: chapter,
            verses: []
        };

        // Get all verses for this chapter
        const verses = db.prepare(`
            SELECT DISTINCT verse
            FROM verses
            WHERE book = ? AND chapter = ?
            ORDER BY verse
        `).all(book, chapter);

        for (const { verse } of verses) {
            // Get all translations for this verse
            const translations = db.prepare(`
                SELECT translation, text
                FROM verses
                WHERE book = ? AND chapter = ? AND verse = ?
            `).all(book, chapter, verse);

            const translationObj = {};
            translations.forEach(t => {
                translationObj[t.translation] = t.text;
            });

            chapterData.verses.push({
                number: verse,
                translations: translationObj
            });
        }

        bookData.chapters.push(chapterData);
    }

    bibleData.books.push(bookData);
}

// Write to file
const outputPath = path.join(__dirname, 'database.json');
fs.writeFileSync(outputPath, JSON.stringify(bibleData, null, 2));

const stats = fs.statSync(outputPath);
console.log(`\n✅ Fertig!`);
console.log(`📁 Datei: ${outputPath}`);
console.log(`📦 Größe: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`📚 Bücher: ${bibleData.books.length}`);

db.close();
