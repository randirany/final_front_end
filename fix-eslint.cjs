const fs = require('fs');
const path = require('path');

const srcDir = './src';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove unused React import when only JSX is used
    if (content.includes("import React") && !content.match(/React\.[A-Za-z]/)) {
        content = content.replace(/import React,?\s*{?/, 'import {');
        content = content.replace(/import React from ['"']react['"];\s*\n/, '');
        content = content.replace(/import React, {/, 'import {');
        modified = true;
    }

    // Fix empty catch blocks and unused error variables
    content = content.replace(/catch\s*\(\s*\w+\s*\)\s*{\s*}/g, 'catch {\n            // Handle error silently\n        }');
    content = content.replace(/catch\s*\(\s*(\w+)\s*\)\s*{\s*\/\/\s*Handle error silently\s*\n\s*}/g, 'catch {\n            // Handle error silently\n        }');
    modified = true;

    // Fix for to htmlFor
    content = content.replace(/\sfor="/g, ' htmlFor="');
    modified = true;

    // Fix SVG attributes
    content = content.replace(/fill-rule=/g, 'fillRule=');
    content = content.replace(/clip-rule=/g, 'clipRule=');
    modified = true;

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            traverseDirectory(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            fixFile(filePath);
        }
    });
}

console.log('Starting automated ESLint fixes...');
traverseDirectory(srcDir);
console.log('Automated fixes complete!');