export const navigationItems = [
    { icon: '⌂', label: 'Home' },
    { icon: '□', label: 'Projects' },
    { icon: '▧', label: 'Saved posts' },
    { icon: '◇', label: 'Messages' },
    { icon: '♧', label: 'Peers' },
    { icon: '⚙', label: 'Manage account' },
];

export const initialPosts = [
    {
        id: 1,
        author: 'hamza',
        initials: 'HM',
        verified: true,
        time: '2h',
        tags: ['C', 'Minishell', '42'],
        title: 'Minishell pipe problem',
        body: 'The second command never receives EOF. Here is the part where I create and close the pipe descriptors.',
        fileName: 'execution.c',
        code: [
            'if (pipe(fd) == -1)',
            '    return (1);',
            '',
            'pid = fork();',
            'if (pid == 0)',
            '    dup2(fd[1], STDOUT_FILENO);',
        ],
        likes: 42,
        comments: 18,
        recentComments: [
            {
                id: 1,
                author: 'alex',
                initials: 'AL',
                body: 'Check that every unused pipe end is closed before waiting for the child processes.',
            },
        ],
        views: '12.4k',
    },
    {
        id: 2,
        author: 'sara',
        initials: 'SA',
        verified: false,
        time: '5h',
        tags: ['Docker', 'Inception'],
        title: 'Problem with MariaDB initialization',
        body: 'My container keeps restarting with access denied for root@localhost. I already checked the environment variables.',
        likes: 28,
        comments: 12,
        recentComments: [
            {
                id: 1,
                author: 'yassine',
                initials: 'YA',
                body: 'Make sure the database volume is clean, then check that MYSQL_ROOT_PASSWORD has the same value in both services.',
            },
        ],
        views: '8.1k',
    },
];

export const trendingProjects = [
    {
        rank: 1,
        name: 'Minishell',
        detail: '143 active discussions',
        change: '12%',
    },
    {
        rank: 2,
        name: 'React Authentication',
        detail: '89 active discussions',
        change: '8%',
    },
    {
        rank: 3,
        name: 'Docker',
        detail: '72 active discussions',
        change: '5%',
    },
    {
        rank: 4,
        name: 'Inception',
        detail: '61 active discussions',
        change: '4%',
    },
];

export const suggestedPeers = [
    { name: 'alex', detail: '42 Student · C / C++', initials: 'AL' },
    { name: 'sara', detail: 'Frontend Developer', initials: 'SA' },
    { name: 'yassine', detail: 'DevOps · Docker', initials: 'YA' },
];

export const recentDiscussions = [
    { title: 'Heredoc SIGINT issue', meta: 'Minishell · 18 replies · 2m' },
    {
        title: 'Best way to learn Docker?',
        meta: 'Inception · 24 replies · 15m',
    },
    {
        title: 'Push_swap sorting 5 numbers',
        meta: 'Push_swap · 7 replies · 1h',
    },
];
