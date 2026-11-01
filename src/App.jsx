import React, { useEffect, useState } from 'react';
import { readStorage, writeStorage } from './utils/storage.js';
import { navigate, pageMetadata, resolveRoute } from './utils/routes.js';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import useCommunitySession from './utils/useCommunitySession.js';

export default function App({ initialRoute = resolveRoute('/') }) {
    const [route, setRoute] = useState(initialRoute);
    const [theme, setTheme] = useState('dark');
    const [browserReady, setBrowserReady] = useState(false);
    const community = useCommunitySession();

    useEffect(() => {
        setTheme(readStorage('suf-theme', 'dark') === 'light' ? 'light' : 'dark');
        setBrowserReady(true);
        function readLocation() {
            if (window.location.hash.startsWith('#/')) {
                const legacy = new URL(window.location.hash.slice(1), window.location.origin);
                window.history.replaceState(null, '', legacy.pathname + legacy.search);
            }
            setRoute(resolveRoute(window.location.pathname + window.location.search));
        }
        function followLink(event) {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = event.target.closest?.('a[href]');
            if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self') || anchor.getAttribute('href').startsWith('#')) return;
            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol) || /\.[a-z0-9]+$/i.test(url.pathname)) return;
            event.preventDefault();
            navigate(url.pathname + url.search + url.hash);
        }
        if (window.location.hash.startsWith('#/')) readLocation();
        window.addEventListener('popstate', readLocation);
        window.addEventListener('hashchange', readLocation);
        window.addEventListener('suf:navigate', readLocation);
        document.addEventListener('click', followLink);
        return () => {
            window.removeEventListener('popstate', readLocation);
            window.removeEventListener('hashchange', readLocation);
            window.removeEventListener('suf:navigate', readLocation);
            document.removeEventListener('click', followLink);
        };
    }, []);

    useEffect(() => {
        if (!browserReady) return;
        document.body.classList.toggle('light-theme', theme === 'light');
        writeStorage('suf-theme', theme);
    }, [theme, browserReady]);

    useEffect(() => {
        const meta = pageMetadata(route, community);
        document.title = meta.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
        document.querySelector('meta[name="robots"]')?.setAttribute('content', meta.index ? 'index, follow' : 'noindex, nofollow');
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', new URL(meta.canonical, new URL(canonical.href).origin).href);
    }, [route, community.posts, community.projects, community.roomsByProject]);

    const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
    function view() {
        if (route.page === 'not-found') return <main className="projects-page"><h1>Page not found.</h1><p>This page is unavailable in the current preview.</p><a href="/home">Back to Home</a></main>;
        if (['privacy', 'terms'].includes(route.page)) return <LegalPage terms={route.page === 'terms'} theme={theme} onToggleTheme={toggleTheme} />;
        const privateView = route.page === 'messages' || (route.page === 'profile' && !route.profileUsername)
            || ['forgot-password', 'reset-password'].includes(route.page);
        if (privateView && !browserReady) return <main className="projects-page"><h1>{route.page === 'messages' ? 'Messages' : route.page === 'profile' ? 'Your profile' : 'Account recovery'}</h1><p role="status">Loading your private view…</p><noscript>Enable JavaScript to use this private view.</noscript><a href="/home">Back to Home</a></main>;
        if (['forgot-password', 'reset-password'].includes(route.page)) return <PasswordRecoveryPage key={route.page} reset={route.page === 'reset-password'} theme={theme} onToggleTheme={toggleTheme} />;
        if (route.page === 'login') return <LoginPage onEnter={() => navigate('/home')} theme={theme} onToggleTheme={toggleTheme} />;
        return <HomePage section={route.page} messageUsername={route.messageUsername || null}
            profileUsername={route.profileUsername || null} postId={route.postId || null}
            projectId={route.projectId || null} roomId={route.roomId || null} savedView={route.saved || false}
            search={route.search} community={community} onLogOut={() => { community.reset(); navigate('/login'); }}
            theme={theme} onToggleTheme={toggleTheme} />;
    }
    return <>{view()}<SiteFooter /></>;
}
