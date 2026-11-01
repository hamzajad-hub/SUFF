import { roomMembers } from '../utils/community.js';

export const snippetTemplates = {
    c: {
        label: 'C',
        file: 'snippet.c',
        code: '#include <stdio.h>\n\nint main(void)\n{\n    printf("Hello, SUF!\\n");\n    return 0;\n}',
    },
    javascript: {
        label: 'JavaScript',
        file: 'snippet.js',
        code: 'function greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("SUF"));',
    },
    cpp: {
        label: 'C++',
        file: 'snippet.cpp',
        code: '#include <iostream>\n\nint main()\n{\n    std::cout << "Hello, SUF!" << std::endl;\n    return 0;\n}',
    },
};

export function seedRooms(project) {
    if (String(project.id).startsWith('local-')) {
        return [];
    }
    return [
        {
            id: `${project.id}-general`,
            name: 'general',
            topic: `Questions, progress, and ideas for ${project.name}.`,
            owner: 'sara',
            members: ['sara', 'alex', 'yassine'],
            score: 0,
            joined: false,
            activity: 24,
            messages: [
                { id: 'welcome', author: 'sara', time: '10:32', text: `Welcome to ${project.name}! Share what you are working on or where you are stuck.` },
                { id: 'reply', author: 'alex', time: '10:34', text: 'It helps to share a small example and explain what you expected to happen.' },
            ],
        },
        {
            id: `${project.id}-code`,
            name: 'code-help',
            topic: 'Small snippets, clear questions, and helpful reviews.',
            owner: 'alex',
            members: ['alex', 'sara'],
            score: 0,
            joined: false,
            activity: 12,
            messages: [
                { id: 'code-welcome', author: 'alex', time: '09:15', text: 'Use the snippet panel to share C, JavaScript, or C++ with the room.' },
            ],
        },
    ];
}

export function rankRooms(rooms) {
    return [...rooms].sort((a, b) =>
        roomMembers(b).length - roomMembers(a).length
        || (b.score || 0) - (a.score || 0)
        || b.activity - a.activity
        || a.name.localeCompare(b.name));
}
