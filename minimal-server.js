const http = require('http');

const port = process.env.PORT || 3000;

console.log('Starting minimal server...');
console.log('Port:', port);

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
  console.log('Ready!');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close();
  process.exit(0);
});