import React, { useEffect, useRef, useState } from 'react';
import VoteControls from './VoteControls.jsx';
import { canManageRoom, removeRoomMember, roomMembers, setRoomJoined, voteOn } from '../utils/community.js';
import CodeBlock from './CodeBlock.jsx';
import { rankRooms, snippetTemplates } from '../data/roomsData.js';

function RoomChat({ project, room, onUpdate, onActivity, onBack, onAttach, onDelete }) {
    const [messageSort, setMessageSort] = useState('top');
    const [manageOpen, setManageOpen] = useState(false);
    const [deletePending, setDeletePending] = useState(false);
    const manager = canManageRoom(project, room);
    const members = roomMembers(room);
    const sortedMessages = room.messages.map((message, index) => ({ ...message, index }))
        .sort((a, b) => messageSort === 'top'
            ? (b.score || 0) - (a.score || 0) || a.index - b.index
            : a.index - b.index);

    const [text, setText] = useState('');
    const [language, setLanguage] = useState('c');
    const [drafts, setDrafts] = useState(() => Object.fromEntries(
        Object.entries(snippetTemplates).map(([key, value]) => [key, value.code]),
    ));
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('Run a snippet to see its output here.');
    const [notice, setNotice] = useState('');
    const [file, setFile] = useState(null);
    const fileInput = useRef(null);
    const log = useRef(null);
    const code = drafts[language];

    useEffect(() => {
        if (log.current) {
            log.current.scrollTop = messageSort === 'top' ? 0 : log.current.scrollHeight;
        }
    }, [room.messages.length, messageSort]);

    function postMessage(content) {
        if (!room.joined) {
            return;
        }
        onUpdate((current) => ({
            ...current,
            activity: current.activity + 1,
            messages: [
                ...current.messages,
                {
                    id: `${Date.now()}-${current.messages.length}`,
                    author: 'you',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ...content,
                },
            ],
        }));
        onActivity();
        setNotice('');
    }

    function chooseFile(event) {
        const next = event.target.files[0];
        if (!next) {
            setFile(null);
            return;
        }
        if (!/\.(pdf|txt|md|c|h|js|cpp|hpp|png|jpg|jpeg|webp)$/i.test(next.name)
            || next.size === 0 || next.size > 5 * 1024 * 1024) {
            setNotice('Choose a PDF, text, code, or image file up to 5 MB.');
            event.target.value = '';
            setFile(null);
            return;
        }
        setFile(next);
        setNotice('');
    }

    function send(event) {
        event.preventDefault();
        if (!room.joined || (!text.trim() && !file)) {
            return;
        }
        postMessage({ text: text.trim(), attachment: file ? onAttach(file) : null });
        setText('');
        setFile(null);
        if (fileInput.current) {
            fileInput.current.value = '';
        }
    }

    return (
        <section className="room-workspace" aria-label={`${room.name} discussion`}>
            <button className="project-back" type="button" onClick={onBack}>← All rooms</button>
            <header className="room-header">
                <div>
                    <span className="project-caption">DISCUSSION ROOM</span>
                    <h3>#{room.name}</h3>
                    <p>{room.topic}</p>
                </div>
                <button
                    className={room.joined ? 'project-secondary' : 'project-primary'}
                    type="button"
                    onClick={() => onUpdate((current) => setRoomJoined(current, !current.joined))}
                >
                    {room.joined ? 'Leave room' : 'Join room'}
                </button>
            </header>
            <div className="room-community-tools">
                <VoteControls item={room} label={room.name + ' room'} onVote={(direction) => onUpdate((current) => voteOn(current, direction))} />
                <span>{members.length} joined users</span>
                {manager && <span className="room-joined">{project.owner === 'you' ? 'Project admin' : 'Room admin'}</span>}
                {manager && <button className="project-secondary" type="button" aria-expanded={manageOpen} onClick={() => setManageOpen(!manageOpen)}>Manage room</button>}
            </div>
            {manager && manageOpen && (
                <section className="room-management" aria-label="Room management">
                    <h4>Room members</h4>
                    <p>Room and project creators can manage members. The room creator cannot be removed.</p>
                    {members.map((username) => (
                        <div className="room-member" key={username}>
                            <span>@{username}{username === room.owner ? ' · room creator' : ''}</span>
                            {username !== room.owner && username !== 'you' && (
                                <button type="button" className="project-secondary" onClick={() => onUpdate((current) => removeRoomMember(project, current, username))}>Remove {username}</button>
                            )}
                        </div>
                    ))}
                    {members.length === 1 && <p>No other users have joined yet.</p>}
                    {!deletePending ? <button className="danger-button" type="button" onClick={() => setDeletePending(true)}>Delete room</button> : (
                        <div className="room-delete-confirm" role="alert">
                            <p>Delete #{room.name} and its messages from this preview?</p>
                            <button className="danger-button" type="button" onClick={onDelete}>Confirm delete room</button>
                            <button className="project-secondary" type="button" onClick={() => setDeletePending(false)}>Keep room</button>
                        </div>
                    )}
                </section>
            )}
            <div className="room-workspace-grid">
                <section className="room-terminal" aria-label="Room chat">
                    <div className="room-panel-title"><span aria-hidden="true">● ● ●</span> room / {room.name}</div>
                    <label className="room-message-sort">Message order
                        <select value={messageSort} onChange={(event) => setMessageSort(event.target.value)}>
                            <option value="top">Top voted first</option>
                            <option value="latest">Conversation order</option>
                        </select>
                    </label>
                    <div className="room-log" ref={log} role="log" aria-label="Discussion messages" aria-relevant="additions">
                        {room.messages.length === 0 && <p className="room-hint">No messages yet. Start the conversation.</p>}
                        {sortedMessages.map((message) => (
                            <article className="room-message" key={message.id}>
                                <div className="room-prompt">
                                    <b>{message.author}@SUF</b>
                                    <span>~</span>
                                    <time>{message.time}</time>
                                </div>
                                <VoteControls item={message} label={`message by ${message.author}: ${(message.text || 'snippet').slice(0, 35)}`} onVote={(direction) => onUpdate((current) => ({
                                    ...current,
                                    messages: current.messages.map((item) => item.id === message.id ? voteOn(item, direction) : item),
                                }))} />
                                {message.text && <p>{message.text}</p>}
                                {message.code && (
                                    <CodeBlock fileName={snippetTemplates[message.language].file} lines={message.code.split('\n')} />
                                )}
                                {message.attachment && (
                                    <a className="room-file" href={message.attachment.url} download={message.attachment.name}>
                                        ↓ {message.attachment.name} · {(message.attachment.size / 1024).toFixed(1)} KB
                                    </a>
                                )}
                            </article>
                        ))}
                    </div>
                    <form className="room-compose" onSubmit={send}>
                        <label>
                            <span className="room-hint">{room.joined ? 'you@SUF ~' : 'Join this room to write a message.'}</span>
                            <textarea
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                                disabled={!room.joined}
                                maxLength={5000}
                                rows={3}
                                aria-label="Message to room"
                                placeholder="Share a question or an idea..."
                            />
                        </label>
                        <div className="room-compose-tools">
                            <label className="room-file-label">
                                Attach file
                                <input ref={fileInput} type="file" accept=".pdf,.txt,.md,.c,.h,.js,.cpp,.hpp,.png,.jpg,.jpeg,.webp" onChange={chooseFile} disabled={!room.joined} />
                            </label>
                            <button className="project-primary" type="submit" disabled={!room.joined || (!text.trim() && !file)}>Send ↵</button>
                        </div>
                        {file && (
                            <div className="room-hint" role="status">
                                {file.name}
                                <button type="button" className="project-back" onClick={() => {
                                    setFile(null);
                                    if (fileInput.current) fileInput.current.value = '';
                                }}>Remove file</button>
                            </div>
                        )}
                    </form>
                </section>
                <section className="room-snippets" aria-label="Code snippets">
                    <div className="room-panel-title">SNIPPET WORKSPACE</div>
                    <div className="room-editor-toolbar">
                        <span>{snippetTemplates[language].file}</span>
                        <label>
                            Language
                            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                                {Object.entries(snippetTemplates).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                            </select>
                        </label>
                    </div>
                    <div className="room-code-editor">
                        <pre aria-hidden="true">{code.split('\n').map((_, index) => index + 1).join('\n')}</pre>
                        <textarea
                            aria-label="Snippet code"
                            value={code}
                            onChange={(event) => setDrafts((current) => ({ ...current, [language]: event.target.value }))}
                            rows={12}
                            spellCheck={false}
                            maxLength={20000}
                            wrap="off"
                        />
                    </div>
                    <label className="room-stdin">
                        Standard input (optional)
                        <textarea value={stdin} onChange={(event) => setStdin(event.target.value)} rows={2} maxLength={5000} placeholder="Input for your snippet..." />
                    </label>
                    <div className="room-snippet-actions">
                        <button className="project-secondary" type="button" disabled={!room.joined || !code.trim()} onClick={() => postMessage({ text: `${snippetTemplates[language].label} snippet`, code, language })}>
                            Share in room
                        </button>
                        <button className="project-primary" type="button" disabled={!code.trim()} onClick={() => setOutput('Code execution is not connected yet. Your snippet and input are ready; no code was run.')}>
                            ▷ Run snippet
                        </button>
                    </div>
                    <div className="room-output">
                        <span>OUTPUT</span>
                        <pre role="status">{output}</pre>
                    </div>
                    <p className="room-hint">Small snippets only · Execution service coming next.</p>
                </section>
            </div>
            {notice && <p className="page-notice" role="status">{notice}</p>}
            <p className="room-hint">Local preview · Messages and files remain until you refresh or leave Projects.</p>
        </section>
    );
}

export default function DiscussionRooms({ project, rooms, onChange, onActivity, onAttach }) {
    const [selectedId, setSelectedId] = useState(null);
    const [creating, setCreating] = useState(false);
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const activeRoom = rooms.find((room) => room.id === selectedId);
    const visibleRooms = rankRooms(rooms).filter((room) => `${room.name} ${room.topic}`.toLowerCase().includes(query.trim().toLowerCase().replace(/^#/, '')));

    function createRoom(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = data.get('name').trim().toLowerCase().replace(/\s+/g, '-');
        if (!name || !/^[a-z0-9_-]{2,40}$/.test(name)) {
            setError('Use 2–40 letters, numbers, hyphens, or underscores for the room name.');
            return;
        }
        if (rooms.some((room) => room.name === name)) {
            setError('A room with this name already exists in this project.');
            return;
        }
        const room = {
            id: `room-${Date.now()}`,
            name,
            topic: data.get('topic').trim() || `A discussion about ${project.name}.`,
            joined: true,
            members: ['you'],
            score: 0,
            owner: 'you',
            activity: 0,
            messages: [],
        };
        onChange((current) => [...current, room]);
        onActivity('room');
        setSelectedId(room.id);
        setCreating(false);
        setError('');
    }

    if (activeRoom) {
        return (
            <RoomChat
                key={activeRoom.id}
                room={activeRoom}
                project={project}
                onDelete={() => {
                    if (!canManageRoom(project, activeRoom)) return;
                    onChange((current) => current.filter((room) => room.id !== activeRoom.id));
                    onActivity('delete-room');
                    setSelectedId(null);
                }}
                onBack={() => setSelectedId(null)}
                onUpdate={(update) => onChange((current) => current.map((room) => room.id === activeRoom.id ? update(room) : room))}
                onActivity={() => onActivity('message')}
                onAttach={onAttach}
            />
        );
    }

    return (
        <section className="discussion-rooms" aria-labelledby="rooms-title">
            <header className="room-list-header">
                <div>
                    <h3 id="rooms-title">Discussion rooms <span>{rooms.length}</span></h3>
                    <p>Find your conversation. Rooms with the most joined users appear first. Votes break ties.</p>
                </div>
                <button className="project-primary" type="button" aria-expanded={creating} onClick={() => { setCreating(!creating); setError(''); }}> {creating ? 'Close form' : '+ Create room'}</button>
            </header>
            {creating && (
                <form className="room-create-form" onSubmit={createRoom}>
                    <label>Room name<input name="name" required maxLength={40} placeholder="e.g. debugging-help" /></label>
                    <label>What is this room about?<textarea name="topic" maxLength={200} rows={2} placeholder="Give your peers a little context." /></label>
                    {error && <p className="page-notice" role="alert">{error}</p>}
                    <button className="project-primary" type="submit">Create and join room</button>
                </form>
            )}
            <label className="room-search">Search rooms<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Room name or topic" /></label>
            <div className="room-list">
                {visibleRooms.map((room) => (
                    <article key={room.id} className="room-list-item">
                        <VoteControls item={room} label={room.name + ' room'} onVote={(direction) => onChange((current) => current.map((item) => item.id === room.id ? voteOn(item, direction) : item))} />
                        <div>
                            <h4>{room.name} {room.joined && <span className="room-joined">Joined</span>}</h4>
                            <p>{room.topic}</p>
                            <span className="room-hint">{roomMembers(room).length} joined users · {room.activity} messages · created by {room.owner}</span>
                        </div>
                        <button className="project-secondary" type="button" onClick={() => setSelectedId(room.id)} aria-label={`Open ${room.name}`}>Open room ↗</button>
                    </article>
                ))}
                {!visibleRooms.length && <div className="empty-results"><b>{rooms.length ? 'No matching rooms.' : 'Start the first conversation.'}</b><span>{rooms.length ? 'Try a different name or topic.' : 'Everyone can read, join, and create a community room.'}</span></div>}
            </div>
        </section>
    );
}
