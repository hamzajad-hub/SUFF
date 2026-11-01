import React, { useEffect, useRef, useState } from 'react';
import DiscussionRooms from '../components/DiscussionRooms.jsx';
import { seedRooms } from '../data/roomsData.js';
import { communityProjects } from '../data/projectsData.js';

export default function ProjectsPage({ query = '', account = null, initialProjectId = null }) {
    const [roomsByProject, setRoomsByProject] = useState(() => Object.fromEntries(
        communityProjects.map((project) => [project.id, seedRooms(project)]),
    ));

    function updateRooms(project, update) {
        setRoomsByProject((current) => ({
            ...current,
            [project.id]: update(current[project.id] || []),
        }));
    }

    function recordActivity(project, kind) {
        const update = (item) => ({
            ...item,
            discussions: item.discussions + (kind === 'message' ? 1 : 0),
            rooms: Math.max(0, item.rooms + (kind === 'room' ? 1 : kind === 'delete-room' ? -1 : 0)),
        });
        setProjects((current) => current.map((item) => item.id === project.id ? update(item) : item));
        setSelected((current) => current?.id === project.id ? update(current) : current);
    }

    function attachRoomFile(file) {
        const url = URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }));
        attachmentUrls.current.push(url);
        return { name: file.name, size: file.size, url };
    }

    const [briefFile, setBriefFile] = useState(null);
    const attachmentUrls = useRef([]);
    const fileInput = useRef(null);

    useEffect(() => () => {
        attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    function chooseBrief(event) {
        const file = event.target.files[0];
        setNotice('');

        if (!file) {
            setBriefFile(null);
            return;
        }

        if (!/\.(pdf|md|txt)$/i.test(file.name) || file.size === 0 || file.size > 10 * 1024 * 1024) {
            setNotice('Choose a non-empty PDF, Markdown (.md), or text (.txt) file up to 10 MB.');
            setBriefFile(null);
            event.target.value = '';
            return;
        }

        setBriefFile(file);
    }

    const [projects, setProjects] = useState(communityProjects);
    const [tab, setTab] = useState('community');
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [notice, setNotice] = useState('');
    const [sort, setSort] = useState('activity');
    const [tag, setTag] = useState('All');
    const verified = account?.is42Verified === true;
    const activeTab = verified ? tab : 'community';

    useEffect(() => {
        if (!verified) {
            setTab('community');
            setSelected(null);
            setTag('All');
        }
    }, [verified]);

    useEffect(() => {
        if (initialProjectId) {
            setSelected(communityProjects.find((project) => project.id === initialProjectId) || null);
        }
    }, [initialProjectId]);

    const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '');
    const source = activeTab === 'community'
        ? projects
        : (account.projects42 || []);
    const tags = ['All', ...new Set(source.flatMap((project) => project.tags))];
    const visible = source
        .filter((project) => (
            (tag === 'All' || project.tags.includes(tag))
            && [project.name, project.summary, project.owner, ...project.tags]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery)
        ))
        .sort((a, b) => sort === 'activity'
            ? b.discussions - a.discussions
            : a.name.localeCompare(b.name));

    function changeTab(nextTab) {
        if (nextTab === '42' && !verified) {
            return;
        }
        setTab(nextTab);
        setTag('All');
        setSelected(null);
        setFormOpen(false);
        setNotice('');
    }

    function addProject(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = data.get('name').trim();
        const summary = data.get('summary').trim();
        const readme = data.get('readme').trim();

        if (!name || !summary || (!readme && !briefFile)) {
            setNotice('Please add a name, a description, and either a written brief or a brief file.');
            return;
        }

        let attachment = null;
        if (briefFile) {
            const type = briefFile.name.toLowerCase().endsWith('.pdf')
                ? 'application/pdf'
                : 'text/plain;charset=utf-8';
            const url = URL.createObjectURL(new Blob([briefFile], { type }));
            attachmentUrls.current.push(url);
            attachment = {
                name: briefFile.name,
                size: briefFile.size,
                url,
            };
        }

        const newProject = {
            id: `local-${Date.now()}`,
            name,
            summary,
            readme,
            attachment,
            tags: [...new Set(data.get('tags').split(',')
                .map((value) => value.trim().replace(/^#/, ''))
                .filter(Boolean))].slice(0, 5),
            icon: '</>',
            owner: 'you',
            discussions: 0,
            rooms: 0,
            peers: 1,
        };

        setProjects((current) => [newProject, ...current]);
        setBriefFile(null);
        setFormOpen(false);
        setTag('All');
        setSelected(newProject);
        setNotice('Project created in this preview. It will stay until the page is refreshed.');
    }

    return (
        <section className="projects-page" aria-labelledby="projects-title">
            <header className="projects-heading">
                <div>
                    <span className="eyebrow">BUILD SOMETHING TOGETHER</span>
                    <h1 id="projects-title">Projects<span>.</span></h1>
                    <p>Find a project. Share a roadblock. Make progress with your peers.</p>
                </div>
                {activeTab === 'community' && (
                    <button
                        className="project-primary"
                        type="button"
                        onClick={() => {
                            setFormOpen(!formOpen);
                            setBriefFile(null);
                            setSelected(null);
                        }}
                        aria-expanded={formOpen}
                    >
                        {formOpen ? 'Close form' : '+ Add project'}
                    </button>
                )}
            </header>

            <div className="project-tabs" aria-label="Project categories">
                <button
                    type="button"
                    aria-pressed={activeTab === 'community'}
                    onClick={() => changeTab('community')}
                >
                    Community projects
                </button>
                {verified && (
                <button
                    type="button"
                    aria-pressed={activeTab === '42'}
                    onClick={() => changeTab('42')}
                >
                    <strong>42</strong> projects
                </button>
                )}
            </div>

            {notice && <p className="page-notice" role="status">{notice}</p>}

            {formOpen && (
                <form className="project-form" onSubmit={addProject}>
                    <h2>Start a new project</h2>
                    <p>Give your peers the context they need to join the conversation.</p>
                    <label>
                        Project name
                        <input name="name" required maxLength={80} placeholder="What are you building?" />
                    </label>
                    <label>
                        Short description
                        <textarea name="summary" required maxLength={300} rows={3} />
                    </label>
                    <label>
                        Tags, separated by commas
                        <input name="tags" maxLength={120} placeholder="React, JavaScript, Web" />
                    </label>
                    <label>
                        Project brief / README
                        <textarea name="readme" maxLength={10000} rows={5} placeholder="Write your brief here, attach a file below, or use both." />
                    </label>
                    <div className="project-file-picker">
                        <label htmlFor="project-brief-file">Attach a project brief</label>
                        <p id="brief-file-help">PDF, Markdown (.md), or text (.txt) · Up to 10 MB. Write a brief or attach a file.</p>
                        <input
                            id="project-brief-file"
                            ref={fileInput}
                            type="file"
                            accept=".pdf,.md,.txt"
                            onChange={chooseBrief}
                            aria-describedby="brief-file-help"
                        />
                        {briefFile && (
                            <div className="project-file-selection" role="status">
                                <span>{briefFile.name} · {(briefFile.size / 1024).toFixed(1)} KB</span>
                                <button
                                    className="project-secondary"
                                    type="button"
                                    onClick={() => {
                                        setBriefFile(null);
                                        if (fileInput.current) {
                                            fileInput.current.value = '';
                                        }
                                    }}
                                >
                                    Remove file
                                </button>
                            </div>
                        )}
                        <small>Files stay in this browser session until you refresh or leave Projects.</small>
                    </div>
                    <div className="project-banner-actions">
                        <button className="project-primary" type="submit">Create project</button>
                        <button className="project-secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {selected && (
                <section className="project-detail" aria-label={`${selected.name} overview`}>
                    <button className="project-back" type="button" onClick={() => setSelected(null)}>← Back to projects</button>
                    <span className="project-caption">PROJECT OVERVIEW</span>
                    <h2>{selected.name}</h2>
                    {selected.owner === 'you' && <p className="project-admin-label">You are the project admin. You can manage every room in this project.</p>}
                    <p>{selected.summary}</p>
                    <h3>README / Project brief</h3>
                    {selected.readme && <p className="project-readme">{selected.readme}</p>}
                    {selected.attachment && (
                        <div className="project-attachment">
                            <div>
                                <b>{selected.attachment.name}</b>
                                <span>{(selected.attachment.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <a href={selected.attachment.url} target="_blank" rel="noopener noreferrer">Open file ↗</a>
                            <a href={selected.attachment.url} download={selected.attachment.name}>Download</a>
                        </div>
                    )}
                    <DiscussionRooms
                        key={selected.id}
                        project={selected}
                        rooms={roomsByProject[selected.id] || []}
                        onChange={(update) => updateRooms(selected, update)}
                        onActivity={(kind) => recordActivity(selected, kind)}
                        onAttach={attachRoomFile}
                    />
                </section>
            )}

            {!selected && source.length > 0 && (
                <>
                    <div className="project-controls">
                        <div className="project-filters" aria-label="Filter by tag">
                            {tags.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={tag === value}
                                    onClick={() => setTag(value)}
                                >
                                    {value === 'All' ? 'All projects' : `#${value}`}
                                </button>
                            ))}
                        </div>
                        <label className="project-sort">
                            Sort by
                            <select value={sort} onChange={(event) => setSort(event.target.value)}>
                                <option value="activity">Most discussed</option>
                                <option value="name">Name A–Z</option>
                            </select>
                        </label>
                    </div>
                    <div className="project-list-heading">
                        <span>{visible.length} project{visible.length === 1 ? '' : 's'}</span>
                        <span>Example community activity</span>
                    </div>
                    <div className="project-cards">
                        {visible.map((project) => (
                            <article className="project-card" key={project.id}>
                                <div className="project-card-heading">
                                    <span className="project-icon" aria-hidden="true">{project.icon}</span>
                                    <div>
                                        <h2>{project.name}</h2>
                                        <span>by {project.owner}</span>
                                    </div>
                                </div>
                                <p>{project.summary}</p>
                                <div className="project-tags">
                                    {project.tags.map((value) => <span key={value}>#{value}</span>)}
                                </div>
                                <div className="project-stats">
                                    <span><b>{project.discussions}</b> discussions</span>
                                    <span><b>{project.rooms}</b> rooms</span>
                                    <span><b>{project.peers}</b> peers</span>
                                </div>
                                <button className="project-open" type="button" onClick={() => setSelected(project)}>
                                    Open project <span aria-hidden="true">↗</span>
                                </button>
                            </article>
                        ))}
                    </div>
                    {visible.length === 0 && (
                        <div className="empty-results">
                            <b>No projects match your search.</b>
                            <span>Try another project name or #tag in the search bar.</span>
                        </div>
                    )}
                </>
            )}

            {activeTab === '42' && verified && source.length === 0 && (
                <div className="empty-results">
                    <b>No Intra projects available yet.</b>
                    <span>Your projects will appear here when your account is synced.</span>
                </div>
            )}
        </section>
    );
}
