import { initialPosts } from '../data/homeData.js';
import { communityProjects } from '../data/projectsData.js';
import { peerDirectory } from '../data/peersData.js';
import { seedRooms } from '../data/roomsData.js';
import { parseSearch, searchUrl } from './search.js';

export function resolveRoute(value = '/') {
    const url = new URL(value, 'http://suf.local');
    let parts;
    try { parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent); }
    catch { return { page: 'not-found' }; }
    const [page = 'login', id] = parts;
    if (parts.length > 2) return { page: 'not-found' };
    if (page === 'posts' && id) return { page: 'home', postId: id };
    if (page === 'projects') return { page, projectId: id || url.searchParams.get('project') || null, roomId: url.searchParams.get('room') || null };
    if (page === 'search' && !id) return { page, search: parseSearch(url.searchParams) };
    if (page === 'profile') return { page, profileUsername: id === 'you' ? null : id || null };
    if (page === 'messages') return { page, messageUsername: id || null };
    if (!id && ['login', 'home', 'peers', 'privacy', 'terms', 'forgot-password', 'reset-password'].includes(page)) {
        return { page, ...(page === 'home' ? { postId: url.searchParams.get('post') || null, saved: url.searchParams.get('saved') === '1' } : {}) };
    }
    return { page: 'not-found' };
}

export function routePath(route) {
    if (route.page === 'home') return route.postId ? `/posts/${encodeURIComponent(route.postId)}` : route.saved ? '/home?saved=1' : '/home';
    if (route.page === 'search') return searchUrl(route.search);
    if (route.page === 'projects') return route.projectId ? `/projects/${encodeURIComponent(route.projectId)}${route.roomId ? '?room=' + encodeURIComponent(route.roomId) : ''}` : '/projects';
    if (route.page === 'profile') return route.profileUsername ? `/profile/${encodeURIComponent(route.profileUsername)}` : '/profile';
    if (route.page === 'messages') return route.messageUsername ? `/messages/${encodeURIComponent(route.messageUsername)}` : '/messages';
    return route.page === 'not-found' ? '/404' : `/${route.page}`;
}

export function pageMetadata(route, community = {}) {
    const base = { title: 'SUF · Stack Under Flow', description: 'Share projects, meet developer peers, and solve coding problems together.', canonical: routePath(route), index: true, status: 200 };
    const missing = () => ({ ...base, title: 'Page not found · SUF', description: 'This public page is unavailable.', index: false, status: 404 });
    if (route.page === 'not-found') return missing();
    if (route.postId) {
        const post = (community.posts || initialPosts).find((item) => String(item.id) === route.postId);
        return post ? { ...base, title: `${post.title} · SUF`, description: post.body } : missing();
    }
    if (route.projectId) {
        const project = (community.projects || communityProjects).find((item) => item.id === route.projectId);
        if (project && route.roomId) {
            const room = (community.roomsByProject?.[project.id] || seedRooms(project)).find((item) => item.id === route.roomId);
            return room ? { ...base, title: `#${room.name} · ${project.name} · SUF`, description: room.topic } : missing();
        }
        return project ? { ...base, title: `${project.name} · SUF`, description: project.summary } : missing();
    }
    if (route.profileUsername) {
        const peer = peerDirectory.find((item) => item.username === route.profileUsername);
        return peer ? { ...base, title: `${peer.name} (@${peer.username}) · SUF`, description: peer.bio } : missing();
    }
    if (route.page === 'projects') return { ...base, title: 'Community projects · SUF' };
    if (route.page === 'peers') return { ...base, title: 'Find your peers · SUF' };
    if (route.page === 'search') return { ...base, title: 'Search the community · SUF', index: false };
    if (route.saved) return { ...base, title: 'Saved posts · SUF', index: false };
    if (route.page === 'privacy') return { ...base, title: 'Privacy Policy · SUF', description: 'How the SUF project preview handles browser storage, public content, and local chat data.' };
    if (route.page === 'terms') return { ...base, title: 'Terms of Service · SUF', description: 'Participation rules and preview limitations for the SUF developer community.' };
    if (['login', 'messages', 'profile', 'forgot-password', 'reset-password'].includes(route.page)) {
        return { ...base, title: `${{ login: 'Log in', messages: 'Messages', profile: 'Your profile', 'forgot-password': 'Account recovery', 'reset-password': 'Reset password' }[route.page]} · SUF`, index: false };
    }
    return base;
}

export function navigate(path, { replace = false } = {}) {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin) throw new Error('Internal navigation requires the same origin.');
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash);
    window.dispatchEvent(new Event('suf:navigate'));
}
