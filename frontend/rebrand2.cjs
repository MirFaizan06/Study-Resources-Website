const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    content = content.replace(/NotesHub Kashmir/gi, 'U.N.I.T.');
    content = content.replace(/NotesHub/gi, 'U.N.I.T.');
    content = content.replace(/noteshubkashmir\.in/g, 'unit.in');
    
    if (filePath.includes('i18n') || filePath.includes('locales') || filePath.includes('Navbar') || filePath.includes('Footer') || filePath.includes('index.html') || filePath.includes('en.ts')) {
        content = content.replace(/'Board'/g, "'Node'");
        content = content.replace(/"Board"/g, '"Node"');
        content = content.replace(/>Board</g, '>Node<');
        content = content.replace(/board: 'Board'/g, `board: 'Node'`);
        content = content.replace(/title: 'Student Board'/g, `title: 'Student Node'`);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.html') || fullPath.endsWith('.scss')) {
            replaceInFile(fullPath);
        }
    }
}

console.log('Starting replacements...');
traverse('C:\\Users\\Faizan\\Desktop\\NotesWebsite\\frontend\\src');
replaceInFile('C:\\Users\\Faizan\\Desktop\\NotesWebsite\\frontend\\index.html');
console.log('Finished Replacements');
