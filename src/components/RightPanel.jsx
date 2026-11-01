import React from 'react';
import { suggestedPeers } from '../data/homeData.js';
import PeerActions from './PeerActions.jsx';
import Avatar from './Avatar.jsx';

export default function RightPanel({ community, relationships = {}, onPeerAction }) {
    const trending = [...community.projects].sort((a, b) => b.discussions - a.discussions).slice(0, 4);
    const rooms = community.projects.flatMap((project) => (community.roomsByProject[project.id] || []).map((room) => ({ ...room, project })))
        .sort((a, b) => b.activity - a.activity).slice(0, 3);
    return <aside className="right-panel">
        <section className="side-card"><div className="side-title"><h2>Trending Projects</h2><a href="/projects">See all →</a></div>
            {trending.map((project, index) => <a className="trend-item" key={project.id} href={`/projects/${encodeURIComponent(project.id)}`}><span>{index + 1}</span><div><b>{project.name}</b><small>{project.discussions} discussions</small></div></a>)}
        </section>
        <section className="side-card"><div className="side-title"><h2>♧ Add Peers</h2><a href="/peers">See all →</a></div>
            {suggestedPeers.map((peer) => <div className="peer-item" key={peer.name}><Avatar initials={peer.initials} small /><div><a className="post-profile-link" href={`/profile/${peer.name}`}>{peer.name}</a><small>{peer.detail}</small></div><PeerActions username={peer.name} status={relationships[peer.name]} onAction={onPeerAction} compact /></div>)}
        </section>
        <section className="side-card"><div className="side-title"><h2>Active Discussion Rooms</h2><a href="/search?type=rooms">See all →</a></div>
            {rooms.map((room) => <a className="discussion-item" key={room.id} href={`/projects/${encodeURIComponent(room.project.id)}?room=${encodeURIComponent(room.id)}`}><span aria-hidden="true">⌁</span><span><b>#{room.name}</b><small>{room.project.name} · {room.activity} messages</small></span></a>)}
        </section>
    </aside>;
}
