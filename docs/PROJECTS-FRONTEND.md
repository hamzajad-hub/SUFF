# Projects frontend handoff

The Projects view is available at #/projects. It shares the existing header, sidebar, theme and footer with Home.

## Implemented

- Community projects with sample activity, most-discussed ranking, name sorting, tag filters and search from the header.
- Add project with a name, summary, tags and plain-text README. New projects are in memory only and disappear on refresh.
- Project overview with README and a placeholder for the next discussion-room step.
- 42 projects tab is rendered only for server-verified 42 students. Normal users see Community projects as their only category. No public connection prompt or sample-preview option is shown.

## Backend integration

ProjectsPage accepts an account prop, defaulting to null. Pass the server-authenticated account with is42Verified and projects42. The current shell supplies no authenticated account yet; every visitor currently sees only community projects. The backend must enforce verification and access on every protected endpoint. A frontend boolean is not authorization.

Each project currently contains id, name, summary, tags (array), icon (text), discussions (number), rooms (number), peers (number), owner and readme (plain text). Adapt this view model to your agreed API response. Return only 42 projects the authenticated user is allowed to see. Use server-provided Intra/project links and subject files when available; the samples do not represent official subject documents.

Replace example community data and local creation with list/create endpoints. Connect project overview to room listing, room creation and activity counts. Official PDFs, uploads, discussion rooms, code running and durable storage are not implemented in this step.

## Verification

Production build passes. Real-browser and responsive checks should cover category switching, empty search, tag filtering, sorting, project creation, overview, light/dark themes and navigation back to Home.

## Brief attachments
The Add project form accepts one non-empty .pdf, .md or .txt file up to 10 MB, with an optional written brief. Projects need either text or an attachment. Files use session-local object URLs, are released when Projects unmounts, and can be opened or downloaded from the overview. Backend upload storage and server-side file validation are still needed. This supersedes the earlier note that uploads are not implemented.

