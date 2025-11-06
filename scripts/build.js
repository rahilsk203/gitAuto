#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Building gitAuto...');

// Ensure the dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy necessary files to dist
const filesToCopy = [
  'index.js',
  'package.json',
  'README.md',
  'LICENSE',
  '.gitignore'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, '../', file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  }
});

// Copy lib directory
const libDir = path.join(__dirname, '../lib');
const destLibDir = path.join(distDir, 'lib');

if (fs.existsSync(libDir)) {
  // Create lib directory in dist
  if (!fs.existsSync(destLibDir)) {
    fs.mkdirSync(destLibDir);
  }
  
  // Copy all files in lib
  const libFiles = fs.readdirSync(libDir);
  libFiles.forEach(file => {
    const srcPath = path.join(libDir, file);
    const destPath = path.join(destLibDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied lib/${file}`);
  });
}

console.log('Build completed successfully!');