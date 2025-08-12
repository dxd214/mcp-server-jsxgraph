const http = require('http');
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting MCP Server JSXGraph (Simple Version)...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || '3000');

// First, build the project
console.log('📦 Building project...');
exec('npm install && npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
  
  console.log('✅ Build completed');
  console.log('📄 Build output:', stdout);
  
  // Now start the MCP server
  try {
    const { runHTTPStreamableServer } = require('./build/server.js');
    const port = parseInt(process.env.PORT || '3000');
    const endpoint = '/mcp';
    
    console.log(`🌐 Starting MCP server on 0.0.0.0:${port}${endpoint}`);
    
    runHTTPStreamableServer(endpoint, port)
      .then(() => {
        console.log('✅ MCP Server started successfully!');
        console.log(`🔗 Health check: https://${process.env.REPL_SLUG || 'localhost'}.${process.env.REPL_OWNER || 'local'}.repl.co/health`);
        console.log(`🔗 MCP endpoint: https://${process.env.REPL_SLUG || 'localhost'}.${process.env.REPL_OWNER || 'local'}.repl.co/mcp`);
      })
      .catch((error) => {
        console.error('❌ Failed to start MCP server:', error);
        process.exit(1);
      });
      
  } catch (error) {
    console.error('❌ Failed to load MCP server:', error);
    process.exit(1);
  }
});

// Fallback HTTP server in case of issues
const fallbackServer = http.createServer((req, res) => {
  const url = req.url;
  
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'building',
      message: 'MCP Server is building...',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'JSXGraph MCP Server',
      status: 'initializing',
      endpoints: {
        health: '/health',
        mcp: '/mcp'
      }
    }));
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('MCP Server is starting...');
});

// Start fallback server immediately
const fallbackPort = parseInt(process.env.PORT || '3000');
fallbackServer.listen(fallbackPort, '0.0.0.0', () => {
  console.log(`🔄 Fallback server listening on 0.0.0.0:${fallbackPort}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Shutting down...');
  fallbackServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Shutting down...');
  fallbackServer.close();
  process.exit(0);
});
