export function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

export function serializeState(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export async function renderPage(url, template, render, origin) {
    const { html, route, metadata } = await render(url);
    const description = metadata.description.slice(0, 180);
    const canonical = new URL(metadata.canonical, origin).href;
    const head = `<title>${escapeHtml(metadata.title)}</title>
        <meta name="description" content="${escapeHtml(description)}"/>
        <meta name="robots" content="${metadata.index ? 'index, follow' : 'noindex, nofollow'}"/>
        <link rel="canonical" href="${escapeHtml(canonical)}"/>`;
    const state = `<script id="suf-bootstrap" type="application/json">${serializeState({ route })}</script>`;
    // Callback replacements keep literal '$&' and other replacement patterns intact.
    const document = template.replace('<!--app-head-->', () => head)
        .replace('<!--app-html-->', () => html).replace('<!--app-state-->', () => state);
    return { document, status: metadata.status };
}

export function requestOrigin(request) {
    if (process.env.SITE_URL) {
        const site = new URL(process.env.SITE_URL);
        if (!['https:', 'http:'].includes(site.protocol)) throw new Error('SITE_URL must use HTTP or HTTPS.');
        return site.origin;
    }
    return new URL(`${request.socket.encrypted ? 'https' : 'http'}://${request.headers.host || 'localhost'}`).origin;
}

export function htmlHeaders() {
    return {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
}
