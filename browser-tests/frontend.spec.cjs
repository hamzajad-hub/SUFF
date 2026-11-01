const { test, expect } = require('@playwright/test');
let failures;
function observe(page) {
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) failures.push(message.text());
    });
}
test.beforeEach(async ({ page, context, browser }, testInfo) => {
    failures = [];
    observe(page);
    context.on('page', observe);
    testInfo.annotations.push({ type: 'browser-version', description: browser.version() });
});
test.afterEach(async ({}, testInfo) => {
    if (testInfo.title.includes('missing public')) failures = failures.filter((message) => /Failed to load resource.*404/.test(message) === false);
    if (testInfo.status === 'passed') expect(failures, 'Browser console errors and warnings').toEqual([]);
});

test('public content and legal pages are present before JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    try {
        await page.goto('/projects/react-auth');
        await expect(page.locator('.project-detail')).toContainText('Create a React authentication interface');
        await expect(page).toHaveTitle('React Authentication · SUF');
        await page.goto('/privacy');
        await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
        await expect(page.locator('main')).toContainText('200 messages per pair');
        await page.getByRole('navigation', { name: 'Legal and contact' }).getByRole('link', { name: 'Terms of Service' }).click();
        await expect(page.getByRole('heading', { name: 'Terms of Service', exact: true })).toBeVisible();
    } finally { await context.close(); }
});

test('signup and login preview validate input and show passwords', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    await page.locator('input[name=username]').fill('preview_user');
    await page.locator('input[name=email]').fill('preview@example.test');
    await page.locator('input[name=password]').fill('preview-pass-123');
    await page.locator('input[name=confirm]').fill('different-pass-123');
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    await expect(page.locator('input[name=password]')).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: /Create account/ }).click();
    await expect(page.locator('.notice')).toContainText('do not match');
    await page.locator('input[name=confirm]').fill('preview-pass-123');
    await page.getByRole('button', { name: /Create account/ }).click();
    await expect(page).toHaveURL(/\/home$/);
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.locator('input[name=email]').fill('invalid');
    await page.locator('input[name=password]').fill('preview-pass');
    await page.locator('.auth form').getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('input[name=email]').fill('preview@example.test');
    await page.locator('.auth form').getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(/\/home$/);
});

test('search combines query, types, tags, sorting, pagination, history and empty states', async ({ page }) => {
    await page.goto('/home');
    const search = page.getByRole('searchbox', { name: 'Search community', exact: true });
    await search.fill('React');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=React/);
    await page.getByRole('button', { name: /^Projects \d/ }).click();
    await expect(page.locator('.search-result')).toHaveCount(2);
    await page.getByLabel('Filter by tag', { exact: true }).selectOption('React');
    await page.getByLabel('Sort results', { exact: true }).selectOption('name-asc');
    await expect(page.locator('.search-result h2').first()).toHaveText('React Authentication');
    await page.getByLabel('Sort results', { exact: true }).selectOption('name-desc');
    await expect(page.locator('.search-result h2').first()).toHaveText('SUF Community');
    await page.reload();
    await expect(page.getByLabel('Filter by tag')).toHaveValue('React');
    await expect(page.getByLabel('Sort results')).toHaveValue('name-desc');
    await page.getByRole('link', { name: 'Clear search and filters' }).click();
    await expect(page.locator('.search-result')).toHaveCount(6);
    const first = await page.locator('.search-result h2').first().textContent();
    await page.getByRole('button', { name: 'Next →', exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('.search-result h2').first()).not.toHaveText(first);
    await page.goBack();
    await expect(page.locator('.pagination')).toContainText('Page 1 of');
    await search.fill('no-results-unique-preview');
    await search.press('Enter');
    await expect(page.getByRole('heading', { name: 'No matching results.' })).toBeVisible();
    await search.fill('#C++');
    await search.press('Enter');
    await page.getByRole('button', { name: /^Peers \d/ }).click();
    await expect(page.locator('.search-result h2')).toHaveText('Alex');
});

test('room search links open the correct server-rendered room', async ({ page }) => {
    await page.goto('/search?q=snippets&type=rooms');
    await page.locator('.search-result h2 a').first().click();
    await expect(page).toHaveURL(/\/projects\/[^?]+\?room=/);
    await expect(page.locator('.room-header h3')).toHaveText('#code-help');
    await page.reload();
    await expect(page.locator('.room-header h3')).toHaveText('#code-help');
    await page.getByRole('button', { name: '← All rooms' }).click();
    await expect(page.locator('.room-list')).toBeVisible();
});

test('projects, rooms, messages and file links survive navigation and legal pages', async ({ page }) => {
    await page.goto('/projects');
    await page.getByRole('button', { name: '+ Add project' }).click();
    await page.getByLabel('Project name', { exact: true }).fill('Browser project');
    await page.getByLabel('Short description').fill('A project created by browser testing.');
    await page.getByLabel('Tags, separated by commas').fill('Testing, React');
    await page.locator('#project-brief-file').setInputFiles({ name: 'brief.txt', mimeType: 'text/plain', buffer: Buffer.from('Browser attachment content') });
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    await page.getByRole('button', { name: '+ Create room' }).click();
    await page.getByLabel('Room name', { exact: true }).fill('browser-room');
    await page.getByRole('button', { name: 'Create and join room' }).click();
    await expect(page.getByRole('button', { name: 'Room creator', exact: true })).toBeDisabled();
    await page.getByRole('textbox', { name: 'Message to room' }).fill('Keep this room message');
    await page.getByRole('button', { name: 'Send ↵', exact: true }).click();
    await page.getByRole('button', { name: /^Home$/, exact: false }).click();
    await page.getByRole('navigation', { name: 'Legal and contact' }).getByRole('link', { name: 'Privacy Policy' }).click();
    await page.getByRole('link', { name: '← Back to the community' }).click();
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    const card = page.locator('.project-card').filter({ hasText: 'Browser project' });
    await expect(card).toBeVisible();
    await card.getByRole('link', { name: 'Open project' }).click();
    const download = page.waitForEvent('download');
    await page.locator('.project-attachment').getByRole('link', { name: 'Download', exact: true }).click();
    expect((await download).suggestedFilename()).toBe('brief.txt');
    await page.getByRole('link', { name: 'Open browser-room' }).click();
    await expect(page.locator('.room-log')).toContainText('Keep this room message');
    await page.getByRole('button', { name: 'Manage room', exact: true }).click();
    await page.getByRole('button', { name: 'Delete room', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm delete room', exact: true }).click();
    await expect(page.locator('.room-list')).not.toContainText('browser-room');
});

test('feed pagination, post deep links, comments and saved posts stay consistent', async ({ page }) => {
    await page.goto('/home');
    for (let index = 0; index < 20; index++) {
        await page.getByRole('textbox', { name: 'New post', exact: true }).fill(`Browser post ${index}`);
        await page.getByRole('button', { name: 'Post', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Next →', exact: true }).click();
    await page.getByRole('link', { name: 'Minishell pipe problem', exact: true }).click();
    await expect(page).toHaveURL(/\/posts\/1$/);
    await expect(page.locator('.post-card')).toHaveCount(1);
    const post = page.locator('.post-card');
    await post.getByRole('button', { name: "Comments on hamza's post", exact: true }).click();
    await post.getByRole('textbox', { name: "Comment on hamza's post", exact: true }).fill('Browser comment');
    await post.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(post.locator('.comment-thread')).toContainText('Browser comment');
    await post.locator('summary').click();
    await post.getByRole('button', { name: 'Save post', exact: true }).click();
    await page.getByRole('button', { name: 'Saved posts', exact: true }).click();
    await expect(page).toHaveURL(/saved=1/);
    await expect(page.locator('.post-card')).toHaveCount(1);
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page.locator('.pagination')).toContainText('Page 1 of');
});

test('profile edits, photo preparation, dialog keyboard and theme persist', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit your profile' });
    await expect(dialog.locator('input[name=displayName]')).toBeFocused();
    await dialog.locator('input[name=displayName]').fill('Browser Tester');
    await dialog.getByRole('textbox', { name: 'Bio', exact: true }).fill('A saved browser profile.');
    await dialog.getByLabel('Profile photo', { exact: true }).setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64') });
    await expect(dialog.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.locator('h1')).toContainText('Browser Tester');
    await expect(page.locator('.profile-portrait img')).toBeVisible();
    await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/light-theme/);
    await expect(page.locator('h1')).toContainText('Browser Tester');
    await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
});

test('peer requests can be accepted, cancelled, removed and restored after refresh', async ({ page }) => {
    await page.goto('/peers');
    const meryem = page.locator('.peer-card').filter({ hasText: '@meryem' });
    await meryem.getByRole('button', { name: "Accept meryem's request" }).click();
    await expect(meryem.getByText('✓ Peers', { exact: true })).toBeVisible();
    await meryem.getByRole('button', { name: 'Remove meryem from peers' }).click();
    await meryem.getByRole('button', { name: 'Confirm remove meryem' }).click();
    await meryem.getByRole('button', { name: 'Send peer request to meryem' }).click();
    await meryem.getByRole('button', { name: 'Cancel request to meryem' }).click();
    await page.reload();
    await expect(meryem.getByRole('button', { name: 'Send peer request to meryem' })).toBeVisible();
});

test('attachments validate, preview and can be removed before posting', async ({ page }) => {
    await page.goto('/home');
    const composer = page.locator('.create-post');
    await composer.locator('input[type=file]').setInputFiles({ name: 'program.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('invalid preview file') });
    await expect(composer.locator('.composer-error')).toBeVisible();
    await composer.locator('input[type=file]').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Some notes') });
    await expect(composer.locator('.composer-file')).toContainText('notes.txt');
    await composer.getByRole('button', { name: 'Remove notes.txt' }).click();
    await expect(composer.locator('.composer-file')).toHaveCount(0);
    await expect(composer.getByRole('button', { name: 'Post', exact: true })).toBeDisabled();
});

test('clipboard failure offers a manual copy fallback', async ({ page }) => {
    await page.goto('/posts/1');
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Clipboard blocked for test')) }, configurable: true }));
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect(page.locator('.manual-copy textarea')).toHaveValue(/pipe\(fd\)/);
});

test('blocked browser storage shows a notice without breaking the app', async ({ page }) => {
    await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('Storage blocked'); }; Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; });
    await page.goto('/messages');
    await expect(page.getByRole('heading', { name: 'Messages.' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Browser storage is unavailable or full' })).toBeVisible();
});

test('live chat delivers messages, synchronizes likes and reconnects without losing drafts', async ({ page, browser, baseURL }) => {
    await page.addInitScript(() => { const Native = window.WebSocket; window.__sufTestSockets = []; window.WebSocket = class extends Native { constructor(...args) { super(...args); window.__sufTestSockets.push(this); } }; });
    const otherContext = await browser.newContext({ baseURL });
    const other = await otherContext.newPage();
    observe(other);
    try {
        await page.goto('/messages'); await other.goto('/messages');
        await page.getByLabel('Local live chat demo').selectOption('alex');
        await other.getByLabel('Local live chat demo').selectOption('sara');
        await expect(page.locator('.chat-connection-controls [role=status]')).toContainText('Connected');
        await expect(other.locator('.chat-connection-controls [role=status]')).toContainText('Connected');
        for (const [client, peer] of [[page, 'Sara'], [other, 'Alex']]) {
            await client.getByRole('button', { name: '+ New message' }).click();
            await client.locator('.new-conversation').getByRole('button').filter({ hasText: peer }).click();
        }
        const text = `Browser live chat ${Date.now()}`;
        await page.locator('.direct-composer textarea').fill(text);
        await page.getByRole('button', { name: 'Send ↗', exact: true }).click();
        const received = other.locator('.direct-message').filter({ hasText: text });
        await expect(received).toBeVisible();
        await received.getByRole('button', { name: /^Like message:/ }).click();
        await expect(page.locator('.direct-message').filter({ hasText: text }).getByRole('button', { name: /^Like message:/ })).toContainText('1');
        await page.locator('.direct-composer textarea').fill('Keep my draft');
        await page.evaluate(() => window.__sufTestSockets.find((socket) => socket.url.includes('/__suf_chat') && socket.readyState === WebSocket.OPEN).close());
        await expect(page.locator('.chat-connection-controls [role=status]')).toContainText('Reconnecting');
        await expect(page.getByRole('button', { name: 'Send ↗', exact: true })).toBeDisabled();
        await expect(page.locator('.chat-connection-controls [role=status]')).toContainText('Connected');
        await expect(page.locator('.direct-composer textarea')).toHaveValue('Keep my draft');
    } finally { await otherContext.close(); }
});

test('mobile layouts stay within the viewport and legal links remain accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/home', '/projects', '/peers', '/search', '/privacy', '/terms', '/messages']) {
        await page.goto(path);
        await expect(page.getByRole('navigation', { name: 'Legal and contact' }).getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true);
    }
});

test('missing public records return a real 404 and a usable page', async ({ page }) => {
    const response = await page.goto('/projects/missing-record');
    expect(response.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to Home' }).click();
    await expect(page).toHaveURL(/\/home$/);
});
