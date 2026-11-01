import React, { useState } from 'react';
import { peerDirectory, searchPeers } from '../data/peersData.js';
import PeerActions from '../components/PeerActions.jsx';

export default function PeersPage({ query = '', relationships, onAction, notice }) {
    const [tab, setTab] = useState('Discover');
    const [localQuery, setLocalQuery] = useState('');
    const incoming = peerDirectory.filter((peer) => relationships[peer.username] === 'incoming').length;
    const connected = peerDirectory.filter((peer) => relationships[peer.username] === 'connected').length;
    const sent = peerDirectory.filter((peer) => relationships[peer.username] === 'outgoing').length;
    const filtered = peerDirectory.filter((peer) => {
        const status = relationships[peer.username] || 'none';
        if (tab === 'My peers') return status === 'connected';
        if (tab === 'Requests') return status === 'incoming';
        if (tab === 'Sent') return status === 'outgoing';
        return true;
    });
    const visible = searchPeers(searchPeers(filtered, query), localQuery);

    return (
        <section className="projects-page peers-page" aria-labelledby="peers-title">
            <header className="projects-heading">
                <div>
                    <span className="eyebrow">BETTER TOGETHER</span>
                    <h1 id="peers-title">Find your peers<span>.</span></h1>
                    <p>Meet the people behind the code. Learn, share, and build together.</p>
                </div>
                <div className="peers-summary"><b>{connected}</b><span>peer{connected === 1 ? '' : 's'} in your circle</span></div>
            </header>
            <div className="project-tabs peers-tabs" aria-label="Peer categories">
                {['Discover', 'My peers', 'Requests', 'Sent'].map((value) => (
                    <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)}>
                        {value}
                        {value !== 'Discover' && <span className="peers-tab-count">{value === 'My peers' ? connected : value === 'Requests' ? incoming : sent}</span>}
                    </button>
                ))}
            </div>
            {notice && <p className="page-notice" role="status">{notice}</p>}
            <label className="peers-search">
                Search people or skills
                <input type="search" value={localQuery} onChange={(event) => setLocalQuery(event.target.value)} placeholder="Try @sara, #React, or C++" />
            </label>
            <div className="project-list-heading"><span>{visible.length} result{visible.length === 1 ? '' : 's'}</span><span>Sample community profiles</span></div>
            <div className="peers-cards">
                {visible.map((peer) => (
                    <article className="peer-card" key={peer.username}>
                        <div className="peer-card-top">
                            <a className="peer-portrait" href={`#/profile/${peer.username}`} aria-label={`View ${peer.username}'s profile`}>{peer.initials}</a>
                            <div>
                                <a className="peer-name" href={`#/profile/${peer.username}`}>{peer.name}</a>
                                {peer.verified42 && <span className="profile-42-badge">42 ✓</span>}
                                <span className="peer-username">@{peer.username}</span>
                            </div>
                        </div>
                        <span className="peer-role">{peer.role}</span>
                        <p>{peer.bio}</p>
                        <div className="profile-skills">{peer.skills.map((skill) => <span key={skill}>#{skill}</span>)}</div>
                        <div className="peer-card-bottom">
                            <a href={`#/profile/${peer.username}`}>View profile ↗</a>
                            <div className="peer-card-connection"><PeerActions username={peer.username} status={relationships[peer.username]} onAction={onAction} />{relationships[peer.username] === 'connected' && <a className="peer-message-link" href={`#/messages/${peer.username}`}>Message ↗</a>}</div>
                        </div>
                    </article>
                ))}
            </div>
            {!visible.length && (
                <div className="profile-empty">
                    <span aria-hidden="true">♧</span>
                    <h2>{query || localQuery ? 'No matching peers.' : tab === 'Requests' ? 'You are all caught up.' : tab === 'Sent' ? 'No pending requests.' : 'Your circle starts here.'}</h2>
                    <p>{query || localQuery ? 'Try another username or skill, or clear both search fields.' : 'Discover people and start a connection with a peer request.'}</p>
                    {tab !== 'Discover' && <button className="project-secondary" type="button" onClick={() => { setTab('Discover'); setLocalQuery(''); }}>Discover peers</button>}
                </div>
            )}
            <p className="profile-preview-note">Frontend preview · Profiles and the initial request are examples. Actions are saved in this browser; no real requests are sent.</p>
        </section>
    );
}
