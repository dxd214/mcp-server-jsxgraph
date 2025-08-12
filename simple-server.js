const http = require('http');

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🚀 Starting Simple MCP Server...');
console.log('Port:', port);
console.log('Host:', host);

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
  
  if (url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'Simple MCP Server JSXGraph',
      timestamp: new Date().toISOString(),
      port: port,
      host: host
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
  
  if (url === '/mcp' && method === 'POST') {
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
  
  res.writeHead(404);
  res.end('Not Found');
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
