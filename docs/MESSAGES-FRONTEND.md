# Messages frontend

The Messages page is available at `#/messages`. Accepted peers have a Message button on peer cards and public profiles. New message lets users search their accepted peers and start a conversation.

## Implemented

- Conversation search by peer name, username, or message text.
- Text messages up to 5,000 characters, with separate drafts for each recipient.
- Message likes, date separators, timestamps, and unread counters.
- Opening a conversation clears its local unread counter.
- Responsive inbox and conversation views, with a back button on small screens.
- Browser storage preserves conversations and likes. Storage failure displays a notice.
- A clearly labeled example conversation; messages are not delivered to other users.

## Backend integration

Replace the local conversation store with authenticated conversation/message APIs and live updates. The server must validate accepted peer relationships and conversation membership for every read, send, and reaction. Use server-generated IDs and timestamps, persisted message history, pagination, unread/read state, and per-user reactions. Treat all text as plain text.

Suggested message fields: id, conversationId, senderId, text, createdAt, reactions. Suggested conversation fields: id, participants, lastMessage, unreadCount. Current frontend usernames and `you` sender values are placeholders for real user IDs.

Connect message-created, reaction-changed, and read-state events through the team's WebSocket service. Do not mark messages delivered/read or users online until the backend provides those events. The example conversation should be removed when connecting real data.

Browser storage is a preview mechanism, not a secure account database. Scope production state to the authenticated account and clear cached private data on logout. Attachments are not included in this first messages version.
