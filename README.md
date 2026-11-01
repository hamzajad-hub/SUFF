# SUF — Stack Under Flow

React frontend for a developer community built around projects, peers, and discussion rooms. Backend services will be implemented by the team.

## Run locally

Install Node.js 22 or later, then open a terminal in this folder:

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. Keep the terminal running while using the preview. Each teammate runs the development server on their own PC.

If you use pnpm, install with `pnpm install` and start with `pnpm dev`. The pnpm lockfile is included.

```sh
npm run build
npm run preview
```

The project uses React 19 and Vite 6. Fonts are Inter and JetBrains Mono, with local fallbacks.

## Implemented frontend

- Login and signup forms with validation and password visibility.
- Home feed, search, local posts, likes, comments, saved posts, post menus and pagination (20 posts per page).
- Community projects, tag filters, activity ranking, project creation and README/PDF/text attachments.
- 42 projects category prepared for server-verified 42 students; hidden for ordinary users.
- Own profile with photo, bio, skills, links and an Edit profile popup.
- Project discussion rooms: create, read, join/leave, chat, attachments and code sharing.
- C, JavaScript and C++ snippet editor, standard input and output panel.
- Dark/light themes and responsive layouts.

## Preview limitations

This is a frontend prototype. Login does not authenticate against a server. Some data and activity counts are examples. Posts, projects, rooms, chat and attachments are temporary preview state; theme, saved-post IDs and profile edits use browser storage where available.

The Run snippet button does not compile or execute code. Reports and peer requests are local preview actions. Private messages, account management, notifications, public profiles and peer services remain to be implemented/connected.

42 verification, protected access, persistent uploads, account storage, real-time chat and code execution require backend services. Frontend visibility checks do not enforce access control.

## Source structure

- `src/App.jsx`: hash routing and theme state.
- `src/pages/`: Login, Home, Projects and Profile views.
- `src/components/`: shared UI, posts, code blocks and discussion rooms.
- `src/data/`: illustrative project, post and room data.
- `src/utils/storage.js`: guarded browser storage.
- `src/*.css`: shared and page styles.
- `public/logo.png`: SUF logo.
- `docs/`: product plan, compatibility review and backend handoff notes.

## Backend handoff

Read these notes before connecting services:

- [Product plan](docs/PROJECT-PLAN.md)
- [42 sign-in](docs/42-SIGN-IN.md)
- [Projects](docs/PROJECTS-FRONTEND.md)
- [Profile](docs/PROFILE-FRONTEND.md)
- [Discussion rooms](docs/DISCUSSION-ROOMS-FRONTEND.md)
- [Browser compatibility](docs/BROWSER-COMPATIBILITY.md)

`VITE_42_LOGIN_URL` may point to your backend's 42 sign-in endpoint. No sign-in endpoint is configured by default. Never place private secrets in frontend code or Vite environment variables: values exposed to frontend code are public.

Dependencies, generated build output and local environment files are excluded by `.gitignore`. Commit source, documentation, configuration and the lockfile.
