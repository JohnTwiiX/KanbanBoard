const fs = require('fs');

// Lies die `index.html`-Datei
const indexHtml = fs.readFileSync('dist/kanban-board/browser/index.html', 'utf8');

// Kopiere `index.html` zu `404.html`
fs.writeFileSync('dist/kanban-board/browser/404.html', indexHtml);
