import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { renderPage, serializeState } from '../server/renderPage.js';
import { resolveRoute, pageMetadata } from '../src/utils/routes.js';

let vite, render, App, template;
before(async () => {
    vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, logLevel: 'error' });
    ({ render } = await vite.ssrLoadModule('/src/entry-server.jsx'));
    ({ default: App } = await vite.ssrLoadModule('/src/App.jsx'));
    template = await readFile('index.html', 'utf8');
});
after(async () => { await vite?.close(); });

test('public routes deliver real content and page metadata without a browser', async () => {
    assert.equal(typeof window, 'undefined');
    for (const [path, content] of [
        ['/home', 'Minishell pipe problem'],
        ['/projects', 'Docker Lab'],
        ['/projects/react-auth', 'Create a React authentication interface'],
        ['/posts/1', 'execution.c'],
        ['/profile/sara', 'Frontend developer'],
    ]) {
        const page = await renderPage(path, template, render, 'https://suf.example');
        assert.equal(page.status, 200);
        assert.ok(page.document.includes(content), path);
        assert.match(page.document, /<meta name="description"/);
        assert.match(page.document, /<meta name="robots" content="index, follow"/);
        assert.ok(page.document.includes(`https://suf.example${path}`));
        assert.ok(!page.document.includes('<!--app-html-->'));
        const state = JSON.parse(page.document.match(/id="suf-bootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1]);
        assert.deepEqual(Object.keys(state), ['route']);
    }
});

test('private routes exclude messages, profile storage, and recovery secrets from HTML', () => {
    for (const url of ['/messages/yassine', '/profile', '/reset-password?token=super-secret']) {
        const result = render(url);
        assert.equal(result.metadata.index, false);
        assert.ok(result.html.includes('Loading your private view'));
        assert.ok(!result.html.includes('How is the SUF'));
        assert.ok(!JSON.stringify(result).includes('super-secret'));
    }
});

test('unknown pages and missing public records return 404', () => {
    for (const path of ['/missing', '/projects/missing', '/posts/999', '/profile/missing', '/profile/alex/extra']) {
        const result = render(path);
        assert.equal(result.metadata.status, 404, path);
        assert.match(result.html, /Page not found/);
    }
    assert.deepEqual(resolveRoute('/projects?project=react-auth'), resolveRoute('/projects/react-auth'));
    assert.equal(pageMetadata(resolveRoute('/home?post=1')).canonical, '/posts/1');
});

test('serialized state and metadata cannot break out into executable HTML', async () => {
    const payload = '</script><script>alert(1)</script>';
    assert.ok(!serializeState({ value: payload }).includes('<'));
    assert.equal(JSON.parse(serializeState({ value: payload })).value, payload);
    const page = await renderPage('/', template, () => ({ html: '<p>safe</p>', route: { page: payload }, metadata: { title: payload, description: '" onload="alert(1)', canonical: '/home', index: true, status: 200 } }), 'https://suf.example');
    assert.ok(!page.document.includes('<script>alert(1)</script>'));
    assert.match(page.document, /&quot; onload=&quot;/);
});

test('hydration restores browser state, supports navigation and keeps public HTML stable', async () => {
    const { document: html } = await renderPage('/projects/react-auth', template, render, 'https://suf.example');
    const dom = new JSDOM(html, { url: 'http://localhost:5173/projects/react-auth', pretendToBeVisual: true });
    const savedGlobals = new Map();
    for (const name of ['window', 'document', 'navigator', 'Event', 'HTMLElement']) {
        savedGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
        Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
    }
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    dom.window.scrollTo = () => {};
    dom.window.localStorage.setItem('suf-theme', 'light');
    dom.window.localStorage.setItem('suf-profile', JSON.stringify({ name: 'Private user', photo: 'data:image/png;base64,private' }));
    dom.window.localStorage.setItem('suf-direct-messages', JSON.stringify({ yassine: { username: 'yassine', unread: 0, messages: [{ id: 'private-1', sender: 'you', text: 'Private stored message', time: '2026-11-01T10:00:00Z' }] } }));
    const errors = [];
    const originalError = console.error;
    console.error = (...args) => errors.push(args.map(String).join(' '));
    let root;
    try {
        const { hydrateRoot } = await import('react-dom/client');
        const route = JSON.parse(document.getElementById('suf-bootstrap').textContent).route;
        await act(async () => { root = hydrateRoot(document.getElementById('root'), React.createElement(App, { initialRoute: route }), { onRecoverableError: (error) => errors.push(error.message) }); });
        assert.ok(document.querySelector('.project-detail').textContent.includes('React Authentication'));
        assert.ok(document.body.classList.contains('light-theme'));
        assert.ok(!html.includes('Private user'));
        assert.ok(!html.includes('Private stored message'));
        await act(async () => document.querySelector('.project-back').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, button: 0 })));
        assert.equal(window.location.pathname, '/projects');
        assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://suf.example/projects');
        assert.equal(document.querySelector('.project-detail'), null);
        await act(async () => document.querySelector('a[href="/profile"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, button: 0 })));
        assert.equal(window.location.pathname, '/profile');
        assert.ok(document.querySelector('h1').textContent.includes('Private user'));
        // Existing #/ links still migrate after hydration.
        await act(async () => {
            window.history.replaceState(null, '', '/#/messages/yassine');
            window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'));
        });
        assert.equal(window.location.pathname, '/messages/yassine');
        assert.equal(window.location.hash, '');
        assert.ok(document.body.textContent.includes('Private stored message'));
        await act(async () => {
            window.history.pushState(null, '', '/projects/react-auth');
            window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
        });
        assert.ok(document.querySelector('.project-detail'));
        assert.deepEqual(errors, []);
    } finally {
        if (root) await act(async () => root.unmount());
        console.error = originalError;
        dom.window.close();
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
        for (const [name, descriptor] of savedGlobals) {
            if (descriptor) Object.defineProperty(globalThis, name, descriptor);
            else delete globalThis[name];
        }
    }
});
