#!/usr/bin/env node

// 确保运行我们的MCP服务器，而不是inspector
console.log('🎯 Starting MCP Server JSXGraph - NOT Inspector!');
console.log('Time:', new Date().toISOString());
console.log('Process:', process.pid);
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

// 确保环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// 启动我们的服务器
require('./index.js');
