import React, { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { peerDirectory, searchPeers } from '../data/peersData.js';
import { conversationList } from '../data/messagesData.js';

function timeLabel(value) {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessagesPage({ conversations, selectedUsername, relationships, onStart, onSend, onLike, onRead, storageNotice }) {
    const [query, setQuery] = useState('');
    const [peerQuery, setPeerQuery] = useState('');
    const [newChat, setNewChat] = useState(false);
    const [drafts, setDrafts] = useState({});
    const [status, setStatus] = useState('');
    const log = useRef(null);
    const composer = useRef(null);
    const activePeer = peerDirectory.find((peer) => peer.username === selectedUsername);
    const conversation = activePeer ? conversations[selectedUsername] : null;
    const messages = conversation?.messages || [];
    const connected = activePeer && relationships[selectedUsername] === 'connected';
    const draft = drafts[selectedUsername] || '';
    const list = conversationList(conversations, query, peerDirectory);
    const myPeers = searchPeers(peerDirectory.filter((peer) => relationships[peer.username] === 'connected'), peerQuery);
    const unread = Object.values(conversations).reduce((count, item) => count + (item.unread || 0), 0);

    useEffect(() => {
        setStatus('');
        setNewChat(false);
        if (selectedUsername) onRead(selectedUsername);
    }, [selectedUsername]);

    useEffect(() => {
        if (log.current) log.current.scrollTop = log.current.scrollHeight;
    }, [selectedUsername, messages.length]);

    function send(event) {
        event.preventDefault();
        if (!connected || !draft.trim()) return;
        onSend(selectedUsername, draft);
        setDrafts((current) => ({ ...current, [selectedUsername]: '' }));
        setStatus('Message saved in this browser preview. It has not been delivered to another user.');
        composer.current?.focus();
    }

    return (
        <section className="projects-page messages-page" aria-labelledby="messages-title">
            <header className="projects-heading">
                <div>
                    <span className="eyebrow">KEEP THE CONVERSATION GOING</span>
                    <h1 id="messages-title">Messages<span>.</span></h1>
                    <p>A little help, a new idea, or your next collaboration.</p>
                </div>
                <button className="project-primary" type="button" onClick={() => setNewChat(!newChat)} aria-expanded={newChat}>+ New message</button>
            </header>
            {storageNotice && <p className="page-notice" role="status">{storageNotice}</p>}
            <div className={`messages-layout${activePeer ? ' has-active-chat' : ''}${newChat ? ' choosing-conversation' : ''}`}>
                <aside className="conversation-sidebar" aria-label="Conversations">
                    <div className="conversation-list-heading"><b>Inbox</b><span>{unread} unread</span></div>
                    <label className="conversation-search">Search conversations<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or message text" /></label>
                    {newChat && (
                        <section className="new-conversation" aria-label="Start a conversation">
                            <h2>Message a peer</h2>
                            <label>Find a peer<input type="search" value={peerQuery} onChange={(event) => setPeerQuery(event.target.value)} placeholder="Search your peers" /></label>
                            {myPeers.map((peer) => <button key={peer.username} type="button" onClick={() => { onStart(peer.username); setNewChat(false); }}><Avatar initials={peer.initials} small showStatus={false} /><span>{peer.name}<small>@{peer.username}</small></span><span aria-hidden="true">↗</span></button>)}
                            {!myPeers.length && <p>No matching peers. <a href="#/peers">Find your peers</a> to start a conversation.</p>}
                        </section>
                    )}
                    <div className="conversation-list">
                        {list.map((item) => {
                            const peer = peerDirectory.find((person) => person.username === item.username);
                            const latest = item.messages[item.messages.length - 1];
                            return (
                                <button className={selectedUsername === item.username ? 'conversation-item selected' : 'conversation-item'} key={item.username} type="button" aria-current={selectedUsername === item.username ? 'page' : undefined} onClick={() => onStart(item.username)}>
                                    <Avatar initials={peer.initials} small showStatus={false} />
                                    <span className="conversation-item-text"><b>{peer.name}</b><small>{latest ? `${latest.sender === 'you' ? 'You: ' : ''}${latest.text}` : 'Start the conversation'}</small></span>
                                    <span className="conversation-meta">{latest && <time dateTime={latest.time}>{timeLabel(latest.time)}</time>}{item.unread > 0 && <b aria-label={`${item.unread} unread messages`}>{item.unread}</b>}</span>
                                </button>
                            );
                        })}
                        {!list.length && <div className="conversation-empty"><b>{query ? 'No matching conversations.' : 'Your inbox is ready.'}</b><p>{query ? 'Try another name or message.' : 'Choose New message to chat with a peer.'}</p></div>}
                    </div>
                </aside>
                {activePeer ? (
                    <section className="direct-chat" aria-label={`Conversation with ${activePeer.name}`}>
                        <header className="direct-chat-header">
                            <a className="chat-mobile-back" href="#/messages" aria-label="Back to inbox">←</a>
                            <a className="direct-chat-person" href={`#/profile/${activePeer.username}`}><Avatar initials={activePeer.initials} small showStatus={false} /><span><b>{activePeer.name}</b><small>@{activePeer.username} · {connected ? 'Your peer' : 'Public profile'}</small></span></a>
                            <a className="direct-profile-link" href={`#/profile/${activePeer.username}`}>View profile ↗</a>
                        </header>
                        <div className="direct-message-log" role="log" aria-label="Direct messages" aria-relevant="additions" ref={log}>
                            <p className="direct-chat-intro">Only this browser preview is connected. The initial conversation is an example.</p>
                            {messages.map((message, index) => {
                                const day = new Date(message.time).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
                                const previousDay = index ? new Date(messages[index - 1].time).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : null;
                                return (
                                    <React.Fragment key={message.id}>
                                        {day !== previousDay && <div className="direct-date-divider"><span>{day}</span></div>}
                                        <article className={message.sender === 'you' ? 'direct-message outgoing' : 'direct-message incoming'}>
                                            <div className="direct-message-bubble"><p>{message.text}</p><div><time dateTime={message.time}>{timeLabel(message.time)}</time>{message.sender === 'you' && <small>Saved locally</small>}<button type="button" aria-label={`Like message: ${message.text.slice(0, 35)}`} aria-pressed={message.liked} onClick={() => onLike(selectedUsername, message.id)}>♡ {message.liked ? 1 : 0}</button></div></div>
                                        </article>
                                    </React.Fragment>
                                );
                            })}
                            {!messages.length && <div className="direct-start"><span aria-hidden="true">◇</span><h2>Say hello to {activePeer.name}.</h2><p>A question or a shared idea is a good place to start.</p></div>}
                        </div>
                        <form className="direct-composer" onSubmit={send}>
                            {!connected && <p className="page-notice">Become peers to send messages. <a href={`#/profile/${activePeer.username}`}>Open profile</a></p>}
                            <label><span className="visually-hidden">Message to {activePeer.username}</span><textarea ref={composer} value={draft} onChange={(event) => setDrafts((current) => ({ ...current, [selectedUsername]: event.target.value }))} disabled={!connected} maxLength={5000} rows={3} placeholder={`Message ${activePeer.name}...`} /></label>
                            <div className="direct-composer-actions"><span>{draft.length}/5000 · Text messages</span><button className="project-primary" type="submit" disabled={!connected || !draft.trim()}>Send ↗</button></div>
                            {status && <p className="direct-send-status" role="status">{status}</p>}
                        </form>
                    </section>
                ) : (
                    <section className="direct-chat direct-welcome">
                        <span aria-hidden="true">◇</span><h2>{selectedUsername ? 'This user is unavailable.' : 'Your peers, one conversation away.'}</h2><p>{selectedUsername ? 'Choose a conversation or start a new message.' : 'Select a conversation or start a new one with a peer.'}</p>
                        <button className="project-secondary" type="button" onClick={() => setNewChat(true)}>Start a conversation</button>
                    </section>
                )}
            </div>
            <p className="profile-preview-note">Frontend preview · Messages and likes are saved in this browser where storage is available. Real delivery, presence, and live updates need the backend.</p>
        </section>
    );
}

