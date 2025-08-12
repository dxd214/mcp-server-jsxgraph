#!/usr/bin/env node

// Simple, reliable Replit server
const http = require('http');
const port = parseInt(process.env.PORT || '3000');

console.log('🚀 Starting Replit MCP Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', port);

// Create simple HTTP server
const server = http.createServer((req, res) => {
  const start = Date.now();
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }
  
  console.log(`${req.method} ${req.url}`);
  
  // Health check - root endpoint
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      name: "JSXGraph MCP Server",
      version: "0.0.1",
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      endpoints: { mcp: "/mcp", sse: "/sse" },
      protocol: "MCP 1.0"
    }));
    console.log(`✅ Health check responded in ${Date.now() - start}ms`);
    return;
  }
  
  // Health endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ status: "OK", uptime: process.uptime() }));
    return;
  }
  
  // Ping endpoint
  if (req.method === 'GET' && req.url === '/ping') {
    res.writeHead(200);
    res.end('pong');
    return;
  }
  
  // Simple MCP info for now
  if (req.url === '/mcp') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      message: "MCP Server is running",
      note: "Full MCP functionality requires proper client initialization",
      endpoints: { health: "/", ping: "/ping" }
    }));
    return;
  }
  
  // 404 for others
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${port}`);
  console.log(`🏥 Health check: http://0.0.0.0:${port}/`);
  console.log(`📋 Ready for Replit!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');  
  server.close(() => process.exit(0));
});