import React, { useState } from 'react';
import { peerDirectory } from '../data/peersData.js';
import { communityProjects } from '../data/projectsData.js';
import PeerActions from '../components/PeerActions.jsx';
import PostCard from '../components/PostCard.jsx';

export default function PublicProfilePage({ username, posts, onUpdatePost, relationships, onAction, savedIds, onToggleSaved, notice }) {
    const [tab, setTab] = useState('Posts');
    const peer = peerDirectory.find((person) => person.username === username);
    if (!peer) {
        return <section className="projects-page profile-empty"><h1>Profile not found.</h1><p>This user is not in the preview directory.</p><a className="project-secondary" href="#/peers">Back to peers</a></section>;
    }
    const userPosts = posts.filter((post) => post.author === peer.username);
    const projects = communityProjects.filter((project) => project.owner === peer.username);
    const status = relationships[peer.username] || 'none';

    return (
        <section className="projects-page profile-page" aria-labelledby="public-profile-title">
            <a className="public-profile-back" href="#/peers">← Back to peers</a>
            <div className="profile-cover">
                <span className="eyebrow">PART OF THE COMMUNITY</span>
                <span className="profile-cover-code" aria-hidden="true">{'{ learn. connect. build. }'}</span>
            </div>
            <div className="profile-summary">
                <div className="profile-portrait"><span>{peer.initials}</span></div>
                <div className="public-profile-actions">
                    <PeerActions
                        username={peer.username}
                        status={status}
                        onAction={onAction}
                    />
                    {status === 'connected' && (
                        <a
                            className="project-primary peer-message-link"
                            href={`#/messages/${peer.username}`}
                        >
                            Send message
                        </a>
                    )}
                </div>
                <div className="profile-identity">
                    <h1 id="public-profile-title">{peer.name}{peer.verified42 && <span className="profile-42-badge">42 ✓</span>}</h1>
                    <span className="profile-handle">@{peer.username} · {peer.role}</span>
                    <p>{peer.bio}</p>
                    {peer.verified42 && <p className="profile-intra">Verified 42 student · {peer.username} · {peer.campus}</p>}
                    <div className="profile-skills" aria-label="Skills and interests">{peer.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
                <div className="profile-stats">
                    <div><b>{peer.peerCount + (status === 'connected' ? 1 : 0)}</b><span>Peers</span></div>
                    <div><b>{userPosts.length}</b><span>Posts</span></div>
                    <div><b>{projects.length}</b><span>Community projects</span></div>
                </div>
            </div>
            {notice && <p className="page-notice" role="status">{notice}</p>}
            <div className="project-tabs" aria-label="Public profile activity">
                {['Posts', 'Projects', 'Discussion rooms'].map((value) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)}>{value}</button>)}
            </div>
            {tab === 'Posts' && userPosts.length > 0 ? (
                <div className="post-list">
                    {userPosts.map((post) => <PostCard onUpdatePost={onUpdatePost} key={post.id} post={post} saved={savedIds.includes(post.id)} onToggleSaved={() => onToggleSaved(post.id)} peerStatus={status} onPeerAction={onAction} />)}
                </div>
            ) : tab === 'Projects' && projects.length > 0 ? (
                <div className="peers-public-projects">
                    {projects.map((project) => (
                        <article className="project-card" key={project.id}>
                            <h2>{project.name}</h2><p>{project.summary}</p>
                            <div className="project-tags">{project.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                            <a className="project-open" href={`#/projects?project=${encodeURIComponent(project.id)}`}>Open project ↗</a>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="profile-empty">
                    <span aria-hidden="true">{tab === 'Discussion rooms' ? '▱' : '♧'}</span>
                    <h2>{tab === 'Discussion rooms' ? 'Discussion activity coming soon.' : `No public ${tab.toLowerCase()} yet.`}</h2>
                    <p>{tab === 'Discussion rooms' ? 'Public room activity will appear when account services are connected.' : 'Check back when this peer shares something new.'}</p>
                </div>
            )}
            <p className="profile-preview-note">Sample public profile · Verification and activity are example data. Saved posts and account settings are private.</p>
        </section>
    );
}

