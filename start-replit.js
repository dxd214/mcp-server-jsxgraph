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

// Import and run the main server
const { runHTTPStreamableServer } = require('./build/server.js');

const port = parseInt(process.env.PORT);
const endpoint = '/mcp';

console.log(`🌐 Starting HTTP Streamable server on 0.0.0.0:${port}${endpoint}`);

runHTTPStreamableServer(endpoint, port)
  .then(() => {
    console.log('✅ MCP Server started successfully!');
    console.log(`🔗 Access URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co${endpoint}`);
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
