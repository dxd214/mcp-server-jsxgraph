const http = require('http');

// Replit Autoscale optimizations
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Required for Replit Autoscale

console.log('🚀 Replit Autoscale Server Starting...');
console.log(`Port: ${port} (internal) -> 80 (external)`);
console.log('Host: 0.0.0.0 (Replit requirement)');

// Ultra-fast health check handler
const server = http.createServer((req, res) => {
  // Skip logging for health checks to improve performance
  if (req.url !== '/') {
    console.log(`${req.method} ${req.url}`);
  }
  
  // Replit Autoscale health check endpoint
  if (req.url === '/') {
    // Add headers that Replit might expect
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', '2');
    res.setHeader('Cache-Control', 'no-cache');
    res.end('OK');
    return;
  }
  
  // Basic MCP info endpoint
  if (req.url === '/mcp' && req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end('{"name":"JSXGraph MCP Server","status":"running","protocol":"MCP"}');
    return;
  }
  
  // 404 for everything else
  res.statusCode = 404;
  res.end('Not Found');
});

// Optimize server settings for Replit Autoscale
server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;

server.listen(port, host, () => {
  console.log(`✅ Server listening on ${host}:${port}`);
  console.log('🎯 Optimized for Replit Autoscale deployment');
  console.log('🏥 Health check endpoint: / (returns 200 OK)');
  console.log('🔗 MCP info endpoint: /mcp');
  console.log('📋 Ready for Autoscale traffic!');
  
  // Keep-alive mechanism to prevent premature exit
  setInterval(() => {
    // Silent heartbeat - no console output to avoid spam
  }, 30000); // 30 seconds
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is in use. Replit may be restarting.`);
  }
  process.exit(1);
});

// Graceful shutdown for Replit Autoscale scaling
process.on('SIGTERM', () => {
  console.log('📊 SIGTERM: Autoscale scaling down...');
  server.close(() => {
    console.log('👋 Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⛔ SIGINT: Manual shutdown...');
  server.close(() => process.exit(0));
});