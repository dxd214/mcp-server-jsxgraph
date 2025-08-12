#!/usr/bin/env node

// Vercel-specific server that runs in streamable mode
const { runHTTPStreamableServer } = require('./build/server.js');

// Force environment settings for Vercel
process.env.NODE_ENV = 'production';

console.log('=== MCP Server JSXGraph Starting (Vercel) ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port from ENV:', process.env.PORT || 3000);
console.log('Transport: streamable (forced)');
console.log('Endpoint: /mcp');

// Always run in streamable mode for Vercel
const port = Number.parseInt(process.env.PORT || "3000", 10);
runHTTPStreamableServer("/mcp", port).catch(console.error);