#!/usr/bin/env node

// 🎯 Replit专用启动脚本 - 完全自包含，无npm依赖
console.log('🚀 Replit MCP Server Starting...');
console.log('Time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

// 设置环境变量
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('🎯 Loading main server...');

// 直接加载并启动服务器
const http = require('http');

// 基本配置
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('🚀 MCP Server starting on', host + ':' + port);

// 简单的MCP工具定义
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
              expression: { type: 'string', description: 'Function expression like x^2 or Math.sin(x)' }
            }
          }
        }
      }
    }
  },
  {
    name: 'generate_geometry_diagram',
    description: 'Generate geometric diagrams with points, lines, and shapes',
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
        }
      }
    }
  }
];

// HTTP服务器
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // OPTIONS请求
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // 健康检查 - Replit专用
  if (url === '/' || url === '/health') {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end('OK');
    return;
  }
  
  // MCP端点
  if (url === '/mcp' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const request = JSON.parse(body);
        let response;
        
        if (request.method === 'initialize') {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: 'mcp-server-jsxgraph', version: '0.0.1' }
            }
          };
        } else if (request.method === 'tools/list') {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: { tools: TOOLS }
          };
        } else if (request.method === 'tools/call') {
          // 简单的工具调用处理
          const toolName = request.params?.name;
          let jsCode = '';
          
          if (toolName === 'generate_function_graph') {
            jsCode = `
// JSXGraph Function Graph
const board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-10, 10, 10, -10],
  axis: true,
  showCopyright: false
});
const f = board.create('functiongraph', [function(x) { return x*x; }]);
`;
          } else if (toolName === 'generate_geometry_diagram') {
            jsCode = `
// JSXGraph Geometry Diagram  
const board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-5, 5, 5, -5],
  axis: true,
  showCopyright: false
});
const A = board.create('point', [1, 2], {name: 'A'});
const B = board.create('point', [-1, -2], {name: 'B'});
const line = board.create('line', [A, B]);
`;
          }
          
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [{
                type: 'text',
                text: jsCode
              }]
            }
          };
        } else {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: 'Method not found' }
          };
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } catch (error) {
        const errorResponse = {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' }
        };
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(400);
        res.end(JSON.stringify(errorResponse));
      }
    });
    return;
  }
  
  // 404
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// 启动服务器
server.listen(port, host, () => {
  console.log(`✅ MCP Server listening on ${host}:${port}`);
  console.log('Health check: GET /');
  console.log('MCP endpoint: POST /mcp');
});

// 错误处理
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// 优雅关闭
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
