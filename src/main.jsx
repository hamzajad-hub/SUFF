import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import './home.css';
import './projects.css';
import './profile.css';
import './rooms.css';
import './peers.css';

import './community.css';
import './messages.css';
import './search.css';

const root = document.getElementById('root');
const bootstrap = document.getElementById('suf-bootstrap');
if (bootstrap) {
    const { route } = JSON.parse(bootstrap.textContent);
    hydrateRoot(root, <App initialRoute={route} />);
} else {
    createRoot(root).render(<App />);
}
