const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:3333')) {
        console.log(`Fixing ${file}`);
        // Replace with dynamic env check
        const newContent = content.replace(/http:\/\/localhost:3333/g, '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100"}');
        fs.writeFileSync(file, newContent);
    }
});
console.log('All 3333 references purged.');
