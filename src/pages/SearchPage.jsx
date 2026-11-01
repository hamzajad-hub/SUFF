import React, { useEffect, useMemo } from 'react';
import { buildSearchIndex, searchRecords, searchUrl, SEARCH_TYPES } from '../utils/search.js';
import { navigate } from '../utils/routes.js';
import { peerDirectory } from '../data/peersData.js';

const labels = { all: 'All', posts: 'Posts', projects: 'Projects', peers: 'Peers', rooms: 'Rooms', tags: 'Tags' };

export default function SearchPage({ state, community }) {
    const index = useMemo(() => buildSearchIndex({ ...community, peers: peerDirectory }), [community.posts, community.projects, community.roomsByProject]);
    const results = useMemo(() => searchRecords(index.records, state), [index, state]);
    const change = (patch, replace = false) => navigate(searchUrl({ ...state, ...patch }), { replace });
    useEffect(() => {
        if (state.page !== results.page) change({ page: results.page }, true);
    }, [state.page, results.page]);
    return (
        <section className="projects-page search-page" aria-labelledby="search-title">
            <header className="projects-heading"><div><span className="eyebrow">EXPLORE THE COMMUNITY</span><h1 id="search-title">Search<span>.</span></h1><p>Find posts, projects, peers, discussion rooms, and tags. Use @username or #tag to narrow your search.</p></div></header>
            <div className="project-tabs search-types" aria-label="Search result types">
                {SEARCH_TYPES.map((type) => <button key={type} type="button" aria-pressed={state.type === type} onClick={() => change({ type, page: 1 })}>{labels[type]} <span>{results.counts[type]}</span></button>)}
            </div>
            <div className="search-controls">
                <label>Filter by tag<select aria-label="Filter by tag" value={state.tag} onChange={(event) => change({ tag: event.target.value, page: 1 })}><option value="">All tags</option>{state.tag && !index.tags.includes(state.tag) && <option value={state.tag}>#{state.tag}</option>}{index.tags.map((tag) => <option key={tag} value={tag}>#{tag}</option>)}</select></label>
                <label>Sort results<select aria-label="Sort results" value={state.sort} onChange={(event) => change({ sort: event.target.value, page: 1 })}><option value="relevance">Relevance</option><option value="activity">Most activity</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select></label>
                {(state.q || state.tag || state.type !== 'all' || state.sort !== 'relevance') && <a href="/search">Clear search and filters</a>}
            </div>
            <p className="search-summary" role="status">{results.total} result{results.total === 1 ? '' : 's'}{state.q ? ` for “${state.q}”` : ''}{state.tag ? ` tagged #${state.tag}` : ''}</p>
            <div className="search-results">
                {results.items.map((item) => <article className="search-result" key={item.id}><span className="search-result-type">{labels[item.type]}</span><h2><a href={item.url}>{item.title}</a></h2>{item.extra && item.type === 'rooms' && <p className="room-hint">{item.extra}</p>}<p>{item.summary}</p><div className="project-tags">{item.tags.slice(0, 5).map((tag) => <a key={tag} href={searchUrl({ tag })}>#{tag}</a>)}</div>{item.owner && <small>By @{item.owner}</small>}</article>)}
                {!results.total && <div className="empty-results"><h2>No matching results.</h2><p>Try fewer words, choose another content type, or clear your filters.</p><a href="/search">Browse all results</a></div>}
            </div>
            {results.total > 0 && <nav className="pagination" aria-label="Search result pages"><button type="button" disabled={results.page === 1} onClick={() => change({ page: results.page - 1 })}>← Previous</button><span>Page {results.page} of {results.totalPages}</span><button type="button" disabled={results.page === results.totalPages} onClick={() => change({ page: results.page + 1 })}>Next →</button></nav>}
            <p className="profile-preview-note">Search includes public sample data and content created during this session. Private messages are never included. Temporary content is cleared on refresh or logout.</p>
        </section>
    );
}
