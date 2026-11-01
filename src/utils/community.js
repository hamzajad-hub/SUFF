export function voteOn(item, direction) {
    const previous = item.myVote || 0;
    const next = previous === direction ? 0 : direction;
    return { ...item, myVote: next, score: (item.score || 0) - previous + next };
}

export function roomMembers(room) {
    return room.members || [room.owner, ...(room.joined && room.owner !== 'you' ? ['you'] : [])];
}

export function setRoomJoined(room, joined) {
    const members = roomMembers(room).filter((name) => name !== 'you');
    return { ...room, joined, members: joined ? [...members, 'you'] : members };
}

export function canManageRoom(project, room) {
    return project.owner === 'you' || room.owner === 'you';
}

export function removeRoomMember(project, room, username) {
    if (!canManageRoom(project, room) || username === room.owner || username === 'you') return room;
    return { ...room, members: roomMembers(room).filter((name) => name !== username) };
}

export function validatePostFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const types = {
        png: ['image', 'image/png'], jpg: ['image', 'image/jpeg'], jpeg: ['image', 'image/jpeg'],
        webp: ['image', 'image/webp'], gif: ['image', 'image/gif'],
        mp4: ['video', 'video/mp4'], webm: ['video', 'video/webm'],
        pdf: ['document', 'application/pdf'], txt: ['document', 'text/plain'],
        md: ['document', 'text/plain'], doc: ['document', 'application/octet-stream'],
        docx: ['document', 'application/octet-stream'], c: ['document', 'text/plain'],
        cpp: ['document', 'text/plain'], js: ['document', 'text/plain'],
    };
    const type = types[extension];
    if (!type) return { error: 'Use an image, MP4/WebM video, PDF, text, Word document, or code file.' };
    const limit = (type[0] === 'video' ? 50 : 10) * 1024 * 1024;
    if (!file.size || file.size > limit) return { error: `${type[0] === 'video' ? 'Videos: 50' : 'Images/documents: 10'} MB maximum. Empty files cannot be attached.` };
    return { kind: type[0], mime: type[1] };
}
