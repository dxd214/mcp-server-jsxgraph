#!/usr/bin/env node

// Simple health check server for Replit that starts immediately
const http = require('http');

const port = parseInt(process.env.PORT || '3000');

console.log('🚀 Starting simple health check server...');

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }
  
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  // Health check endpoints
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200).end(JSON.stringify({
      name: "JSXGraph MCP Server",
      status: "healthy",
      version: "0.0.1", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      endpoints: {
        mcp: "/mcp",
        sse: "/sse"
      },
      protocol: "MCP 1.0"
    }));
    return;
  }
  
  // Ping endpoint
  if (req.method === 'GET' && req.url === '/ping') {
    res.writeHead(200).end('pong');
    return;
  }
  
  // For MCP endpoints, we need to start the full server
  if (req.url === '/mcp' || req.url === '/sse') {
    // Try to load the full server
    try {
      console.log('🔨 Loading full MCP server for:', req.url);
      
      // Check if build exists, if not build first
      const fs = require('fs');
      if (!fs.existsSync('./build/server.js')) {
        console.log('📦 Building project first...');
        const { execSync } = require('child_process');
        execSync('npm run build', { stdio: 'inherit' });
      }
      
      const { runHTTPStreamableServer } = require('./build/server.js');
      
      // Close this simple server and start the full one
      server.close(() => {
        console.log('🔄 Switching to full MCP server...');
        runHTTPStreamableServer('/mcp', port).catch(console.error);
      });
      
      // Send temporary response
      res.writeHead(503).end('Server switching to full MCP mode...');
      return;
      
    } catch (error) {
      console.error('❌ Failed to start full server:', error);
      res.writeHead(500).end('Failed to start MCP server');
      return;
    }
  }
  
  // 404 for other requests
  res.writeHead(404).end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Simple health server running on 0.0.0.0:${port}`);
  console.log(`🏥 Health check: http://0.0.0.0:${port}/`);
  console.log(`📋 Ready for Replit health checks!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully...');
  server.close(() => process.exit(0));
});