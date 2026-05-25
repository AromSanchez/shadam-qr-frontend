const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app', '(admin)', 'dashboard');

const replacements = [
  { regex: /bg-gradient-to-r from-orange-50 to-white/g, replacement: 'bg-muted/40' },
  { regex: /border-orange-50/g, replacement: 'border-border' },
  { regex: /hover:bg-orange-50\/40/g, replacement: 'hover:bg-muted/40' },
  { regex: /hover:bg-orange-50\/50/g, replacement: 'hover:bg-muted/50' },
  { regex: /bg-orange-50\/50/g, replacement: 'bg-muted/50' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log("Done updating headers.");
