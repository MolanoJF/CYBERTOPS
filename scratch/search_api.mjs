import fs from 'fs';
import path from 'path';

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, query);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.mjs') || file.endsWith('.html'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(query)) {
        console.log(`Found "${query}" in ${fullPath}`);
        // print lines
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(query)) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log("Searching for '/api/session/' in src...");
searchDir('./src', '/api/session');
console.log("Searching for '/api/session/' in root...");
searchDir('.', '/api/session');
