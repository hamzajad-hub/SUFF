# Discussion rooms frontend

Entry: Projects -> Open project -> Discussion rooms. Available in the existing project overview; no extra sidebar page.

## Working in the frontend

- Anyone can read a community room; Join enables posting and snippet sharing. Leave returns to reading mode.
- Anyone can create a room; creation joins the creator. Names are unique within the project and accept 2–40 lowercase letters, digits, underscores and hyphens; spaces normalize to hyphens.
- Search rooms by name/topic. Rank by descending message activity with name tie-breaks. Messages/snippets/files increment room and project discussion activity. New rooms increment the project's room total.
- Terminal-style chat with local messages, text wrapping and downloadable attachments. Files: PDF, Markdown, text, C/header, JavaScript, C++/header, PNG/JPEG/WebP; non-empty, maximum 5 MB. Object URLs are revoked on leaving Projects.
- Code workspace with C, JavaScript and C++ templates, line numbers, separate drafts per language while the room is open, optional stdin and sharing code into the room.
- Run displays an honest not-connected output state. No user code is executed or sent anywhere.
- New projects begin with no rooms. Existing sample projects show two illustrative rooms with recent-message excerpts; sample project totals represent broader example activity.

## Backend work

Use authenticated server identities instead of the preview 'you'. Add project room list/create, room join/leave, message list/send and attachment-upload endpoints. Persist and distribute messages using your agreed transport (e.g. WebSocket), paginate history, return authoritative activity counts, and enforce 42 verification on protected project/room endpoints. Frontend tab visibility is not authorization.

For code running, connect language (c/javascript/cpp), source and stdin to an isolated execution service and return stdout, stderr, compiler errors, exit status and timeout state. Decide versions, input limits and execution limits with the team. Do not execute snippets inside the SUF web server or with browser eval.

## Scope and verification

Rooms, membership, messages and attachments are held in Projects memory, disappear on refresh/leaving Projects, and are not shared with other users. Editor drafts reset when a room is closed. Files are local preview attachments, not server uploads. Profile activity is not yet connected to rooms.

Production build passed. Pure checks covered ranking, tie ordering, no mutation of the source array, activity reranking, empty new-project rooms and all three language templates. Browser checks covered opening project rooms, creating/joining a room, sending text, sharing a C snippet, the disconnected Run state, and room message counts after returning to the list. Full cross-browser and upload checks remain pending.
