export function initialConversations() {
    return {
        yassine: {
            username: 'yassine',
            unread: 1,
            messages: [
                { id: 'demo-dm-1', sender: 'yassine', text: 'Hey! How is the SUF frontend coming along?', time: '2026-10-27T09:30:00Z', liked: false },
                { id: 'demo-dm-2', sender: 'yassine', text: 'We can compare our Docker setup when you are ready.', time: '2026-10-27T09:31:00Z', liked: false },
            ],
        },
    };
}

export function normalizeConversations(value, knownUsers) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return initialConversations();
    const result = {};
    for (const username of knownUsers) {
        const conversation = value[username];
        if (!conversation || !Array.isArray(conversation.messages)) continue;
        result[username] = {
            username,
            unread: Number.isInteger(conversation.unread) && conversation.unread > 0 ? conversation.unread : 0,
            messages: conversation.messages.filter((message) => message
                && typeof message.id === 'string'
                && typeof message.text === 'string'
                && ['you', username].includes(message.sender)
                && typeof message.time === 'string'
                && Number.isFinite(Date.parse(message.time)))
                .map((message) => ({ ...message, liked: Boolean(message.liked) })),
        };
    }
    return result;
}

export function sendDirectMessage(current, username, text, connected) {
    const trimmed = text.trim();
    if (!connected || !trimmed || trimmed.length > 5000) return current;
    const conversation = current[username] || { username, messages: [], unread: 0 };
    return {
        ...current,
        [username]: {
            ...conversation,
            messages: [...conversation.messages, {
                id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                sender: 'you',
                text: trimmed,
                time: new Date().toISOString(),
                liked: false,
            }],
        },
    };
}

export function toggleMessageLike(current, username, messageId) {
    const conversation = current[username];
    if (!conversation || !conversation.messages.some((message) => message.id === messageId)) return current;
    return {
        ...current,
        [username]: {
            ...conversation,
            messages: conversation.messages.map((message) => message.id === messageId ? { ...message, liked: !message.liked } : message),
        },
    };
}

export function conversationList(conversations, query, peers) {
    const normalized = query.trim().toLowerCase();
    return Object.values(conversations)
        .filter((conversation) => {
            const peer = peers.find((person) => person.username === conversation.username);
            return peer && [peer.name, peer.username, ...conversation.messages.map((message) => message.text)]
                .join(' ').toLowerCase().includes(normalized);
        })
        .sort((a, b) => {
            const timeA = a.messages.length ? Date.parse(a.messages[a.messages.length - 1].time) : 0;
            const timeB = b.messages.length ? Date.parse(b.messages[b.messages.length - 1].time) : 0;
            return timeB - timeA || a.username.localeCompare(b.username);
        });
}
