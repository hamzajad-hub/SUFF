import React, { useEffect, useState } from 'react';
import { readStorage, writeStorage } from './utils/storage.js';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage.jsx';

function getPageFromHash() {
    const route = window.location.hash.slice(2);
    const base = route.split(/[/?]/)[0];
    return ['home', 'projects', 'profile', 'peers', 'messages', 'forgot-password', 'reset-password'].includes(base) ? route : 'login';
}

export default function App() {
    const [page, setPage] = useState(getPageFromHash);
    const [theme, setTheme] = useState(() => {
        return readStorage('suf-theme', 'dark');
    });

    useEffect(() => {
        function handleHashChange() {
            setPage(getPageFromHash());
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('light-theme', theme === 'light');
        writeStorage('suf-theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((currentTheme) =>
            currentTheme === 'dark' ? 'light' : 'dark',
        );
    }

    function navigate(nextPage) {
        window.location.hash = nextPage === 'home' ? '/home' : '/login';
        setPage(nextPage);
    }

    const recoveryPage = page.split('?')[0];
    if (['forgot-password', 'reset-password'].includes(recoveryPage)) {
        return (
            <PasswordRecoveryPage
                key={page}
                reset={recoveryPage === 'reset-password'}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
        );
    }

    if (page !== 'login') {
        return (
            <HomePage
                section={page.split(/[/?]/)[0]}
                messageUsername={page.startsWith('messages/') ? page.slice(9).split('?')[0] : null}
                profileUsername={page.startsWith('profile/') ? page.slice(8).split('?')[0] : null}
                postId={page.startsWith('home?') ? new URLSearchParams(page.split('?')[1]).get('post') : null}
                projectId={page.startsWith('projects?') ? new URLSearchParams(page.split('?')[1]).get('project') : null}
                onLogOut={() => navigate('login')}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
        );
    }

    return (
        <LoginPage
            onEnter={() => navigate('home')}
            theme={theme}
            onToggleTheme={toggleTheme}
        />
    );
}

