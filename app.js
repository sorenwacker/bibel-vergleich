// Bible book name mappings to Bolls API codes
const bookMappings = {
    '1.Mose': 'Genesis',
    '2.Mose': 'Exodus',
    '3.Mose': 'Leviticus',
    '4.Mose': 'Numbers',
    '5.Mose': 'Deuteronomy',
    'Josua': 'Joshua',
    'Richter': 'Judges',
    'Rut': 'Ruth',
    '1.Samuel': '1 Samuel',
    '2.Samuel': '2 Samuel',
    '1 Koenige': '1 Kings',
    '2 Koenige': '2 Kings',
    '1.Chronik': '1 Chronicles',
    '2.Chronik': '2 Chronicles',
    'Esra': 'Ezra',
    'Nehemia': 'Nehemiah',
    'Ester': 'Esther',
    'Job': 'Job',
    'Psalm': 'Psalms',
    'Sprueche': 'Proverbs',
    'Prediger': 'Ecclesiastes',
    'Hohelied': 'Song of Solomon',
    'Jesaja': 'Isaiah',
    'Jeremia': 'Jeremiah',
    'Klagelieder': 'Lamentations',
    'Hesekiel': 'Ezekiel',
    'Daniel': 'Daniel',
    'Hosea': 'Hosea',
    'Joel': 'Joel',
    'Amos': 'Amos',
    'Obadja': 'Obadiah',
    'Jona': 'Jonah',
    'Mica': 'Micah',
    'Nahum': 'Nahum',
    'Habakuk': 'Habakkuk',
    'Zephanja': 'Zephaniah',
    'Haggai': 'Haggai',
    'Sacharja': 'Zechariah',
    'Maleachi': 'Malachi',
    'Matthaeus': 'Matthew',
    'Markus': 'Mark',
    'Lukas': 'Luke',
    'Johannes': 'John',
    'Apostelgeschichte': 'Acts',
    'Roemers': 'Romans',
    '1.Korinther': '1 Corinthians',
    '2.Korinther': '2 Corinthians',
    'Galater': 'Galatians',
    'Epheser': 'Ephesians',
    'Philipper': 'Philippians',
    'Kolosser': 'Colossians',
    '1.Thessalonicher': '1 Thessalonians',
    '2.Thessalonicher': '2 Thessalonians',
    '1.Timotheus': '1 Timothy',
    '2.Timotheus': '2 Timothy',
    'Titus': 'Titus',
    'Philemon': 'Philemon',
    'Hebraeer': 'Hebrews',
    'Jakobus': 'James',
    '1.Petrus': '1 Peter',
    '2.Petrus': '2 Peter',
    '1.Johannes': '1 John',
    '2.Johannes': '2 John',
    '3.Johannes': '3 John',
    'Judas': 'Jude',
    'Offenbarung': 'Revelation'
};

const translationNames = {
    'MB': 'Menge-Bibel',
    'ELB': 'Elberfelder 1871',
    'SCH': 'Schlachter 1951',
    'S00': 'Schlachter 2000',
    'LUT': 'Luther 1912',
    'HFA': 'Hoffnung für Alle'
};

// Bible structure - chapters per book
const bibleStructure = {
    '1.Mose': 50, '2.Mose': 40, '3.Mose': 27, '4.Mose': 36, '5.Mose': 34,
    'Josua': 24, 'Richter': 21, 'Rut': 4, '1.Samuel': 31, '2.Samuel': 24,
    '1 Koenige': 22, '2 Koenige': 25, '1.Chronik': 29, '2.Chronik': 36,
    'Esra': 10, 'Nehemia': 13, 'Ester': 10, 'Job': 42, 'Psalm': 150,
    'Sprueche': 31, 'Prediger': 12, 'Hohelied': 8, 'Jesaja': 66,
    'Jeremia': 52, 'Klagelieder': 5, 'Hesekiel': 48, 'Daniel': 12,
    'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadja': 1, 'Jona': 4,
    'Mica': 7, 'Nahum': 3, 'Habakuk': 3, 'Zephanja': 3, 'Haggai': 2,
    'Sacharja': 14, 'Maleachi': 4, 'Matthaeus': 28, 'Markus': 16,
    'Lukas': 24, 'Johannes': 21, 'Apostelgeschichte': 28, 'Roemers': 16,
    '1.Korinther': 16, '2.Korinther': 13, 'Galater': 6, 'Epheser': 6,
    'Philipper': 4, 'Kolosser': 4, '1.Thessalonicher': 5, '2.Thessalonicher': 3,
    '1.Timotheus': 6, '2.Timotheus': 4, 'Titus': 3, 'Philemon': 1,
    'Hebraeer': 13, 'Jakobus': 5, '1.Petrus': 5, '2.Petrus': 3,
    '1.Johannes': 5, '2.Johannes': 1, '3.Johannes': 1, 'Judas': 1,
    'Offenbarung': 22
};

// Cache for chapter data
const chapterCache = {};

// Clear cache on page load to ensure fresh data
Object.keys(chapterCache).forEach(key => delete chapterCache[key]);

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sanitize HTML to only allow safe formatting tags
function sanitizeHtml(text) {
    // Only allow <i> and <b> tags, strip everything else
    const div = document.createElement('div');
    div.innerHTML = text;

    // Get all elements and only keep i and b tags
    const allowedTags = ['I', 'B', 'EM', 'STRONG'];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT);
    const nodesToReplace = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!allowedTags.includes(node.tagName)) {
            nodesToReplace.push(node);
        }
    }

    // Replace disallowed tags with their text content
    nodesToReplace.forEach(node => {
        const textNode = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(textNode, node);
    });

    return div.innerHTML;
}

// Sanitize and validate input
function sanitizeInput(value, type = 'text') {
    if (type === 'number') {
        const num = parseInt(value);
        return isNaN(num) ? 1 : Math.max(1, num);
    }
    return String(value).trim();
}

// Get DOM elements
const compareBtn = document.getElementById('compareBtn');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const bookSelect = document.getElementById('book');
const chapterInput = document.getElementById('chapter');
const verseInput = document.getElementById('verse');
const prevChapterBtn = document.getElementById('prevChapterBtn');
const nextChapterBtn = document.getElementById('nextChapterBtn');
const prevVerseBtn = document.getElementById('prevVerseBtn');
const nextVerseBtn = document.getElementById('nextVerseBtn');

// Update chapter max when book changes
bookSelect.addEventListener('change', () => {
    updateChapterMax();
});

// Update verse max when chapter changes or book changes
chapterInput.addEventListener('input', () => {
    const maxChapters = bibleStructure[bookSelect.value] || 150;
    const currentChapter = parseInt(chapterInput.value);
    if (currentChapter > maxChapters) {
        chapterInput.value = maxChapters;
    }
});

function updateChapterMax() {
    const book = bookSelect.value;
    const maxChapters = bibleStructure[book] || 150;
    chapterInput.max = maxChapters;

    // Only reset chapter to 1 if current is too high (but don't reset valid values)
    const currentChapter = parseInt(chapterInput.value);
    if (currentChapter > maxChapters) {
        chapterInput.value = maxChapters;
    } else if (!currentChapter || currentChapter < 1) {
        chapterInput.value = 1;
    }
}

// Navigation button handlers
prevChapterBtn.addEventListener('click', () => {
    const currentChapter = parseInt(chapterInput.value);
    if (currentChapter > 1) {
        chapterInput.value = currentChapter - 1;
        verseInput.value = 1;
        saveState();
        compareBibles();
    }
});

nextChapterBtn.addEventListener('click', () => {
    const currentChapter = parseInt(chapterInput.value);
    const maxChapters = bibleStructure[bookSelect.value] || 150;
    if (currentChapter < maxChapters) {
        chapterInput.value = currentChapter + 1;
        verseInput.value = 1;
        saveState();
        compareBibles();
    }
});

prevVerseBtn.addEventListener('click', () => {
    const currentVerse = parseInt(verseInput.value);
    if (currentVerse > 1) {
        verseInput.value = currentVerse - 1;
        saveState();
        compareBibles();
    }
});

nextVerseBtn.addEventListener('click', () => {
    const currentVerse = parseInt(verseInput.value);
    verseInput.value = currentVerse + 1;
    saveState();
    compareBibles();
});

// Add event listeners with smooth interactions
compareBtn.addEventListener('click', () => {
    compareBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        compareBtn.style.transform = '';
        compareBibles();
    }, 100);
});

// Allow Enter key to trigger comparison
[bookSelect, chapterInput, verseInput].forEach(element => {
    element.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            compareBibles();
        }
    });
});

// Add input animation effects
[chapterInput, verseInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.style.transform = 'scale(1.02)';
    });
    input.addEventListener('blur', () => {
        input.style.transform = '';
    });
});

// Load saved state from localStorage
function loadSavedState() {
    try {
        const savedState = localStorage.getItem('bibelVergleichState');
        if (savedState) {
            const state = JSON.parse(savedState);

            // Restore book, chapter, verse
            if (state.book) bookSelect.value = state.book;
            if (state.chapter) chapterInput.value = state.chapter;
            if (state.verse) verseInput.value = state.verse;

            // Restore selected translations
            if (state.translations && Array.isArray(state.translations)) {
                const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.checked = state.translations.includes(cb.value);
                });
            }

            console.log('Saved state loaded:', state);
            return true; // Indicate that state was loaded
        }
        return false; // No saved state
    } catch (error) {
        console.error('Error loading saved state:', error);
        return false;
    }
}

// Save current state to localStorage
function saveState() {
    try {
        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
        const selectedTranslations = Array.from(checkboxes).map(cb => cb.value);

        const state = {
            book: bookSelect.value,
            chapter: parseInt(chapterInput.value),
            verse: parseInt(verseInput.value),
            translations: selectedTranslations
        };

        localStorage.setItem('bibelVergleichState', JSON.stringify(state));
        console.log('State saved:', state);
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

// Save state when inputs change
bookSelect.addEventListener('change', saveState);
chapterInput.addEventListener('change', saveState);
verseInput.addEventListener('change', saveState);

// Save state when translations change
document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveState);
});

// Load saved state FIRST
const hadSavedState = loadSavedState();

// Initialize chapter max on load (after state is loaded)
updateChapterMax();

// Auto-load comparison if we had saved state
if (hadSavedState) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        compareBibles();
    }, 100);
}

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✓ Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('✗ Service Worker registration failed:', error);
            });
    });
}

// Global state for smooth verse navigation
let lastLoadedBook = null;
let lastLoadedChapter = null;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
    }

    // Arrow Up/Down - navigate verses
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentVerse = parseInt(verseInput.value);
        const currentChapter = parseInt(chapterInput.value);

        if (currentVerse > 1) {
            verseInput.value = currentVerse - 1;
            saveState();
            navigateToVerse();
        } else if (currentChapter > 1) {
            // At verse 1, go to previous chapter
            chapterInput.value = currentChapter - 1;
            verseInput.value = 999; // Will be clamped to last verse
            saveState();
            compareBibles();
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentVerse = parseInt(verseInput.value);
        const currentChapter = parseInt(chapterInput.value);
        const maxChapters = bibleStructure[bookSelect.value] || 150;

        // Check if we're at the last verse of current chapter
        const verseRows = document.querySelectorAll('.verse-row');
        const lastVerseInChapter = verseRows.length > 0 ?
            parseInt(verseRows[verseRows.length - 1].dataset.verse) : 999;

        // Check if the next verse exists in current chapter
        const nextVerseExists = document.querySelector(`[data-verse="${currentVerse + 1}"]`);

        if (nextVerseExists) {
            verseInput.value = currentVerse + 1;
            saveState();
            navigateToVerse();
        } else if (currentChapter < maxChapters) {
            // At last verse, go to next chapter
            chapterInput.value = currentChapter + 1;
            verseInput.value = 1;
            saveState();
            compareBibles();
        }
    }

    // Arrow Left/Right - navigate chapters
    else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentChapter = parseInt(chapterInput.value);
        if (currentChapter > 1) {
            chapterInput.value = currentChapter - 1;
            verseInput.value = 1;
            saveState();
            compareBibles();
        }
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentChapter = parseInt(chapterInput.value);
        const maxChapters = bibleStructure[bookSelect.value] || 150;
        if (currentChapter < maxChapters) {
            chapterInput.value = currentChapter + 1;
            verseInput.value = 1;
            saveState();
            compareBibles();
        }
    }

    // Enter or Space - reload comparison
    else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        compareBibles();
    }

    // Ctrl/Cmd + F - focus search
    else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        verseInput.focus();
        verseInput.select();
    }
});

// Smart navigation - only reload if chapter changed, otherwise just scroll
function navigateToVerse() {
    const book = bookSelect.value;
    const chapter = parseInt(chapterInput.value);
    const targetVerse = parseInt(verseInput.value);

    // If we're in the same chapter, just update the highlight smoothly
    if (lastLoadedBook === book && lastLoadedChapter === chapter) {
        updateVerseHighlight(targetVerse);
    } else {
        // Different chapter, need to reload
        compareBibles();
    }
}

// Update verse highlight without reloading
function updateVerseHighlight(targetVerse) {
    // Remove old highlight
    const oldHighlight = document.querySelector('.verse-row-highlight');
    if (oldHighlight) {
        oldHighlight.classList.remove('verse-row-highlight');
    }

    // Add new highlight
    const newHighlight = document.querySelector(`[data-verse="${targetVerse}"]`);
    if (newHighlight) {
        newHighlight.classList.add('verse-row-highlight');
        // Scroll smoothly to new verse
        setTimeout(() => {
            newHighlight.scrollIntoView({
                block: 'center',
                behavior: 'smooth',
                inline: 'nearest'
            });
        }, 50);
    }
}

async function compareBibles() {
    const book = bookSelect.value;
    const chapter = parseInt(chapterInput.value);
    const targetVerse = parseInt(verseInput.value);

    // Store current chapter for smart navigation
    lastLoadedBook = book;
    lastLoadedChapter = chapter;

    // Get selected translations
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    const selectedTranslations = Array.from(checkboxes).map(cb => cb.value);

    if (selectedTranslations.length === 0) {
        showNotification('Bitte wählen Sie mindestens eine Übersetzung aus.', 'warning');
        return;
    }

    if (!chapter || !targetVerse) {
        showNotification('Bitte geben Sie Kapitel und Vers ein.', 'warning');
        return;
    }

    // Validate chapter number
    const maxChapters = bibleStructure[book] || 150;
    if (chapter > maxChapters) {
        showNotification(`${book} hat nur ${maxChapters} Kapitel.`, 'warning');
        chapterInput.value = maxChapters;
        return;
    }

    // Show loading with smooth fade out
    resultsDiv.style.opacity = '0';
    resultsDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        resultsDiv.innerHTML = '';
        loadingDiv.style.display = 'block';
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.style.opacity = '1';
        }, 10);
    }, 200);

    // Fetch chapter data for all translations
    const promises = selectedTranslations.map(translation =>
        fetchChapterData(book, chapter, translation)
    );

    try {
        const results = await Promise.all(promises);
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.style.display = 'none';
            displayResults(results, book, chapter, targetVerse);
            // Fade in new content with slide up
            setTimeout(() => {
                resultsDiv.style.opacity = '1';
                resultsDiv.style.transform = 'translateY(0)';
            }, 10);
        }, 150);
    } catch (error) {
        console.error('Fehler beim Abrufen der Bibeltexte:', error);
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.style.display = 'none';
            resultsDiv.innerHTML = '<div class="translation-card error"><h3>Fehler</h3><p>Beim Laden der Bibeltexte ist ein Fehler aufgetreten.</p></div>';
            resultsDiv.style.opacity = '1';
            resultsDiv.style.transform = 'translateY(0)';
        }, 150);
    }
}

async function fetchChapterData(book, chapter, translation) {
    // Map book name to Bolls API format
    const apiBookName = bookMappings[book];

    if (!apiBookName) {
        return {
            translation: translation,
            verses: [],
            success: false,
            error: `Buchname "${escapeHtml(book)}" konnte nicht zugeordnet werden.`
        };
    }

    // Check cache first
    const cacheKey = `${translation}-${apiBookName}-${chapter}`;
    if (chapterCache[cacheKey]) {
        console.log(`✓ Using cached data for ${cacheKey}`);
        return chapterCache[cacheKey];
    }

    try {
        // Fetch chapter from Bolls API with timeout
        const url = `https://bolls.life/get-text/${translation}/${apiBookName}/${chapter}/`;
        console.log(`⬇ Fetching ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            cache: 'reload', // Force fresh fetch, bypass cache
            headers: {
                'Accept': 'application/json'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Kapitel nicht gefunden`);
            } else if (response.status >= 500) {
                throw new Error(`Server-Fehler (${response.status})`);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Keine Verse gefunden');
        }

        const result = {
            translation: translation,
            verses: data,
            success: true
        };

        // Cache the result
        chapterCache[cacheKey] = result;
        console.log(`✓ Cached ${cacheKey}`);

        return result;
    } catch (error) {
        console.error(`✗ Fehler beim Abrufen von ${translation}:`, error);

        let errorMessage = 'Fehler beim Laden';
        if (error.name === 'AbortError') {
            errorMessage = 'Zeitüberschreitung';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Keine Internetverbindung';
        } else {
            errorMessage = error.message;
        }

        return {
            translation: translation,
            verses: [],
            success: false,
            error: errorMessage
        };
    }
}

function displayResults(results, book, chapter, targetVerse) {
    resultsDiv.innerHTML = '';

    // Get all unique verse numbers across all translations
    const allVerseNumbers = new Set();
    results.forEach(result => {
        if (result.success) {
            result.verses.forEach(v => allVerseNumbers.add(v.verse));
        }
    });
    const sortedVerseNumbers = Array.from(allVerseNumbers).sort((a, b) => a - b);

    // Create a container for synchronized scrolling
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'verses-scroll-container';

    // Build rows for each verse
    sortedVerseNumbers.forEach(verseNum => {
        const row = document.createElement('div');
        row.className = verseNum === targetVerse ? 'verse-row verse-row-highlight' : 'verse-row';
        row.dataset.verse = verseNum;

        // Add click handler to make verse active
        row.addEventListener('click', () => {
            verseInput.value = verseNum;
            saveState();
            updateVerseHighlight(verseNum);
        });

        // Add hover cursor
        row.style.cursor = 'pointer';

        results.forEach((result) => {
            const cell = document.createElement('div');
            cell.className = 'verse-cell';

            if (!result.success) {
                cell.innerHTML = `<span class="verse-text error">${result.error}</span>`;
            } else {
                const verseData = result.verses.find(v => v.verse === verseNum);
                if (verseData) {
                    // Sanitize HTML to allow safe formatting tags like <i>
                    const cleanText = sanitizeHtml(verseData.text);
                    cell.innerHTML = `
                        <span class="verse-number">${escapeHtml(String(verseNum))}</span>
                        <span class="verse-text">${cleanText}</span>
                    `;
                } else {
                    cell.innerHTML = `<span class="verse-number">${escapeHtml(String(verseNum))}</span><span class="verse-text">—</span>`;
                }
            }

            row.appendChild(cell);
        });

        scrollContainer.appendChild(row);
    });

    // Create header row with translation names
    const headerRow = document.createElement('div');
    headerRow.className = 'translation-header';

    results.forEach((result) => {
        const headerCell = document.createElement('div');
        headerCell.className = 'translation-header-cell';
        const translationName = translationNames[result.translation] || result.translation;
        headerCell.innerHTML = `
            <h3>${translationName}</h3>
            <div class="reference">${book} ${chapter}</div>
        `;
        headerRow.appendChild(headerCell);
    });

    resultsDiv.appendChild(headerRow);
    resultsDiv.appendChild(scrollContainer);

    // Scroll to highlighted verse with slower, custom smooth scroll
    setTimeout(() => {
        const highlightedRow = scrollContainer.querySelector('.verse-row-highlight');
        if (highlightedRow) {
            // Use smooth scroll with custom timing
            highlightedRow.scrollIntoView({
                block: 'center',
                behavior: 'smooth',
                inline: 'nearest'
            });
        }
    }, 450);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const colors = {
        'warning': 'rgba(251, 191, 36, 0.95)',
        'error': 'rgba(239, 68, 68, 0.95)',
        'info': 'rgba(99, 102, 241, 0.95)',
        'success': 'rgba(34, 197, 94, 0.95)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: 600;
        backdrop-filter: blur(10px);
        transform: translateX(400px);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 400);
    }, 3000);
}

// Add smooth transitions to results container
resultsDiv.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
loadingDiv.style.transition = 'opacity 0.2s ease';
