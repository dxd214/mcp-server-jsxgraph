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
  
  console.log(`${method} ${url}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Root path
  if (url === '/') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'JSXGraph MCP Server',
      version: '0.0.1',
      description: 'Mathematical visualization server',
      endpoints: { health: '/health', mcp: '/mcp' }
    }));
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
  
  // MCP endpoint
  if (url === '/mcp' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.setHeader('Content-Type', 'application/json');
        
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
        
        // Default response
        res.writeHead(200);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: data.id,
          result: { message: 'MCP Server working!' }
        }));
        
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error' }
        }));
      }
    });
    return;
  }
  
  // 404
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(port, host, () => {
  console.log(`✅ MCP Server listening on ${host}:${port}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});
