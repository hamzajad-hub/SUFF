import { useEffect, useRef, useState } from 'react';
import { initialPosts } from '../data/homeData.js';
import { communityProjects } from '../data/projectsData.js';
import { seedRooms } from '../data/roomsData.js';

const initialRooms = () => Object.fromEntries(communityProjects.map((project) => [project.id, seedRooms(project)]));

export default function useCommunitySession() {
    const [posts, setPosts] = useState(initialPosts);
    const [projects, setProjects] = useState(communityProjects);
    const [roomsByProject, setRoomsByProject] = useState(initialRooms);
    const urls = useRef([]);
    function releaseFiles() {
        urls.current.forEach((url) => URL.revokeObjectURL(url));
        urls.current = [];
    }
    useEffect(() => releaseFiles, []);
    function attach(file, type) {
        const url = URL.createObjectURL(new Blob([file], { type }));
        urls.current.push(url);
        return url;
    }
    function reset() {
        releaseFiles();
        setPosts(initialPosts);
        setProjects(communityProjects);
        setRoomsByProject(initialRooms());
    }
    return { posts, setPosts, projects, setProjects, roomsByProject, setRoomsByProject, attach, reset };
}
