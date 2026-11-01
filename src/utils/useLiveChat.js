import { useEffect, useRef, useState } from 'react';
import { applyChatMessage } from './chatEvents.js';

export default function useLiveChat(username, activeUsername) {
    const [conversations, setConversations] = useState({});
    const [status, setStatus] = useState('offline');
    const [error, setError] = useState('');
    const socket = useRef(null);
    const active = useRef(activeUsername);
    const pending = useRef(new Map());
    active.current = activeUsername;

    useEffect(() => {
        setConversations({});
        setError('');
        if (!username) { setStatus('offline'); return; }
        let disposed = false;
        let retry;
        let attempt = 0;
        function rejectPending(message) {
            for (const { reject, timer } of pending.current.values()) {
                clearTimeout(timer);
                reject(new Error(message));
            }
            pending.current.clear();
        }
        function connect() {
            if (disposed) return;
            setStatus(attempt ? 'reconnecting' : 'connecting');
            const url = new URL('/__suf_chat', window.location.href);
            url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            url.searchParams.set('user', username);
            const client = new WebSocket(url);
            socket.current = client;
            client.onmessage = ({ data }) => {
                if (disposed || socket.current !== client) return;
                let event;
                try { event = JSON.parse(data); } catch { return; }
                if (!event || typeof event !== 'object') return;
                if (event.type === 'ready' && event.username === username && Array.isArray(event.messages)) {
                    setConversations((current) => {
                        const snapshot = event.messages.reduce((all, message) => applyChatMessage(all, message, username, active.current), {});
                        for (const [peer, conversation] of Object.entries(snapshot)) {
                            const previous = current[peer];
                            const known = new Set(previous?.messages.map((item) => item.id) || []);
                            conversation.unread = active.current === peer ? 0 : (previous?.unread || 0)
                                + (previous ? conversation.messages.filter((item) => item.sender !== 'you' && !known.has(item.id)).length : 0);
                        }
                        return snapshot;
                    });
                    attempt = 0;
                    setError('');
                    setStatus('connected');
                } else if (event.type === 'message') {
                    setConversations((current) => applyChatMessage(current, event.message, username, active.current));
                } else if (event.type === 'error') setError(event.message || 'Chat request failed.');
                const request = pending.current.get(event.requestId);
                if (request && ['message', 'error'].includes(event.type)) {
                    clearTimeout(request.timer);
                    pending.current.delete(event.requestId);
                    if (event.type === 'error') request.reject(new Error(event.message));
                    else request.resolve();
                }
            };
            client.onerror = () => { if (!disposed) setError('Unable to reach chat. Reconnecting automatically.'); };
            client.onclose = () => {
                if (disposed) return;
                rejectPending('Connection lost. Your draft has been kept.');
                setStatus('reconnecting');
                retry = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 15000));
            };
        }
        connect();
        return () => {
            disposed = true;
            clearTimeout(retry);
            rejectPending('Chat disconnected.');
            socket.current?.close();
            socket.current = null;
        };
    }, [username]);

    useEffect(() => {
        if (!activeUsername) return;
        setConversations((current) => !current[activeUsername]?.unread ? current : {
            ...current, [activeUsername]: { ...current[activeUsername], unread: 0 },
        });
    }, [activeUsername]);

    function send(event) {
        const client = socket.current;
        if (status !== 'connected' || client?.readyState !== WebSocket.OPEN) return Promise.reject(new Error('Wait until chat reconnects.'));
        if (client.bufferedAmount > 64 * 1024) return Promise.reject(new Error('Connection is busy. Please try again.'));
        // randomUUID requires HTTPS; getRandomValues also works on local HTTP Wi-Fi previews.
        const requestId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID()
            : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                pending.current.delete(requestId);
                reject(new Error('No confirmation received. Your draft has been kept; check the conversation before retrying.'));
            }, 8000);
            pending.current.set(requestId, { resolve, reject, timer });
            try { client.send(JSON.stringify({ ...event, requestId })); } catch (error) {
                clearTimeout(timer);
                pending.current.delete(requestId);
                reject(error);
            }
        });
    }
    return { conversations, status, error, send };
}
