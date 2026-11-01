import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { pageMetadata, resolveRoute } from './utils/routes.js';

export function render(url) {
    let route = resolveRoute(url);
    const metadata = pageMetadata(route);
    if (metadata.status === 404) route = { page: 'not-found' };
    return { html: renderToString(<App initialRoute={route} />), route, metadata };
}
