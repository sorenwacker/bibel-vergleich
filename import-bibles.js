// Import script to load Bible JSON files into SQLite database
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bible.db');

// Bible file mappings
const bibles = [
    { file: 'bibles/luther1912.json', translation: 'LUT1912', name: 'Luther 1912' },
    { file: 'bibles/elberfelder1905.json', translation: 'ELB1905', name: 'Elberfelder 1905' },
    { file: 'bibles/schlachter1951.json', translation: 'SCH1951', name: 'Schlachter 1951' }
];

// Book name mapping (German to standardized)
const bookNameMap = {
    '1 Mose': '1.Mose',
    '2 Mose': '2.Mose',
    '3 Mose': '3.Mose',
    '4 Mose': '4.Mose',
    '5 Mose': '5.Mose',
    'Josua': 'Josua',
    'Richter': 'Richter',
    'Ruth': 'Ruth',
    '1 Samuel': '1.Samuel',
    '2 Samuel': '2.Samuel',
    '1 Könige': '1.Könige',
    '2 Könige': '2.Könige',
    '1 Chronik': '1.Chronik',
    '2 Chronik': '2.Chronik',
    'Esra': 'Esra',
    'Nehemia': 'Nehemia',
    'Ester': 'Ester',
    'Hiob': 'Hiob',
    'Psalm': 'Psalm',
    'Sprüche': 'Sprüche',
    'Prediger': 'Prediger',
    'Hohelied': 'Hohelied',
    'Jesaja': 'Jesaja',
    'Jeremia': 'Jeremia',
    'Klagelieder': 'Klagelieder',
    'Hesekiel': 'Hesekiel',
    'Daniel': 'Daniel',
    'Hosea': 'Hosea',
    'Joel': 'Joel',
    'Amos': 'Amos',
    'Obadja': 'Obadja',
    'Jona': 'Jona',
    'Micha': 'Micha',
    'Nahum': 'Nahum',
    'Habakuk': 'Habakuk',
    'Zephanja': 'Zephanja',
    'Haggai': 'Haggai',
    'Sacharja': 'Sacharja',
    'Maleachi': 'Maleachi',
    'Matthäus': 'Matthäus',
    'Markus': 'Markus',
    'Lukas': 'Lukas',
    'Johannes': 'Johannes',
    'Apostelgeschichte': 'Apostelgeschichte',
    'Römer': 'Römer',
    '1 Korinther': '1.Korinther',
    '2 Korinther': '2.Korinther',
    'Galater': 'Galater',
    'Epheser': 'Epheser',
    'Philipper': 'Philipper',
    'Kolosser': 'Kolosser',
    '1 Thessalonicher': '1.Thessalonicher',
    '2 Thessalonicher': '2.Thessalonicher',
    '1 Timotheus': '1.Timotheus',
    '2 Timotheus': '2.Timotheus',
    'Titus': 'Titus',
    'Philemon': 'Philemon',
    'Hebräer': 'Hebräer',
    'Jakobus': 'Jakobus',
    '1 Petrus': '1.Petrus',
    '2 Petrus': '2.Petrus',
    '1 Johannes': '1.Johannes',
    '2 Johannes': '2.Johannes',
    '3 Johannes': '3.Johannes',
    'Judas': 'Judas',
    'Offenbarung': 'Offenbarung'
};

console.log('🗄️  Erstelle Bibel-Datenbank...\n');

// Create database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables
console.log('📋 Erstelle Tabellen...');

db.exec(`
    CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        translation TEXT NOT NULL,
        text TEXT NOT NULL,
        UNIQUE(book, chapter, verse, translation)
    );

    CREATE INDEX IF NOT EXISTS idx_book_chapter_verse
    ON verses(book, chapter, verse);

    CREATE INDEX IF NOT EXISTS idx_translation
    ON verses(translation);
`);

// Prepare insert statement
const insertVerse = db.prepare(`
    INSERT OR REPLACE INTO verses (book, chapter, verse, translation, text)
    VALUES (?, ?, ?, ?, ?)
`);

// Import each Bible
for (const bible of bibles) {
    const filePath = path.join(__dirname, bible.file);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ Datei nicht gefunden: ${bible.file}`);
        continue;
    }

    console.log(`\n📖 Importiere ${bible.name}...`);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const verses = data.verses;

    let count = 0;
    const startTime = Date.now();

    // Begin transaction for speed
    const insertMany = db.transaction((verses) => {
        for (const verse of verses) {
            const bookName = bookNameMap[verse.book_name] || verse.book_name;

            insertVerse.run(
                bookName,
                verse.chapter,
                verse.verse,
                bible.translation,
                verse.text
            );
            count++;
        }
    });

    insertMany(verses);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ✅ ${count.toLocaleString()} Verse importiert in ${duration}s`);
}

// Print statistics
console.log('\n📊 Statistiken:');
const stats = db.prepare(`
    SELECT
        translation,
        COUNT(*) as verse_count,
        COUNT(DISTINCT book) as book_count
    FROM verses
    GROUP BY translation
    ORDER BY translation
`).all();

stats.forEach(stat => {
    console.log(`   ${stat.translation}: ${stat.verse_count.toLocaleString()} Verse, ${stat.book_count} Bücher`);
});

const total = db.prepare('SELECT COUNT(*) as total FROM verses').get();
console.log(`\n   Gesamt: ${total.total.toLocaleString()} Verse in der Datenbank`);

db.close();

console.log('\n✨ Import abgeschlossen!\n');
console.log(`📁 Datenbank: ${DB_PATH}`);
console.log(`📦 Größe: ${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2)} MB\n`);
