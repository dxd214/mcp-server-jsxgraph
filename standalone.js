const http = require('http');

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🚀 Standalone MCP Server JSXGraph');
console.log('='.repeat(50));
console.log('Time:', new Date().toISOString());
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current Working Directory:', process.cwd());
console.log('Process ID:', process.pid);
console.log('User ID:', process.getuid ? process.getuid() : 'N/A');
console.log('Memory Usage:', JSON.stringify(process.memoryUsage(), null, 2));
console.log('Port:', port);
console.log('Host:', host);
console.log('Environment Variables:');
Object.keys(process.env).filter(key => 
  key.startsWith('REPL') || 
  key.includes('PORT') || 
  key.includes('NODE') ||
  key.includes('PATH')
).forEach(key => {
  console.log(`- ${key}:`, process.env[key]);
});
console.log('='.repeat(50));

// Simple MCP tools definition
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
              expression: { type: 'string', description: 'Mathematical expression like x^2, sin(x)' },
              color: { type: 'string', description: 'Color of the function curve' }
            },
            required: ['expression']
          }
        },
        title: { type: 'string', description: 'Title of the graph' },
        boundingBox: {
          type: 'array',
          items: { type: 'number' },
          minItems: 4,
          maxItems: 4,
          description: 'Graph bounds [xmin, ymax, xmax, ymin]'
        }
      },
      required: ['functions']
    }
  },
  {
    name: 'generate_geometry_diagram',
    description: 'Create interactive geometry diagrams',
    inputSchema: {
      type: 'object',
      properties: {
        points: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              name: { type: 'string' }
            }
          }
        },
        lines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              point1: { type: 'string' },
              point2: { type: 'string' }
            }
          }
        }
      }
    }
  }
];

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
      service: 'Standalone MCP Server JSXGraph',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      node_version: process.version
    }));
    return;
  }
  
  if (url === '/') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      name: 'JSXGraph MCP Server',
      version: '1.0.0',
      description: 'Standalone version - no build required',
      endpoints: {
        health: '/health',
        mcp: '/mcp'
      },
      tools_count: TOOLS.length
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
        console.log('📨 MCP Request:', data.method, data.id);
        
        res.setHeader('Content-Type', 'application/json');
        
        if (data.method === 'initialize') {
          console.log('🔌 Initializing MCP connection...');
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            result: {
              protocolVersion: '2025-8-12',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'mcp-server-jsxgraph',
                version: '1.0.0'
              }
            }
          }));
          return;
        }
        
        if (data.method === 'tools/list') {
          console.log('🛠️  Listing tools...');
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            result: {
              tools: TOOLS
            }
          }));
          return;
        }
        
        if (data.method === 'tools/call') {
          const toolName = data.params?.name;
          const args = data.params?.arguments || {};
          
          console.log('🔧 Tool call:', toolName);
          
          // Simple mock responses for now
          let result = {
            content: [
              {
                type: 'text',
                text: `Generated ${toolName} with arguments: ${JSON.stringify(args, null, 2)}`
              }
            ]
          };
          
          if (toolName === 'generate_function_graph') {
            const functions = args.functions || [{ expression: 'x^2', color: '#0066cc' }];
            result = {
              content: [
                {
                  type: 'text',
                  text: `📊 Generated function graph with ${functions.length} function(s):\n${functions.map(f => `- ${f.expression} (${f.color || 'default color'})`).join('\n')}`
                }
              ]
            };
          }
          
          res.writeHead(200);
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: data.id,
            result: result
          }));
          return;
        }
        
        // Default response for unknown methods
        res.writeHead(200);
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: data.id,
          result: {
            message: `Received ${data.method} - Standalone MCP server is working!`
          }
        }));
        
      } catch (error) {
        console.error('❌ JSON Parse Error:', error);
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
  
  // Handle all other requests
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Not Found',
    method: method,
    url: url,
    message: 'Standalone MCP Server JSXGraph - Available endpoints: /, /health, /mcp'
  }));
});

server.listen(port, host, () => {
  console.log(`✅ Standalone MCP Server listening on ${host}:${port}`);
  console.log(`🔗 Health: https://mcp-server-jsxgraph-dongxd214.replit.app/health`);
  console.log(`🔗 MCP: https://mcp-server-jsxgraph-dongxd214.replit.app/mcp`);
  console.log(`📊 Available tools: ${TOOLS.length}`);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down...');
  server.close();
  process.exit(0);
});
