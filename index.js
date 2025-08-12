const http = require('http');

// Basic configuration
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🚀 MCP Server starting on', host + ':' + port);

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
  
  // Only log non-health check requests to reduce noise
  if (url !== '/' && url !== '/health') {
    console.log(`${method} ${url}`);
  }
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Root path - Replit health check endpoint
  if (url === '/' || url === '/health') {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end('OK');
    return;
  }
  
  // API info endpoint
  if (url === '/api' || url === '/info') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end('{"name":"JSXGraph MCP Server","version":"0.0.1","endpoints":{"mcp":"/mcp","health":"/"}}');
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
        
        if (data.method === 'tools/call') {
          const toolName = data.params?.name;
          let jsCode = '';
          
          if (toolName === 'generate_function_graph') {
            const functions = data.params?.arguments?.functions || [{ expression: 'x^2' }];
            jsCode = `
// JSXGraph Function Graph
const board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-10, 10, 10, -10],
  axis: true,
  showCopyright: false,
  grid: true
});

${functions.map((func, i) => 
  `const f${i} = board.create('functiongraph', [
    function(x) { 
      try { 
        return ${func.expression.replace(/\^/g, '**')}; 
      } catch(e) { 
        return x*x; 
      } 
    }
  ], { 
    strokeColor: '${func.color || '#0066cc'}', 
    strokeWidth: 2 
  });`
).join('\n')}
`;
          } else {
            jsCode = `
// JSXGraph Basic Chart
const board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-5, 5, 5, -5],
  axis: true,
  showCopyright: false
});
const point = board.create('point', [1, 2], {name: 'A'});
`;
          }
          
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            result: {
              content: [{
                type: 'text',
                text: jsCode
              }]
            }
          }));
          return;
        }
        
        // Unknown method
        res.writeHead(200);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: data.id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
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
  console.log('Health check: GET /');
  console.log('MCP endpoint: POST /mcp');
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});
