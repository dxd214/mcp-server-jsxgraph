#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build status...');

// Check if build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory does not exist');
  process.exit(1);
}

// Check if main files exist
const requiredFiles = [
  'build/index.js',
  'build/server.js',
  'build/utils/httpServer.js',
  'build/services/streamable.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✅ All required files exist');
  
  // Try to require the server module
  try {
    const server = require('./build/server.js');
    console.log('✅ Server module loads successfully');
    console.log('Available exports:', Object.keys(server));
  } catch (error) {
    console.log('❌ Server module failed to load:', error.message);
    process.exit(1);
  }
} else {
  console.log('❌ Some required files are missing');
  process.exit(1);
}
