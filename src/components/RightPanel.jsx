import React from 'react';
import {
    recentDiscussions,
    suggestedPeers,
    trendingProjects,
} from '../data/homeData.js';
import PeerActions from './PeerActions.jsx';
import Avatar from './Avatar.jsx';

export default function RightPanel({ relationships = {}, onPeerAction }) {
    return (
        <aside className="right-panel">
            <section className="side-card">
                <div className="side-title">
                    <h2>🔥 Trending Projects</h2>
                    <button type="button">See all →</button>
                </div>
                {trendingProjects.map((project) => (
                    <div
                        className="trend-item"
                        key={project.name}
                    >
                        <span>{project.rank}</span>
                        <div>
                            <b>{project.name}</b>
                            <small>{project.detail}</small>
                        </div>
                        <strong>↑ {project.change}</strong>
                    </div>
                ))}
            </section>

            <section className="side-card">
                <div className="side-title">
                    <h2>♧ Add Peers</h2>
                    <a href="#/peers">See all →</a>
                </div>
                {suggestedPeers.map((peer) => {

                    return (
                        <div
                            className="peer-item"
                            key={peer.name}
                        >
                            <Avatar
                                initials={peer.initials}
                                small
                            />
                            <div>
                                <a className="post-profile-link" href={`#/profile/${peer.name}`}>{peer.name}</a>
                                <small>{peer.detail}</small>
                            </div>
                            <PeerActions username={peer.name} status={relationships[peer.name]} onAction={onPeerAction} compact />
                        </div>
                    );
                })}
            </section>

            <section className="side-card">
                <div className="side-title">
                    <h2>▱ Recent Discussions</h2>
                    <button type="button">See all →</button>
                </div>
                {recentDiscussions.map((discussion) => (
                    <button
                        className="discussion-item"
                        type="button"
                        key={discussion.title}
                    >
                        <span>⌁</span>
                        <span>
                            <b>{discussion.title}</b>
                            <small>{discussion.meta}</small>
                        </span>
                    </button>
                ))}
            </section>
        </aside>
    );
}
