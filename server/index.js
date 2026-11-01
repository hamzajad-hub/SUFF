import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { htmlHeaders, renderPage, requestOrigin } from './renderPage.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain' };

export async function createProductionServer() {
    const clientDir = resolve(root, 'dist/client');
    const template = await readFile(resolve(clientDir, 'index.html'), 'utf8');
    const { render } = await import(pathToFileURL(resolve(root, 'dist/server/entry-server.js')).href);
    return createServer(async (request, response) => {
        try {
            if (!['GET', 'HEAD'].includes(request.method)) {
                response.writeHead(405, { Allow: 'GET, HEAD' });
                response.end('Method not allowed');
                return;
            }
            const url = new URL(request.url, 'http://suf.local');
            let pathname;
            try { pathname = decodeURIComponent(url.pathname); }
            catch { response.writeHead(400); response.end('Invalid URL'); return; }
            const file = resolve(clientDir, '.' + pathname);
            if (file.startsWith(clientDir + sep) && extname(pathname) && extname(pathname) !== '.html') {
                let details;
                try { details = await stat(file); } catch (error) { if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error; }
                if (details?.isFile()) {
                    response.writeHead(200, {
                        'Content-Type': types[extname(file)] || 'application/octet-stream',
                        'Content-Length': details.size,
                        'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
                        'X-Content-Type-Options': 'nosniff',
                    });
                    if (request.method === 'HEAD') response.end();
                    else await pipeline(createReadStream(file), response);
                    return;
                }
            }
            if (pathname.startsWith('/assets/') || pathname.startsWith('/api/')) {
                response.writeHead(404); response.end('Not found'); return;
            }
            const { document, status } = await renderPage(request.url, template, render, requestOrigin(request));
            response.writeHead(status, htmlHeaders());
            response.end(request.method === 'HEAD' ? undefined : document);
        } catch (error) {
            console.error('SSR request failed:', error);
            if (!response.headersSent) response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Unable to load this page. Please try again.');
        }
    });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try { process.loadEnvFile(resolve(root, '.env')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const server = await createProductionServer();
    const port = Number(process.env.PORT || 4173);
    const host = process.env.HOST || '127.0.0.1';
    server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
    server.listen(port, host, () => console.log(`SUF SSR running at http://${host}:${port}`));
}
