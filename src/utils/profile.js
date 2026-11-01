import { readStorage } from './storage.js';

const defaultProfile = {
    name: 'Your name',
    username: 'you',
    bio: 'Learning, building, and sharing with the SUF community.',
    skills: ['React', 'JavaScript', 'C'],
    github: '',
    portfolio: '',
    linkedin: '',
    photo: '',
};

export function loadProfile() {
    try {
        const saved = JSON.parse(readStorage('suf-profile', 'null'));
        if (!saved || typeof saved !== 'object') {
            return defaultProfile;
        }
        const profile = { ...defaultProfile };
        Object.keys(defaultProfile).forEach((key) => {
            if (key !== 'skills' && typeof saved[key] === 'string') {
                profile[key] = saved[key];
            }
        });
        if (Array.isArray(saved.skills)) {
            profile.skills = saved.skills.filter((skill) => typeof skill === 'string');
        }
        return profile;
    } catch {
        return defaultProfile;
    }
}

