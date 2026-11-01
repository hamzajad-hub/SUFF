# Peers and public profiles frontend

Routes: `#/peers`, `#/profile/:username`; own profile remains `#/profile` (or `#/profile/you`). Unknown public usernames show a not-found page. Supported preview users: alex, sara, yassine, meryem, hamza.

## Implemented

- Discover, My peers, Requests and Sent categories with counts and empty states.
- Local directory search by display name, @username, role, bio and #skill; the header search also filters the Peers directory.
- Send/cancel outgoing requests; accept/decline incoming requests; connected users display Peers status.
- One shared relationship state across Peers, public profiles, Home suggestions and Home post menus; saved to guarded browser storage under suf-peer-relationships.
- Public profiles show name, username, bio, skills, sample 42 badge/campus, peer count, public posts and owned community projects. Project links open the matching project overview.
- Private saved posts and profile/account editing are not included in public profiles. Public discussion activity has an explicit empty state pending backend integration.
- Own profile peer count follows the shared connection state.

## Example data

All directory records, verification badges and counts are illustrative. Yassine starts as a connected peer and Meryem has an incoming sample request so the frontend flows can be demonstrated. No actual people are contacted. Browser storage holds preview relationship statuses, not authentication or server permissions.

## Backend handoff

Replace peerDirectory and initialRelationships with public user/relationship responses. Needed: authenticated current account; searchable/paginated public directory; incoming/outgoing/connected lists; send/cancel/accept/decline endpoints; profile lookup by stable user ID or username; public posts/projects/room activity and authoritative counters. Enforce relationship transitions and ownership on the server. Incoming requests must originate from the server, never from frontend status flags.

Public profile examples contain no external personal links. Render validated public GitHub/portfolio/LinkedIn URLs when the API supplies them. Do not expose email, credentials, saved posts, account settings or protected 42 activity in public profile responses. 42 verification fields are server-controlled.

Private messaging and removing existing peers are not implemented in this step.

## Validation

Production build passed. Pure checks covered send/cancel/accept/decline, invalid/duplicate transitions, source immutability, unknown users, @username search, #skill search and no-result search. Browser checks are recorded in the task report.

Browser verification completed: sent a request from Discover, confirmed the same pending status on Sara's public profile, cancelled there, opened her matching project, accepted Meryem's sample incoming request, confirmed My peers count/list updates, and filtered by @sara. Light theme also checked. The accepted sample request remains in this browser's preview state.

