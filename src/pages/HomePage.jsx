import React, { useEffect, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage.js';
import { defaultProfile, loadProfile } from '../utils/profile.js';
import { navigate } from '../utils/routes.js';
import PostComposer from '../components/PostComposer.jsx';
import { validatePostFile } from '../utils/community.js';
import Avatar from '../components/Avatar.jsx';
import PostCard from '../components/PostCard.jsx';
import RightPanel from '../components/RightPanel.jsx';
import MessagesPage from './MessagesPage.jsx';
import useLiveChat from '../utils/useLiveChat.js';
import { initialConversations, normalizeConversations, sendDirectMessage, toggleMessageLike } from '../data/messagesData.js';
import PeersPage from './PeersPage.jsx';
import PublicProfilePage from './PublicProfilePage.jsx';
import { peerDirectory, initialRelationships, changeRelationship } from '../data/peersData.js';
import ProfilePage from './ProfilePage.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SearchPage from './SearchPage.jsx';
import { searchUrl } from '../utils/search.js';

const POSTS_PER_PAGE = 20;

export default function HomePage({ onLogOut, theme, onToggleTheme, section = 'home', profileUsername = null, projectId = null, roomId = null, postId = null, messageUsername = null, savedView = false, search, community }) {
    const { posts, setPosts } = community;
    const [demoUsername, setDemoUsername] = useState('');
    const liveChat = useLiveChat(demoUsername, section === 'messages' ? messageUsername : null);
    const [previewConversations, setConversations] = useState(initialConversations);
    const [storageReady, setStorageReady] = useState(false);
    const conversations = demoUsername ? liveChat.conversations : previewConversations;
    const [messageStorageNotice, setMessageStorageNotice] = useState('');
    useEffect(() => {
        if (!storageReady) return;
        const saved = writeStorage('suf-direct-messages', JSON.stringify(previewConversations));
        setMessageStorageNotice(saved ? '' : 'Browser storage is unavailable or full. Messages will remain only for this session.');
    }, [previewConversations, storageReady]);

    function readConversation(username) {
        if (demoUsername) return;
        setConversations((current) => !current[username]?.unread ? current : {
            ...current,
            [username]: { ...current[username], unread: 0 },
        });
    }

    function startConversation(username) {
        if (demoUsername) {
            if (username !== demoUsername && peerDirectory.some((peer) => peer.username === username)) {
                navigate('/messages/' + username);
            }
            return;
        }
        if (!peerDirectory.some((peer) => peer.username === username)) return;
        if (!conversations[username] && relationships[username] !== 'connected') return;
        setConversations((current) => current[username] ? current : {
            ...current, [username]: { username, messages: [], unread: 0 },
        });
        navigate('/messages/' + username);
    }

    const [currentProfile, setCurrentProfile] = useState(defaultProfile);
    const [relationships, setRelationships] = useState(initialRelationships);
    const [peerNotice, setPeerNotice] = useState('');

    function handlePeerAction(username, action) {
        const updated = changeRelationship(relationships, username, action);
        if (updated === relationships) return;
        setRelationships(updated);
        const messages = {
            send: 'Request added to Sent.',
            cancel: 'Request cancelled.',
            accept: 'Request accepted. You are now peers.',
            decline: 'Request declined.',
            remove: 'Peer removed from your circle.',
        };
        const saved = writeStorage('suf-peer-relationships', JSON.stringify(updated));
        setPeerNotice(messages[action] + (saved ? ' Preview only; no real request was sent.' : ' Browser storage is unavailable; this change lasts for this session.'));
    }

    useEffect(() => {
        setPeerNotice('');
    }, [section, profileUsername]);

    useEffect(() => { setQuery(section === 'search' ? search.q : ''); }, [section, search?.q]);

    const activeItem = savedView ? 'Saved posts' : 'Home';

    function updatePost(id, change) {
        setPosts((current) => current.map((post) => post.id === id ? change(post) : post));
    }
    const [query, setQuery] = useState(section === 'search' ? search.q : '');
    const [pageNotice, setPageNotice] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [savedIds, setSavedIds] = useState([]);

    useEffect(() => {
        const readJson = (key, fallback) => {
            try { return JSON.parse(readStorage(key, JSON.stringify(fallback))); }
            catch { return fallback; }
        };
        setConversations(normalizeConversations(readJson('suf-direct-messages', null), peerDirectory.map((peer) => peer.username)));
        setCurrentProfile(loadProfile());
        const stored = readJson('suf-peer-relationships', null);
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
            setRelationships(Object.fromEntries(peerDirectory.map((peer) => [peer.username,
                ['none', 'outgoing', 'incoming', 'connected'].includes(stored[peer.username]) ? stored[peer.username] : 'none',
            ])));
        }
        const saved = readJson('suf-saved-posts', []);
        setSavedIds(Array.isArray(saved) ? saved : []);
        setStorageReady(true);
    }, []);

    useEffect(() => { setCurrentPage(1); }, [postId]);

    function toggleSaved(postId) {
        setSavedIds((current) => {
            const updated = current.includes(postId)
                ? current.filter((id) => id !== postId)
                : [...current, postId];
            if (!writeStorage('suf-saved-posts', JSON.stringify(updated))) {
                setPageNotice('Browser storage is unavailable. Saved posts will stay available until you leave this page.');
            }
            return updated;
        });
        setCurrentPage(1);
    }

    const visiblePosts = useMemo(() => {
        return posts.filter((post) => {
            if (postId) return String(post.id) === postId;
            if (activeItem === 'Saved posts' && !savedIds.includes(post.id)) {
                return false;
            }
            return true;
        });
    }, [posts, activeItem, savedIds, postId]);

    const totalPages = Math.max(
        1,
        Math.ceil(visiblePosts.length / POSTS_PER_PAGE),
    );
    const pageNumber = Math.min(currentPage, totalPages);
    const firstPostIndex = (pageNumber - 1) * POSTS_PER_PAGE;
    const postsOnCurrentPage = visiblePosts.slice(
        firstPostIndex,
        firstPostIndex + POSTS_PER_PAGE,
    );

    function changeSearch(event) {
        setQuery(event.target.value);
        setCurrentPage(1);
    }

    function changePage(nextPage) {
        setCurrentPage(nextPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function selectNavigation(item) {
        if (['Projects', 'Peers', 'Messages', 'Search'].includes(item)) {
            navigate('/' + item.toLowerCase());
            setQuery('');
            setPageNotice('');
        } else if (item === 'Saved posts') {
            navigate('/home?saved=1');
        } else {
            navigate('/home');
        }
        setCurrentPage(1);
        setPageNotice(
            ['Home', 'Saved posts', 'Projects', 'Peers', 'Messages', 'Search'].includes(item)
                ? ''
                : `${item} will be built in the next frontend steps.`,
        );
    }

    function publishPost(text, files) {
        const id = Date.now();
        const attachments = files.map((file, index) => {
            const info = validatePostFile(file);
            const url = community.attach(file, info.mime);
            return { id: id + '-' + index, name: file.name, size: file.size, url, kind: info.kind, mime: info.mime };
        });
        setPosts((current) => [{
            id, author: 'you', initials: 'YO', verified: false, time: 'now',
            tags: ['community'], title: 'New community update', body: text,
            attachments, likes: 0, comments: 0, thread: [],
        }, ...current]);
        setCurrentPage(1);
        setQuery('');
        navigate('/home');
    }

    return (
        <main className="home-page">
            <header className="home-topbar">
                <a
                    className="home-logo"
                    href="/home"
                    aria-label="SUF Home"
                >
                    <img
                        src="/logo.png"
                        style={theme === 'light' ? {
                            filter: 'invert(1) hue-rotate(180deg) contrast(1.35)',
                            mixBlendMode: 'multiply',
                        } : undefined}
                        alt="SUF"
                    />
                </a>

                <form className="global-search" role="search" onSubmit={(event) => { event.preventDefault(); navigate(searchUrl({ ...(section === 'search' ? search : {}), q: query.trim(), page: 1 })); }}>
                    <button type="submit" aria-label="Submit community search">⌕</button>
                    <input
                        type="search"
                        value={query}
                        onChange={changeSearch}
                        aria-label="Search community"
                        maxLength={200}
                        placeholder="Search peers, projects, posts, or #tags"
                    />
                </form>

                <div className="topbar-actions">
                    <button
                        type="button"
                        aria-label="Notifications"
                        disabled
                        title="Notifications are not connected yet"
                    >
                        ♢<i />
                    </button>
                    <button
                        className="theme-toggle"
                        type="button"
                        onClick={onToggleTheme}
                        aria-label={
                            theme === 'dark'
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                        title={
                            theme === 'dark'
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        }
                    >
                        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
                    </button>
                    <a className="profile-header-link" href="/profile" aria-label="Open your profile">
                        <Avatar initials="YO" photo={currentProfile.photo} small />
                    </a>
                    <button
                        className="logout-button"
                        type="button"
                        onClick={onLogOut}
                    >
                        Log out
                    </button>
                </div>
            </header>

            <div className={section !== 'home' ? 'home-grid projects-grid' : 'home-grid'}>
                <Sidebar
                    messageCount={Object.values(conversations).reduce((count, item) => count + (item.unread || 0), 0)}
                    activeItem={section === 'search' ? 'Search' : section === 'messages' ? 'Messages' : section === 'peers' || (section === 'profile' && profileUsername) ? 'Peers' : section === 'projects' ? 'Projects' : section === 'profile' ? '' : activeItem}
                    onSelect={selectNavigation}
                />

                {section === 'search' ? <SearchPage state={search} community={community} /> : section === 'messages' ? (
                    <MessagesPage
                        key={demoUsername || 'preview'}
                        conversations={conversations}
                        selectedUsername={messageUsername}
                        relationships={demoUsername ? Object.fromEntries(peerDirectory.filter((peer) => peer.username !== demoUsername).map((peer) => [peer.username, 'connected'])) : relationships}
                        onStart={startConversation}
                        onRead={readConversation}
                        onSend={(username, text) => demoUsername ? liveChat.send({ type: 'send', recipient: username, text }) : setConversations((current) => sendDirectMessage(current, username, text, relationships[username] === 'connected'))}
                        onLike={(username, id, liked) => demoUsername ? liveChat.send({ type: 'like', recipient: username, id, liked }) : setConversations((current) => toggleMessageLike(current, username, id))}
                        storageNotice={demoUsername ? liveChat.error : messageStorageNotice}
                        demoUsername={demoUsername}
                        onDemoChange={(username) => { setDemoUsername(username); navigate('/messages'); }}
                        connectionStatus={liveChat.status}
                    />
                ) : section === 'peers' ? (
                    <PeersPage relationships={relationships} onAction={handlePeerAction} notice={peerNotice} />
                ) : section === 'profile' && profileUsername && profileUsername !== 'you' ? (
                    <PublicProfilePage
                        key={profileUsername}
                        username={profileUsername}
                        posts={posts}
                        onUpdatePost={updatePost}
                        relationships={relationships}
                        onAction={handlePeerAction}
                        savedIds={savedIds}
                        onToggleSaved={toggleSaved}
                        notice={peerNotice}
                    />
                ) : section === 'profile' ? (
                    <ProfilePage
                        currentProfile={currentProfile}
                        onProfileChange={setCurrentProfile}
                        posts={posts}
                        onUpdatePost={updatePost}
                        account={{ peerCount: Object.values(relationships).filter((status) => status === 'connected').length, projectCount: community.projects.filter((project) => project.owner === 'you').length }}
                        savedIds={savedIds}
                        onToggleSaved={toggleSaved}
                    />
                ) : section === 'projects' ? (
                    <ProjectsPage community={community} initialProjectId={projectId} initialRoomId={roomId} />
                ) : (
                <section className="feed-column">
                    {pageNotice && (
                        <p
                            className="page-notice"
                            role="status"
                        >
                            {pageNotice}
                        </p>
                    )}

                    {peerNotice && <p className="page-notice" role="status">{peerNotice}</p>}

                    <PostComposer photo={currentProfile.photo} onPublish={publishPost} />

                    {postId && <p className="page-notice"><a href="/home">← Back to all posts</a> · Public post preview</p>}

                    <div className="post-list">
                        {postsOnCurrentPage.map((post) => (
                            <PostCard
                                post={post}
                                authorPhoto={post.author === 'you' ? currentProfile.photo : null}
                                onUpdatePost={updatePost}
                                key={post.id}
                                saved={savedIds.includes(post.id)}
                                onToggleSaved={() => toggleSaved(post.id)}
                                peerStatus={relationships[post.author]}
                                onPeerAction={handlePeerAction}
                            />
                        ))}

                        {visiblePosts.length === 0 && (
                            <div className="empty-results">
                                <b>{postId ? 'This post is unavailable in this preview session.' : activeItem === 'Saved posts' ? 'No saved posts found.' : 'No matching posts yet.'}</b>
                                <span>Try another name, project, or #tag.</span>
                            </div>
                        )}
                    </div>

                    {visiblePosts.length > 0 && (
                        <nav
                            className="pagination"
                            aria-label="Post pages"
                        >
                            <button
                                type="button"
                                disabled={pageNumber === 1}
                                onClick={() => changePage(pageNumber - 1)}
                            >
                                ← Previous
                            </button>
                            <span>
                                Page {pageNumber} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={pageNumber === totalPages}
                                onClick={() => changePage(pageNumber + 1)}
                            >
                                Next →
                            </button>
                        </nav>
                    )}
                </section>

                )}

                {section === 'home' && <RightPanel community={community} relationships={relationships} onPeerAction={handlePeerAction} />}
            </div>

        </main>
    );
}
