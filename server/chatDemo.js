import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { peerDirectory } from '../src/data/peersData.js';

// Local development only. Selectable sample identities are NOT authentication.
export function attachChatDemo(httpServer) {
    const users = new Set(peerDirectory.map((peer) => peer.username));
    const history = new Map();
    const wss = new WebSocketServer({ noServer: true, maxPayload: 32 * 1024 });
    const send = (socket, event) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        if (socket.bufferedAmount > 1024 * 1024) return socket.terminate();
        socket.send(JSON.stringify(event));
    };
    const keyFor = (a, b) => [a, b].sort().join(':');
    const visible = (message, username) => message.sender === username || message.recipient === username;
    const broadcast = (message, requestId) => {
        for (const socket of wss.clients) {
            if (visible(message, socket.username)) send(socket, { type: 'message', message, requestId });
        }
    };
    function upgrade(request, socket, head) {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname !== '/__suf_chat') return;
        const username = url.searchParams.get('user');
        let origin;
        try { origin = new URL(request.headers.origin); } catch { /* Rejected below. */ }
        if (!origin || origin.host !== request.headers.host || !users.has(username)) {
            socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
            socket.destroy();
            return;
        }
        wss.handleUpgrade(request, socket, head, (client) => {
            client.username = username;
            wss.emit('connection', client);
        });
    }
    httpServer.on('upgrade', upgrade);
    wss.on('connection', (socket) => {
        socket.alive = true;
        socket.on('error', () => socket.terminate());
        socket.on('pong', () => { socket.alive = true; });
        send(socket, {
            type: 'ready', username: socket.username,
            messages: [...history.values()].flat().filter((message) => visible(message, socket.username)),
        });
        let count = 0;
        let started = Date.now();
        socket.on('message', (data, binary) => {
            const fail = (requestId, message) => send(socket, { type: 'error', requestId, message });
            if (Date.now() - started >= 10000) { started = Date.now(); count = 0; }
            if (++count > 30) return fail(null, 'Too many actions. Please wait a few seconds.');
            let event;
            try { event = JSON.parse(data.toString()); } catch { return fail(null, 'Invalid chat event.'); }
            if (binary || !event || typeof event !== 'object') return fail(null, 'Invalid chat event.');
            const { requestId, recipient } = event;
            if (typeof requestId !== 'string' || requestId.length > 100 || !requestId
                || !users.has(recipient) || recipient === socket.username) return fail(requestId, 'Invalid recipient or request.');
            const key = keyFor(socket.username, recipient);
            const messages = history.get(key) || [];
            if (event.type === 'send') {
                if (typeof event.text !== 'string' || !event.text.trim() || event.text.trim().length > 5000) {
                    return fail(requestId, 'Messages must contain between 1 and 5,000 characters.');
                }
                const existing = messages.find((message) => message.sender === socket.username && message.requestId === requestId);
                if (existing) return send(socket, { type: 'message', message: existing, requestId });
                const message = {
                    id: randomUUID(), sender: socket.username, recipient, text: event.text.trim(),
                    time: new Date().toISOString(), likedBy: [], requestId,
                };
                history.set(key, [...messages, message].slice(-200));
                broadcast(message, requestId);
            } else if (event.type === 'like') {
                const message = messages.find((item) => item.id === event.id);
                if (!message) return fail(requestId, 'Message is no longer available.');
                if (typeof event.liked !== 'boolean') return fail(requestId, 'Invalid reaction.');
                message.likedBy = message.likedBy.filter((user) => user !== socket.username);
                if (event.liked) message.likedBy.push(socket.username);
                broadcast(message, requestId);
            } else fail(requestId, 'Unknown chat action.');
        });
    });
    const heartbeat = setInterval(() => {
        for (const socket of wss.clients) {
            if (!socket.alive) { socket.terminate(); continue; }
            socket.alive = false;
            socket.ping();
        }
    }, 30000);
    heartbeat.unref();
    return () => {
        clearInterval(heartbeat);
        httpServer.off('upgrade', upgrade);
        for (const socket of wss.clients) socket.terminate();
        wss.close();
    };
}
