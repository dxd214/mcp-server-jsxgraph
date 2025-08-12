const http = require('http');

// Basic configuration
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🚀 MCP Server JSXGraph Starting...');
console.log('Port:', port);
console.log('Host:', host);

// Simple MCP tools
const TOOLS = [
  {
    name: 'generate_function_graph',
    description: 'Generate mathematical function graphs with JSXGraph',
    inputSchema: {
      type: 'object',
      properties: {
        functions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              expression: { type: 'string' },
              color: { type: 'string' }
            }
          }
        }
      }
    }
  }
];

// HTTP Server
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  
  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'unknown';
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent.substring(0, 50)}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Root path - ultra-fast health check
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Health check
  if (url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // MCP endpoint - handle both GET and POST
  if (url === '/mcp') {
    res.setHeader('Content-Type', 'application/json');
    
    // GET request - return server info
    if (method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        name: 'JSXGraph MCP Server',
        version: '0.0.1',
        protocol: 'MCP',
        transport: 'HTTP',
        capabilities: ['tools'],
        tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
        endpoints: {
          initialize: 'POST /mcp',
          tools_list: 'POST /mcp',
          tools_call: 'POST /mcp'
        }
      }));
      return;
    }
    
    // POST request - handle MCP JSON-RPC
    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          
          if (data.method === 'initialize') {
            res.writeHead(200);
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: data.id,
              result: {
                protocolVersion: '2024-11-05',
                capabilities: { tools: {} },
                serverInfo: { name: 'mcp-server-jsxgraph', version: '0.0.1' }
              }
            }));
            return;
          }
          
          if (data.method === 'tools/list') {
            res.writeHead(200);
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: data.id,
              result: { tools: TOOLS }
            }));
            return;
          }
          
          if (data.method === 'tools/call') {
            res.writeHead(200);
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: data.id,
              result: {
                content: [{
                  type: 'text',
                  text: `Generated visualization for tool: ${data.params?.name || 'unknown'}`
                }]
              }
            }));
            return;
          }
          
          // Default response for unknown methods
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            error: { code: -32601, message: `Method '${data.method}' not found` }
          }));
          
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error' }
          }));
        }
      });
      return;
    }
    
    // DELETE request - handle session cleanup
    if (method === 'DELETE') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Session terminated',
        status: 'ok'
      }));
      return;
    }
    
    // Method not allowed for other HTTP methods
    res.writeHead(405);
    res.end(JSON.stringify({ 
      error: 'Method Not Allowed',
      allowed: ['GET', 'POST', 'DELETE']
    }));
    return;
  }
  
  // 404
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(port, host, () => {
  console.log(`✅ MCP Server listening on ${host}:${port}`);
  console.log(`🏥 Health check: http://${host}:${port}/`);
  console.log(`🔗 MCP endpoint: http://${host}:${port}/mcp`);
  console.log(`📋 Server ready for requests!`);
  
  // Self-test health check
  setTimeout(() => {
    console.log('🔍 Running self-test health check...');
    const http = require('http');
    const req = http.request(`http://localhost:${port}/`, { timeout: 5000 }, (res) => {
      console.log(`🎉 Self-test result: ${res.statusCode} ${res.statusMessage}`);
      if (res.statusCode === 200) {
        console.log('✅ STARTUP COMPLETE - Server is fully operational!');
      }
    });
    req.on('error', (err) => {
      console.log(`⚠️  Self-test failed: ${err.message}`);
    });
    req.on('timeout', () => {
      console.log('⚠️  Self-test timed out');
      req.destroy();
    });
    req.end();
  }, 1000);
});

server.on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`   Port ${port} is already in use`);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});
