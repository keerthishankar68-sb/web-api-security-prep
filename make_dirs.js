const fs = require('fs');
const path = require('path');

fs.mkdirSync('src/types', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });
fs.mkdirSync('src/styles', { recursive: true });
fs.mkdirSync('src/hooks', { recursive: true });
fs.mkdirSync('public/data', { recursive: true });

console.log('Directories created');
