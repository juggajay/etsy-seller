const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'output');

http.createServer((req, res) => {
  const fp = path.join(ROOT, req.url === '/' ? 'preview.html' : req.url);
  if (fs.existsSync(fp)) {
    const ext = path.extname(fp);
    const types = { '.html': 'text/html', '.pdf': 'application/pdf', '.png': 'image/png' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  } else {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(8766, () => console.log('Preview server on http://localhost:8766'));
