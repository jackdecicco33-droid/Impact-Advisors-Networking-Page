const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8080);
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".pdf": "application/pdf", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  let target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(root)) { response.writeHead(403); response.end("Forbidden"); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  fs.readFile(target, (error, data) => {
    if (error) { response.writeHead(404); response.end("Not found"); return; }
    response.writeHead(200, { "Content-Type": mime[path.extname(target).toLowerCase()] || "application/octet-stream" }); response.end(data);
  });
}).listen(port, () => console.log(`Connect Hub preview: http://localhost:${port}`));
