#!/usr/bin/env node

// Replit-specific startup script
console.log('🚀 Starting MCP Server JSXGraph for Replit...');

// Set environment variables for Replit
process.env.NODE_ENV = 'production';

// Ensure port is set
if (!process.env.PORT) {
  process.env.PORT = '3000';
  console.log('⚠️  PORT not set, defaulting to 3000');
} else {
  console.log('✅ PORT set to:', process.env.PORT);
}

// First build the project
console.log('🔨 Building project...');
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Import and run the main server
const { runHTTPStreamableServer } = require('./build/server.js');

const port = parseInt(process.env.PORT);
const endpoint = '/mcp';

console.log(`🌐 Starting HTTP Streamable server on 0.0.0.0:${port}${endpoint}`);
console.log(`📋 Health check endpoint: http://0.0.0.0:${port}/`);

runHTTPStreamableServer(endpoint, port)
  .then(() => {
    console.log('✅ MCP Server started successfully!');
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      console.log(`🔗 Access URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co${endpoint}`);
      console.log(`🏥 Health check: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/`);
    }
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Keep the process alive
process.on('SIGINT', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});
