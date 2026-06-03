// Copies the Phaser runtime into www/js so the game works fully offline inside the APK.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'phaser', 'dist', 'phaser.min.js');
const destDir = path.join(__dirname, '..', 'www', 'js');
const dest = path.join(destDir, 'phaser.min.js');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied phaser.min.js ->', dest);
