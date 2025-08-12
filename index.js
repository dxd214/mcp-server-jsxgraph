// Force Replit to use this file
console.log('🔥 FORCE REBOOT - MCP Server JSXGraph');
console.log('Time:', new Date().toISOString());
console.log('Process:', process.pid);
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Import and run the simple server
require('./simple-server.js');
