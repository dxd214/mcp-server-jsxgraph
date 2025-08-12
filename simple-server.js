const http = require('http');

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🚀 Starting Simple MCP Server...');
console.log('='.repeat(50));
console.log('Time:', new Date().toISOString());
console.log('Process ID:', process.pid);
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Working Directory:', process.cwd());
console.log('Port:', port);
console.log('Host:', host);
console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- REPL_SLUG:', process.env.REPL_SLUG);
console.log('- REPL_OWNER:', process.env.REPL_OWNER);
console.log('='.repeat(50));

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  
  console.log(`${method} ${url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  if (url === '/health' || url.startsWith('/health')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'Simple MCP Server JSXGraph',
      timestamp: new Date().toISOString(),
      port: port,
      host: host,
      url: url,
      method: method
    }));
    return;
  }
  
  if (url === '/') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'JSXGraph MCP Server',
      version: '0.0.1',
      description: 'Simple test version',
      endpoints: {
        health: '/health',
        mcp: '/mcp'
      }
    }));
    return;
  }
  
  if ((url === '/mcp' || url.startsWith('/mcp')) && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('MCP Request:', data);
        
        res.setHeader('Content-Type', 'application/json');
        
        if (data.method === 'initialize') {
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'mcp-server-jsxgraph',
                version: '0.0.1'
              }
            }
          }));
          return;
        }
        
        if (data.method === 'tools/list') {
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            result: {
              tools: [
                {
                  name: 'generate_function_graph',
                  description: 'Generate mathematical function graphs',
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
              ]
            }
          }));
          return;
        }
        
        // Default response
        res.writeHead(200);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: data.id,
          result: {
            message: 'Simple MCP server is working!'
          }
        }));
        
      } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(400);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error'
          }
        }));
      }
    });
    
    return;
  }
  
  // Log all unhandled requests
  console.log(`❓ Unhandled request: ${method} ${url}`);
  
  // Return JSON for any unhandled request to help with debugging
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Not Found',
    method: method,
    url: url,
    timestamp: new Date().toISOString(),
    message: 'This is the MCP Server JSXGraph. Available endpoints: /, /health, /mcp'
  }));
});

server.listen(port, host, () => {
  console.log(`✅ Simple MCP Server listening on ${host}:${port}`);
  console.log(`🔗 Health check: http://${host}:${port}/health`);
  console.log(`🔗 MCP endpoint: http://${host}:${port}/mcp`);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down...');
  server.close();
  process.exit(0);
});
