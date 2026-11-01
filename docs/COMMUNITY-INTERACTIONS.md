# Posts, threaded comments, voting and creator moderation

Frontend update: 27 October 2026. This document supersedes older handoff notes that describe a text-only composer, inert sharing, flat comments, activity-first room ranking or missing room moderation.

## Posts and media

Home now accepts text, pictures, videos and documents, independently or together. Up to four attachments per post; images/documents up to 10 MB each, videos up to 50 MB each, total up to 60 MB. Supported preview types: PNG/JPEG/WebP/GIF, MP4/WebM, PDF, TXT/Markdown, DOC/DOCX, C/C++/JavaScript source.

The composer provides preview/removal. Published posts show image/video controls or document download links; PDFs have an Open PDF action. The browser normalizes the Blob media type from the selected supported extension. Server validation and storage are still mandatory. Preview object URLs are released when the shared app shell unmounts. Files and new posts disappear on refresh and are not uploaded to a server.

## Comments

Post likes, comments, comment likes and nested replies are now held on the shared post record in Home's state. Home, own profile and public profile views use the same updater. Replies use parentId and have no fixed product depth limit; indentation stops increasing after several levels to keep narrow screens usable. Like state toggles once per preview user. Displayed counts retain the sample post's original comment count and increment for replies added in this preview.

## Sharing

Share invokes the native share sheet if available and provides a Copy link panel with a selectable-link fallback when clipboard access is unavailable. Post links use #/home?post=ID and select the matching post. An unavailable session-local post gets a clear empty state. This is a local preview, not internet publishing: links to localhost require the local server, and new posts/files need backend persistence and a deployed URL to be accessible by other people. All current feed posts are treated as public; protected posts must be checked by the backend before sharing.

## Room ordering and votes

Room ranking is now: joined-user count descending, net vote score descending, message activity descending, room name. Counts represent joined members, not concurrent online connections. Joining/leaving updates membership without duplicates. Seed rooms contain illustrative member lists.

Rooms and messages have a score and myVote (-1/0/+1). Clicking the same direction removes the vote; clicking the opposite direction switches it. Default message order is top voted first, with conversation order available. This ranks useful messages without deleting or permanently pinning other messages. Room votes break ties in joined-user count.

## Creator permissions

New project owner='you' is the project admin in the preview. A project admin can manage all rooms in that project; room creators can manage their own room. Manage room lists members and offers Remove actions for other members, excluding the room creator and self. Removal updates membership; it does not erase historical messages or implement a permanent ban. New rooms start with the creator alone, so no other local users appear until actual membership data is provided.

Admins can delete rooms after an explicit in-app confirmation; the room and its messages disappear from the local room list. Room totals decrement. Other users cannot see moderation controls, and handler permission checks also prevent unauthorized changes in this preview. None of these frontend checks replace server authorization.

## Backend contract additions

- Post attachments: upload IDs/storage URLs, original names, media type, byte size, owner and visibility; multipart upload with server type/format/size validation and controlled downloads.
- Comments: id, postId, authorId, parentId, body, timestamps, likes count and current-user like state; comment likes are unique per user/comment. Keep child replies within the same post and prevent cyclic parents.
- Posts: canonical public URLs and visibility checks; durable post content and attachment storage. Copy/share alone does not persist a post.
- Projects/rooms: stable creator/admin identities, authoritative member roster and count, remove-member and delete-room endpoints; authenticate and authorize every action. Decide soft deletion, moderation audit and removal-vs-ban policy with the team.
- Votes: unique user/target vote, one direction at a time, atomic toggle/switch; authoritative score and current-user vote returned by API. Broadcast changes to connected clients.
- Pagination/sorting: server-side joined-member ranking for rooms and vote ranking for messages, with stable tie-breaks. Resolve whether the product ultimately wants joined users or current online users; current frontend uses joined users.

## Validation

Production build passed. Pure checks covered vote toggle/switch, unique joins, leave, user-count-first ranking, creator/project-admin permissions, protected owner and unsupported/empty/oversized file validation. Browser checks covered image+document preview/publishing, comment like, reply and reply-to-reply, count updates, Copy link, room vote, top-voted message movement, join count change, project admin label, room management and confirmed deletion. Video playback across devices, actual multi-user removal and server authorization remain integration checks.
