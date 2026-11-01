export const SEARCH_TYPES = ['all', 'posts', 'projects', 'peers', 'rooms', 'tags'];
export const SEARCH_SORTS = ['relevance', 'activity', 'name-asc', 'name-desc'];
export const SEARCH_PAGE_SIZE = 6;
const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function parseSearch(params) {
    const requested = Number(params.get('page'));
    return {
        q: (params.get('q') || '').trim().slice(0, 200),
        type: SEARCH_TYPES.includes(params.get('type')) ? params.get('type') : 'all',
        tag: (params.get('tag') || '').trim().replace(/^#/, '').slice(0, 60),
        sort: SEARCH_SORTS.includes(params.get('sort')) ? params.get('sort') : 'relevance',
        page: Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 1000000) : 1,
    };
}

export function searchUrl(state = {}) {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.type && state.type !== 'all') params.set('type', state.type);
    if (state.tag) params.set('tag', state.tag);
    if (state.sort && state.sort !== 'relevance') params.set('sort', state.sort);
    if (state.page > 1) params.set('page', state.page);
    return '/search' + (params.size ? '?' + params.toString() : '');
}

export function buildSearchIndex({ posts, projects, peers, roomsByProject }) {
    const records = [
        ...posts.map((post) => ({ id: `post:${post.id}`, type: 'posts', title: post.title, summary: post.body || 'Community post', tags: post.tags, owner: post.author, activity: post.likes + post.comments, url: `/posts/${encodeURIComponent(post.id)}` })),
        ...projects.map((project) => ({ id: `project:${project.id}`, type: 'projects', title: project.name, summary: project.summary, extra: project.readme, tags: project.tags, owner: project.owner, activity: project.discussions, url: `/projects/${encodeURIComponent(project.id)}` })),
        ...peers.map((peer) => ({ id: `peer:${peer.username}`, type: 'peers', title: peer.name, summary: peer.bio, extra: peer.role, tags: peer.skills, owner: peer.username, activity: peer.peerCount, url: `/profile/${encodeURIComponent(peer.username)}` })),
        ...projects.flatMap((project) => (roomsByProject[project.id] || []).map((room) => ({ id: `room:${room.id}`, type: 'rooms', title: `#${room.name}`, summary: room.topic, extra: project.name, tags: project.tags, owner: room.owner, activity: room.activity, url: `/projects/${encodeURIComponent(project.id)}?room=${encodeURIComponent(room.id)}` }))),
    ];
    const tags = new Map();
    for (const record of records) {
        for (const tag of new Set(record.tags || [])) {
            const key = normalize(tag);
            const existing = tags.get(key);
            if (existing) existing.count++;
            else tags.set(key, { name: tag, count: 1 });
        }
    }
    for (const [key, { name, count }] of tags) records.push({
        id: `tag:${key}`, type: 'tags', title: `#${name}`, summary: `${count} items tagged ${name}`, tags: [name], owner: '', activity: count, url: searchUrl({ tag: name }),
    });
    return { records, tags: [...tags.values()].map((tag) => tag.name).sort((a, b) => a.localeCompare(b, 'en')) };
}

export function searchRecords(records, state) {
    const terms = normalize(state.q).split(/\s+/).filter(Boolean);
    const matching = records.map((record) => {
        const title = normalize(record.title);
        const tags = (record.tags || []).map(normalize);
        const owner = normalize(record.owner);
        const text = normalize([record.title, record.summary, record.extra, record.owner, ...(record.tags || [])].join(' '));
        const matches = terms.every((term) => term.startsWith('#') ? tags.includes(term.slice(1))
            : term.startsWith('@') ? owner.startsWith(term.slice(1)) : text.includes(term));
        const score = terms.reduce((sum, term) => sum + (title === term ? 20 : title.startsWith(term) ? 10 : title.includes(term) ? 5 : 1), 0);
        return { ...record, matches: matches && (!state.tag || tags.includes(normalize(state.tag))), score };
    }).filter((record) => record.matches);
    const counts = Object.fromEntries(SEARCH_TYPES.map((type) => [type, type === 'all' ? matching.length : matching.filter((record) => record.type === type).length]));
    const selected = matching.filter((record) => state.type === 'all' || record.type === state.type);
    const nameOrder = (a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id);
    selected.sort((a, b) => state.sort === 'name-asc' ? nameOrder(a, b)
        : state.sort === 'name-desc' ? nameOrder(b, a)
            : state.sort === 'activity' || !terms.length ? b.activity - a.activity || nameOrder(a, b)
                : b.score - a.score || nameOrder(a, b));
    const totalPages = Math.max(1, Math.ceil(selected.length / SEARCH_PAGE_SIZE));
    const page = Math.min(state.page, totalPages);
    return { counts, total: selected.length, totalPages, page, items: selected.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE) };
}
