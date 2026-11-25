import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {desktopRoute} from './desktop.mjs';

const routes = new Map([
  ['/','text/html; charset=utf-8'],
  ['/index.html','text/html; charset=utf-8'],
  ['/style.css','text/css; charset=utf-8'],
  ['/art.js','text/javascript; charset=utf-8'],
  ['/motion.js','text/javascript; charset=utf-8'],
  ['/app.js','text/javascript; charset=utf-8'],
  ['/favicon.svg','image/svg+xml'],
]);
const port = Number(process.argv[2] || 4178);
const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1').pathname;
  if(path === '/desktop'){desktopRoute(request,response,port);return;}
  if (!routes.has(path) || !['GET','HEAD'].includes(request.method)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(new URL(path === '/' ? './index.html' : '.' + path, import.meta.url));
    response.writeHead(200, {'Content-Type': routes.get(path), 'Cache-Control':'no-store'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(500).end('Unable to read preview file.');
  }
});
server.listen(port, '127.0.0.1', () => console.log('Emotion Keycaps: http://127.0.0.1:' + port + '/'));
