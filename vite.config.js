import { defineConfig } from 'vite';
import { attachChatDemo } from './server/chatDemo.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { htmlHeaders, renderPage, requestOrigin } from './server/renderPage.js';

export default defineConfig({
    appType: 'custom',
    plugins: [{
        name: 'suf-local-chat',
        apply: 'serve',
        configureServer(server) {
            // Network access is an explicit opt-in for testing on trusted Wi-Fi.
            const localHost = ['127.0.0.1', 'localhost', undefined].includes(server.config.server.host);
            if (!server.httpServer || (!localHost && process.env.SUF_CHAT_LAN !== '1')) return;
            const dispose = attachChatDemo(server.httpServer);
            server.httpServer.once('close', dispose);
        },
    }, {
        name: 'suf-ssr',
        apply: 'serve',
        configureServer(server) {
            return () => server.middlewares.use(async (request, response, next) => {
                if (!['GET', 'HEAD'].includes(request.method)) {
                    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end('Method not allowed'); return;
                }
                try {
                    const pathname = new URL(request.url, 'http://suf.local').pathname;
                    if (/\.[a-z0-9]+$/i.test(pathname) || pathname.startsWith('/api/') || pathname.startsWith('/@')) {
                        response.writeHead(404); response.end('Not found'); return;
                    }
                    let template = await readFile(resolve(server.config.root, 'index.html'), 'utf8');
                    template = await server.transformIndexHtml(request.url, template);
                    const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
                    const { document, status } = await renderPage(request.url, template, render, requestOrigin(request));
                    response.writeHead(status, htmlHeaders());
                    response.end(request.method === 'HEAD' ? undefined : document);
                } catch (error) {
                    server.ssrFixStacktrace(error);
                    next(error);
                }
            });
        },
    }],
});
