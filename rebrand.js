const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    // NotesHub rename
    content = content.replace(/NotesHub Kashmir/g, 'U.N.I.T.');
    content = content.replace(/NotesHub/g, 'U.N.I.T.');
    content = content.replace(/noteshubkashmir\.in/g, 'unit.in');
    
    // Board rename specifically in translation files
    // The translation files define objects. The UI strings typically have "Board".
    if (filePath.includes('i18n') || filePath.includes('locales') || filePath.includes('Navbar') || filePath.includes('Footer') || filePath.includes('index.html')) {
        content = content.replace(/'Board'/g, "'Node'");
        content = content.replace(/"Board"/g, '"Node"');
        content = content.replace(/>Board</g, '>Node<');
        content = content.replace(/nav: {([^}]*)board: 'Board'/g, `nav: {$1board: 'Node'`);
        content = content.replace(/title: 'Student Board'/g, `title: 'Student Node'`);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

function traverse(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
          if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'rebrand.js') continue;
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
              traverse(fullPath);
          } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.html') || fullPath.endsWith('.scss')) {
              replaceInFile(fullPath);
          }
      }
    } catch(e){}
}

traverse(path.join(__dirname, 'frontend'));
console.log('Done!');
