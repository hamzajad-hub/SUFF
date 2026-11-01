import React, { useEffect, useRef, useState } from 'react';
import { writeStorage } from '../utils/storage.js';
import { loadProfile } from '../utils/profile.js';
import { prepareAvatar } from '../utils/avatar.js';
import PostCard from '../components/PostCard.jsx';

function safeLink(value) {
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

export default function ProfilePage({ posts = [], onUpdatePost, currentProfile, onProfileChange, account = null, savedIds = [], onToggleSaved }) {
    const [localProfile, setProfile] = useState(loadProfile);
    const profile = currentProfile || localProfile;
    const [draft, setDraft] = useState(null);
    const [activeTab, setActiveTab] = useState('Posts');
    const [notice, setNotice] = useState('');
    const [photoLoading, setPhotoLoading] = useState(false);
    const photoVersion = useRef(0);
    const editForm = useRef(null);
    const editDialog = useRef(null);
    const editing = Boolean(draft);

    useEffect(() => {
        if (editing && editForm.current) {
            editDialog.current?.showModal();
            editForm.current.querySelector('input[name="displayName"]')?.focus({ preventScroll: true });
        }
    }, [editing]);
    const myPosts = posts.filter((post) => post.author === 'you');
    const verified = account?.is42Verified === true;
    const initials = profile.name.split(/\s+/).filter(Boolean)
        .slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    const links = [
        ['GitHub', profile.github],
        ['Portfolio', profile.portfolio],
        ['LinkedIn', profile.linkedin],
    ].filter(([, url]) => safeLink(url));

    function updateDraft(field, value) {
        setDraft((current) => ({ ...current, [field]: value }));
    }

    async function choosePhoto(event) {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) return;
        const version = ++photoVersion.current;
        setPhotoLoading(true);
        setNotice('');
        try {
            const photo = await prepareAvatar(file);
            if (version === photoVersion.current) {
                setDraft((current) => current ? { ...current, photo } : current);
                setNotice('Photo ready. Click Save changes below to apply it.');
            }
        } catch (error) {
            if (version === photoVersion.current) setNotice(error.message);
        } finally {
            if (version === photoVersion.current) setPhotoLoading(false);
        }
    }

    function cancelEditing() {
        photoVersion.current += 1;
        setPhotoLoading(false);
        setDraft(null);
        setNotice('');
    }

    function saveProfile(event) {
        event.preventDefault();
        if (!draft.name.trim() || !/^[A-Za-z0-9_]{3,24}$/.test(draft.username.trim())) {
            setNotice('Enter your name and a username with 3–24 letters, numbers, or underscores.');
            return;
        }
        for (const field of ['github', 'portfolio', 'linkedin']) {
            if (draft[field].trim() && !safeLink(draft[field].trim())) {
                setNotice('Use a full website link starting with https:// or http://.');
                return;
            }
        }
        const updated = {
            ...draft,
            name: draft.name.trim(),
            username: draft.username.trim(),
            bio: draft.bio.trim(),
            skills: [...new Set(draft.skillsText.split(',').map((value) => value.trim()).filter(Boolean))].slice(0, 12),
        };
        delete updated.skillsText;
        setProfile(updated);
        onProfileChange?.(updated);
        setDraft(null);
        setNotice(writeStorage('suf-profile', JSON.stringify(updated))
            ? 'Profile saved in this browser.'
            : 'Profile updated for this session. Browser storage is unavailable or full.');
    }

    return (
        <section className="projects-page profile-page" aria-labelledby="profile-title">
            <div className="profile-cover">
                <span className="eyebrow">YOUR CORNER OF THE COMMUNITY</span>
                <span className="profile-cover-code" aria-hidden="true">{'{ build. share. grow. }'}</span>
            </div>
            <div className="profile-summary">
                <div className="profile-portrait">
                    {profile.photo ? <img src={profile.photo} alt={`${profile.name}'s profile`} /> : <span>{initials || 'YO'}</span>}
                </div>
                <button
                    className="project-secondary"
                    type="button"
                    onClick={() => {
                        setDraft({ ...profile, skillsText: profile.skills.join(', ') });
                        setNotice('');
                    }}
                    aria-expanded={Boolean(draft)}
                    aria-controls="profile-edit-dialog"
                >
                    Edit profile
                </button>
                <div className="profile-identity">
                    <h1 id="profile-title">
                        {profile.name}
                        {verified && <span className="profile-42-badge">42 ✓</span>}
                    </h1>
                    <span className="profile-handle">@{profile.username}</span>
                    <p>{profile.bio || 'Add a short bio to introduce yourself to your peers.'}</p>
                    {verified && (
                        <p className="profile-intra">
                            Verified 42 student
                            {account.intraUsername && ` · ${account.intraUsername}`}
                            {account.campus && ` · ${account.campus}`}
                        </p>
                    )}
                    <div className="profile-links">
                        {links.map(([label, url]) => (
                            <a key={label} href={safeLink(url)} target="_blank" rel="noopener noreferrer">{label} ↗</a>
                        ))}
                    </div>
                    <div className="profile-skills" aria-label="Skills and interests">
                        {profile.skills.map((skill) => <span key={skill}>{skill}</span>)}
                    </div>
                </div>
                <div className="profile-stats">
                    <div><b>{account?.peerCount ?? 0}</b><span>Peers</span></div>
                    <div><b>{myPosts.length}</b><span>Posts</span></div>
                    <div><b>{account?.projectCount ?? 0}</b><span>Projects</span></div>
                </div>
            </div>

            {notice && !draft && <p className="page-notice" role="status">{notice}</p>}

            {draft && (
                <dialog
                    id="profile-edit-dialog"
                    ref={editDialog}
                    className="profile-edit-dialog"
                    aria-labelledby="profile-edit-title"
                    onCancel={cancelEditing}
                >
                <form id="profile-edit-form" ref={editForm} className="profile-edit project-form" onSubmit={saveProfile}>
                    <h2 id="profile-edit-title">Edit your profile</h2>
                    <p>Tell your peers a little about yourself.</p>
                    {notice && <p className="page-notice" role="status">{notice}</p>}
                    <label>
                        Profile photo
                        <input type="file" accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif" onChange={choosePhoto} />
                    </label>
                    <p>PNG, JPEG, WebP, or GIF · Up to 10 MB · Photos are resized automatically</p>
                    {draft.photo && (
                        <div className="profile-photo-preview">
                            <img src={draft.photo} alt="New profile photo preview" />
                            <button className="project-secondary" type="button" onClick={() => { photoVersion.current += 1; setPhotoLoading(false); updateDraft('photo', ''); setNotice('Click Save changes to remove your photo.'); }}>Remove photo</button>
                        </div>
                    )}
                    <label>
                        Display name
                        <input name="displayName" value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} required maxLength={60} />
                    </label>
                    <label>
                        Username
                        <input value={draft.username} onChange={(event) => updateDraft('username', event.target.value)} required pattern="[A-Za-z0-9_]{3,24}" title="3–24 letters, numbers, or underscores" />
                    </label>
                    <label>
                        Bio
                        <textarea value={draft.bio} onChange={(event) => updateDraft('bio', event.target.value)} rows={3} maxLength={300} />
                    </label>
                    <label>
                        Skills and interests, separated by commas
                        <input value={draft.skillsText} onChange={(event) => updateDraft('skillsText', event.target.value)} maxLength={240} />
                    </label>
                    {['github', 'portfolio', 'linkedin'].map((field) => (
                        <label key={field}>
                            {field === 'github' ? 'GitHub' : field === 'linkedin' ? 'LinkedIn' : 'Portfolio'}
                            <input type="url" value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} placeholder="https://" maxLength={500} />
                        </label>
                    ))}
                    <div className="project-banner-actions">
                        <button className="project-primary" type="submit" disabled={photoLoading}>{photoLoading ? 'Reading photo…' : 'Save changes'}</button>
                        <button className="project-secondary" type="button" onClick={cancelEditing}>Cancel</button>
                    </div>
                </form>
                </dialog>
            )}

            <div className="project-tabs" aria-label="Profile activity">
                {['Posts', 'Projects', 'Discussion rooms'].map((tab) => (
                    <button type="button" key={tab} aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
            </div>
            {activeTab === 'Posts' && myPosts.length > 0 ? (
                <div className="post-list">
                    {myPosts.map((post) => (
                        <PostCard onUpdatePost={onUpdatePost} authorPhoto={profile.photo} key={post.id} post={post} saved={savedIds.includes(post.id)} onToggleSaved={() => onToggleSaved(post.id)} />
                    ))}
                </div>
            ) : (
                <div className="profile-empty">
                    <span aria-hidden="true">{activeTab === 'Posts' ? '✎' : activeTab === 'Projects' ? '</>' : '▱'}</span>
                    <h2>{activeTab === 'Posts' ? 'Your next idea starts here.' : activeTab === 'Projects' ? 'Build something with your peers.' : 'Good conversations build great code.'}</h2>
                    <p>{activeTab === 'Posts' ? 'Share an update on Home and it will appear here.' : activeTab === 'Projects' ? 'Your project activity will appear here once accounts are connected.' : 'Your discussion activity will appear here when rooms are ready.'}</p>
                    {activeTab !== 'Discussion rooms' && (
                        <a className="project-secondary" href={activeTab === 'Posts' ? '#/home' : '#/projects'}>{activeTab === 'Posts' ? 'Share a post ↗' : 'Explore projects ↗'}</a>
                    )}
                </div>
            )}
            <p className="profile-preview-note">Frontend preview · Profile changes are saved in this browser. Account activity will connect later.</p>
        </section>
    );
}
