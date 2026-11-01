import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import WebSocket from 'ws';
import { attachChatDemo } from '../server/chatDemo.js';
import { applyChatMessage } from '../src/utils/chatEvents.js';

test('messages deduplicate, update reactions, and count only unread incoming messages', () => {
    const message = { id: '1', sender: 'alex', recipient: 'sara', text: 'Hello', time: '2026-11-01T10:00:00Z', likedBy: [] };
    const received = applyChatMessage({}, message, 'sara');
    assert.equal(received.alex.unread, 1);
    assert.equal(applyChatMessage(received, message, 'sara').alex.messages.length, 1);
    const reacted = applyChatMessage(received, { ...message, likedBy: ['sara'] }, 'sara');
    assert.equal(reacted.alex.messages[0].liked, true);
    assert.equal(reacted.alex.unread, 1);
    assert.equal(applyChatMessage(reacted, message, 'sara', 'alex').alex.unread, 0);
    assert.equal(applyChatMessage({}, message, 'alex').sara.messages[0].sender, 'you');
    assert.deepEqual(applyChatMessage({}, message, 'hamza'), {});
});

test('live chat routes privately, validates, synchronizes reactions and restores history', async (t) => {
    const server = createServer();
    const dispose = attachChatDemo(server);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const origin = `http://127.0.0.1:${server.address().port}`;
    const clients = [];
    t.after(async () => {
        clients.forEach((client) => client.socket.terminate());
        dispose();
        await new Promise((resolve) => server.close(resolve));
    });
    async function connect(username) {
        const socket = new WebSocket(`${origin.replace('http:', 'ws:')}/__suf_chat?user=${username}`, { origin });
        const inbox = [];
        let notify;
        socket.on('message', (data) => { inbox.push(JSON.parse(data)); notify?.(); });
        async function next(predicate) {
            const timeout = setTimeout(() => notify?.(new Error('Chat event timed out')), 3000);
            try {
                while (true) {
                    const index = inbox.findIndex(predicate);
                    if (index >= 0) return inbox.splice(index, 1)[0];
                    await new Promise((resolve, reject) => { notify = (error) => error ? reject(error) : resolve(); });
                }
            } finally { clearTimeout(timeout); notify = null; }
        }
        const client = { socket, inbox, next, send: (event) => socket.send(JSON.stringify(event)) };
        clients.push(client);
        client.ready = await next((event) => event.type === 'ready');
        return client;
    }
    const alex = await connect('alex');
    const sara = await connect('sara');
    const hamza = await connect('hamza');
    const event = { type: 'send', recipient: 'sara', text: ' Hello live chat ', requestId: 'send-1' };
    alex.send(event);
    const sent = await alex.next((item) => item.requestId === 'send-1');
    const incoming = await sara.next((item) => item.requestId === 'send-1');
    assert.equal(incoming.message.text, 'Hello live chat');
    assert.equal(incoming.message.id, sent.message.id);
    assert.equal(hamza.inbox.length, 0);
    alex.send(event);
    assert.equal((await alex.next((item) => item.requestId === 'send-1')).message.id, sent.message.id);
    sara.send({ type: 'like', recipient: 'alex', id: sent.message.id, liked: true, requestId: 'like-1' });
    assert.deepEqual((await alex.next((item) => item.requestId === 'like-1')).message.likedBy, ['sara']);
    await sara.next((item) => item.requestId === 'like-1');
    hamza.send({ type: 'like', recipient: 'alex', id: sent.message.id, liked: true, requestId: 'forbidden-1' });
    assert.equal((await hamza.next((item) => item.requestId === 'forbidden-1')).type, 'error');
    alex.send({ type: 'send', recipient: 'sara', text: 'x'.repeat(5001), requestId: 'invalid-1' });
    assert.equal((await alex.next((item) => item.requestId === 'invalid-1')).type, 'error');
    alex.send({ type: 'send', recipient: 'alex', text: 'No', requestId: 'self-1' });
    assert.equal((await alex.next((item) => item.requestId === 'self-1')).type, 'error');
    sara.socket.close();
    await once(sara.socket, 'close');
    alex.send({ ...event, text: 'While disconnected', requestId: 'send-2' });
    await alex.next((item) => item.requestId === 'send-2');
    const reconnected = await connect('sara');
    assert.equal(reconnected.ready.messages.length, 2);
    assert.equal(reconnected.ready.messages[1].text, 'While disconnected');
    assert.deepEqual(reconnected.ready.messages[0].likedBy, ['sara']);
    assert.equal((await connect('hamza')).ready.messages.length, 0);
    for (const [user, requestOrigin] of [['unknown', origin], ['alex', 'http://evil.example']]) {
        const rejected = new WebSocket(`${origin.replace('http:', 'ws:')}/__suf_chat?user=${user}`, { origin: requestOrigin });
        const error = await new Promise((resolve) => rejected.once('error', resolve));
        assert.match(error.message, /403/);
    }
});
