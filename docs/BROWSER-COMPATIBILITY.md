# SUF browser compatibility

Tested: 1 November 2026. **42 browser checks passed, with zero failed, skipped or flaky tests.** The 11 Node unit/integration checks and both production bundles also passed.

| Browser | Tested version | Checks passed |
| --- | --- | --- |
| Google Chrome, installed stable channel | 156.0.8078.79 | 14 / 14 |
| Microsoft Edge, installed stable channel | 156.0.4314.58 | 14 / 14 |
| Firefox, Playwright test build | 157.0 | 14 / 14 |

The reproducible suite is `browser-tests/frontend.spec.cjs`, configured by `playwright.config.cjs`. Exact run metadata is stored in [browser-validation.json](browser-validation.json). Tests ran headlessly with isolated Windows browser profiles against the Vite SSR server on WSL1. Desktop viewport: 1365×900; responsive layout viewport: 390×844.

## Flows verified in each browser

1. Public project content and substantive legal pages without JavaScript.
2. Signup/login preview validation, password visibility and logout navigation.
3. Global search: text, hashtags, types, tags, sorting, pagination, reload, history and empty results.
4. Exact discussion-room links, SSR reload and Back to rooms.
5. Created projects, rooms, messages and file downloads surviving navigation, including legal pages; creator membership and room deletion.
6. Feed pagination after 20 created posts, individual-post links, comments and saved-post navigation.
7. Profile edits, avatar preparation, native modal focus/Escape, theme and storage persistence.
8. Accepting, cancelling and removing preview peer relationships, including reload.
9. File-type validation, selected-file previews and removal before posting.
10. Manual code-copy fallback when clipboard access is denied.
11. Graceful behavior and notices when browser storage is blocked.
12. Two-browser-context WebSocket delivery, reaction synchronization, reconnect and draft retention.
13. Seven main views fitting a 390px viewport, with accessible legal footer links.
14. Real HTTP 404 for missing public records and working recovery navigation.

Tests monitor page exceptions and console errors/warnings. The expected resource-level 404 in the missing-page test is allowed; JavaScript exceptions and unexpected console errors are not. The final run passed without unexpected console errors or warnings. Font requests are local; their files and SIL licenses are in `public/fonts`.

## Reproduce

Install project dependencies and native Chrome/Edge. Install Playwright's isolated Firefox browser:

```sh
pnpm install
pnpm exec playwright install firefox
pnpm dev
```

With the server running, use another terminal:

```sh
pnpm test:browser
```

npm commands are also supported. Override `PLAYWRIGHT_BASE_URL` to target a different test server. Reports and failure traces/screenshots are written to ignored `test-results` and `playwright-report` directories. On WSL1, use native Windows Node for the Windows browser processes.

## Limits and future checks

These are the actual versions executed, not a guarantee about every future release. Re-run after dependency/browser updates. Firefox here is Playwright's browser build; release testing should also include the team's stock Firefox installation. Safari, physical iOS/Android devices, assistive technologies and real account/backend integrations were not tested. Mobile checks use desktop-browser viewports, not physical devices. Media codec coverage is not exhaustive.

Authentication, persistent uploads, real online presence and production private-message authorization remain backend work. Test those integrations in each supported browser once available. This report documents the implemented preview; it does not claim full WCAG compliance or completed backend modules.

Tooling references: [Playwright browsers](https://playwright.dev/docs/browsers), [test projects](https://playwright.dev/docs/test-projects).
