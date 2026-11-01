# Server-side rendering

SUF uses request-time React SSR with Vite. The Node server renders public page content into HTML before responding; `hydrateRoot` attaches React interactions in the browser. This is not a loading-only shell or a build-time HTML export.

## Public pages

- `/home`: public posts and their content.
- `/posts/1`: an individual public post, including its code snippet.
- `/projects`: the public project list.
- `/projects/react-auth`: a project brief and discussion-room list.
- `/peers` and `/profile/sara`: public community profiles.

Public content currently comes from shared sample-data modules. Replace these server-side lookups with the backend's public APIs/database queries when those services are ready. Locally created posts, projects, files, and profile edits are still browser state; they are not durable public SSR records.

Public pages include a relevant title, description, canonical URL, and index/follow metadata. Missing routes and missing public records respond with HTTP 404. Private messages, the user's own profile, and recovery pages return a shell with noindex/nofollow metadata; browser-only content mounts after hydration. Login also uses noindex metadata. This does not replace backend authentication or authorization.

## Routing and hydration

Normal path URLs replace hash routing. Internal links use the History API after hydration. Existing `#/...` bookmarks migrate after the initial page hydrates. Old `/home?post=1` and `/projects?project=react-auth` URLs still resolve, with clean canonical URLs.

Server rendering and the first client render use identical public defaults. Browser theme, profile, saved posts, relationships, and cached messages load only after hydration. No localStorage data or account secrets are serialized into HTML. Bootstrap JSON contains only route identifiers and escapes `<` and JavaScript line separators. Reset tokens are excluded from SSR output and removed from the address bar after the browser reads them.

## Run and deploy

Requires Node.js 22 or later.

```sh
pnpm install
pnpm dev
```

Development uses Vite SSR and keeps the local WebSocket chat demo. To test on trusted Wi-Fi from Linux/WSL:

```sh
SUF_CHAT_LAN=1 pnpm dev --host 0.0.0.0
```

Production:

```sh
pnpm build
pnpm start
```

The build produces `dist/client` (browser assets) and `dist/server/entry-server.js` (React renderer). `server/index.js` is the production HTTP entry point and defaults to `http://127.0.0.1:4173`. `pnpm preview` runs that same server. npm commands are also supported.

Copy `.env.example` to `.env` if needed. The production server loads it using Node's environment-file reader. Configure `SITE_URL` to the public HTTPS origin for canonical links. `HOST` and `PORT` control the listener; use `HOST=0.0.0.0` inside a container. Put the server behind the team's HTTPS reverse proxy. Static-only hosting cannot run request-time SSR. Container deployment remains the team's integration work.

Production never starts the unauthenticated sample-user chat server. Real chat still needs the authenticated backend. The development demo remains available in Vite, including trusted Wi-Fi testing.

## Verify the module

```sh
pnpm test
pnpm build
pnpm start
curl -i http://localhost:4173/projects/react-auth
```

The response must contain the project title and brief without running JavaScript. View Page Source or temporarily disable JavaScript to inspect this. Confirm metadata and HTTP 404 for missing projects. Re-enable JavaScript and check navigation, themes, saved state, and interactions without hydration errors. Test chat in two tabs/devices using the development server.

Tests cover public HTML, private-state exclusion, missing records, escaped metadata/state, hydration with existing storage, theme restoration, link navigation, browser history, and legacy links. Chat tests remain in the suite. Actual performance depends on backend latency and should be measured after integration.

## Subject module

This implements **Web → Minor: Server-Side Rendering (SSR) for improved performance and SEO**, worth 1 point if validated. Demonstrate content before JavaScript, hydration, clean URLs, metadata, and the production server. Unrelated mandatory backend/database/deployment work remains.

References: [Vite SSR](https://vite.dev/guide/ssr), [React renderToString](https://react.dev/reference/react-dom/server/renderToString), [React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot).
