// Preview directory. Replace with public profile records returned by the backend.
export const peerDirectory = [
    {
        username: 'alex',
        name: 'Alex',
        initials: 'AL',
        role: 'C / C++ developer',
        bio: 'Working through low-level programming, one small example at a time. Always happy to compare approaches and learn from peers.',
        skills: ['C', 'C++', 'Linux'],
        verified42: true,
        campus: '1337',
        peerCount: 24,
    },
    {
        username: 'sara',
        name: 'Sara',
        initials: 'SA',
        role: 'Frontend developer',
        bio: 'Building useful interfaces with React. Interested in accessible design, thoughtful interactions, and making the web easier to use.',
        skills: ['React', 'JavaScript', 'UI'],
        verified42: false,
        peerCount: 18,
    },
    {
        username: 'yassine',
        name: 'Yassine',
        initials: 'YA',
        role: 'DevOps & containers',
        bio: 'Learning how services fit together. I enjoy Docker, Linux, and helping people debug their first container setup.',
        skills: ['Docker', 'Linux', 'DevOps'],
        verified42: false,
        peerCount: 31,
    },
    {
        username: 'meryem',
        name: 'Meryem',
        initials: 'ME',
        role: 'Systems programming student',
        bio: 'Exploring Unix, shell projects, and the details that make a program work. Let us solve the next roadblock together.',
        skills: ['C', 'Unix', 'Minishell'],
        verified42: true,
        campus: '1337',
        peerCount: 16,
    },
    {
        username: 'hamza',
        name: 'Hamza',
        initials: 'HM',
        role: 'Building SUF with peers',
        bio: 'Sharing projects, learning C and React, and turning questions into conversations with the community.',
        skills: ['C', 'React', 'Community'],
        verified42: true,
        campus: '1337',
        peerCount: 12,
    },
];

export const initialRelationships = {
    yassine: 'connected',
    meryem: 'incoming',
};

export function changeRelationship(current, username, action) {
    const status = current[username] || 'none';
    const transitions = {
        send: { none: 'outgoing' },
        cancel: { outgoing: 'none' },
        accept: { incoming: 'connected' },
        decline: { incoming: 'none' },
    };
    const next = transitions[action]?.[status];
    if (!next || !peerDirectory.some((peer) => peer.username === username)) {
        return current;
    }
    return { ...current, [username]: next };
}

export function searchPeers(peers, query) {
    const normalized = query.trim().toLowerCase().replace(/^[@#]/, '');
    return peers.filter((peer) => [peer.name, peer.username, peer.role, peer.bio, ...peer.skills]
        .join(' ').toLowerCase().includes(normalized));
}
