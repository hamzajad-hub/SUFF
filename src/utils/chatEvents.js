export function applyChatMessage(current, message, username, activeUsername = null) {
    if (!message || typeof message.id !== 'string' || typeof message.text !== 'string'
        || typeof message.time !== 'string' || !Number.isFinite(Date.parse(message.time))
        || (message.sender !== username && message.recipient !== username)) return current;
    const peer = message.sender === username ? message.recipient : message.sender;
    if (typeof peer !== 'string' || peer === username) return current;
    const conversation = current[peer] || { username: peer, messages: [], unread: 0 };
    const exists = conversation.messages.some((item) => item.id === message.id);
    const normalized = {
        ...message, sender: message.sender === username ? 'you' : message.sender,
        liked: Array.isArray(message.likedBy) && message.likedBy.includes(username),
        likeCount: Array.isArray(message.likedBy) ? message.likedBy.length : 0,
    };
    const messages = exists
        ? conversation.messages.map((item) => item.id === message.id ? normalized : item)
        : [...conversation.messages, normalized].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    return {
        ...current,
        [peer]: { ...conversation, messages, unread: activeUsername === peer ? 0
            : conversation.unread + (!exists && message.sender !== username ? 1 : 0) },
    };
}
