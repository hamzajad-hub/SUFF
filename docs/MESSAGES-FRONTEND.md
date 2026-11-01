# Messages frontend

The Messages page is available at `/messages`. Accepted peers have a Message button on peer cards and public profiles. New message lets users search their accepted peers and start a conversation.

## Implemented

- Conversation search by peer name, username, or message text.
- Text messages up to 5,000 characters, with separate drafts for each recipient.
- Message likes, date separators, timestamps, and unread counters.
- Opening a conversation clears its local unread counter.
- Responsive inbox and conversation views, with a back button on small screens.
- Browser storage preserves conversations and likes. Storage failure displays a notice.
- A clearly labeled offline example conversation.
- An optional local WebSocket demo with live messages, synchronized likes, connection status, automatic reconnection, and history resynchronization.

## Test live messages locally

Run `pnpm install` and `pnpm dev` (or `npm install` and `npm run dev`). Open `http://localhost:5173/messages` in two tabs. Under **Local live chat demo**, choose **Alex** in the first tab and **Sara** in the second. Start a conversation with the other user in each tab and send messages. Likes update in both tabs. Closing/reopening a connection restores the last 200 messages per pair while the same dev server is running.

The demo runs inside Vite on the same port. It defaults to localhost/127.0.0.1. To test with a friend on trusted Wi-Fi, explicitly opt in with `SUF_CHAT_LAN=1 npm run dev -- --host 0.0.0.0` on Linux/WSL, then share the computer's Wi-Fi IPv4 address and Vite port. Keep this unauthenticated sample-user demo on a trusted local network. The identity selector is development-only; it is not included in production builds. Sample users are treated as peers for this demo. Switching identities clears the live client state. Live messages are not written to the offline preview's localStorage.

Disconnects disable sending and trigger exponential reconnects (1–15 seconds). The client waits up to eight seconds for server confirmation before clearing a draft; failures retain the draft. A timeout means acceptance is uncertain: check the conversation before retrying. A server confirmation means the local server accepted the message, not that its recipient read it. The server checks origins, recipients, message sizes and reaction membership, limits actions, bounds history, and uses heartbeat pings to drop dead connections.

This is a local development demonstration, not production authentication or durable storage. Restarting Vite clears live history. The production build keeps the original offline preview until the real backend is integrated.

### WebSocket event contract

The demo endpoint is `/__suf_chat?user=alex`. Selecting a username is intentionally permitted only for local testing. Production must derive identity from a verified server session and use `wss://`.

- Server → client: `{ type: 'ready', username, messages }` with the user's history only.
- Client → server: `{ type: 'send', requestId, recipient, text }`.
- Client → server: `{ type: 'like', requestId, recipient, id, liked }`.
- Server → participants: `{ type: 'message', requestId, message }` for accepted messages and reaction updates.
- Server → requester: `{ type: 'error', requestId, message }` for rejected actions.

Messages contain `id`, `sender`, `recipient`, `text`, `time`, and `likedBy` (usernames). IDs and timestamps are server-generated. Repeated send requests with the same sender/request ID return the existing message while it remains in the bounded history. The client deduplicates by message ID.

Run `npm test` for routing, validation, privacy, reaction, reconnection/history, and message-state checks.

## Backend integration

Replace the local conversation store with authenticated conversation/message APIs and live updates. The server must validate accepted peer relationships and conversation membership for every read, send, and reaction. Use server-generated IDs and timestamps, persisted message history, pagination, unread/read state, and per-user reactions. Treat all text as plain text.

Suggested message fields: id, conversationId, senderId, text, createdAt, reactions. Suggested conversation fields: id, participants, lastMessage, unreadCount. Current frontend usernames and `you` sender values are placeholders for real user IDs.

Connect message-created, reaction-changed, and read-state events through the team's WebSocket service. Do not mark messages delivered/read or users online until the backend provides those events. The example conversation should be removed when connecting real data.

Browser storage is a preview mechanism, not a secure account database. Scope production state to the authenticated account and clear cached private data on logout. Attachments are not included in this first messages version.
