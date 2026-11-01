import React, { useState } from 'react';
import Avatar from './Avatar.jsx';
import PeerActions from './PeerActions.jsx';
import CodeBlock from './CodeBlock.jsx';
import CommentThread from './CommentThread.jsx';

export default function PostCard({ post: sourcePost, saved, onToggleSaved, peerStatus, onPeerAction, onUpdatePost, authorPhoto }) {
    const [localPost, setLocalPost] = useState(sourcePost);
    const post = onUpdatePost ? sourcePost : localPost;
    const [reported, setReported] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [shareOpen, setShareOpen] = useState(false);
    const [shareNotice, setShareNotice] = useState('');
    const comments = post.thread || (post.recentComments || []).map((comment) => ({ ...comment, id: `sample-${comment.author}-${comment.id}`, parentId: null }));
    const shareUrl = new URL(window.location.href);
    shareUrl.search = '';
    shareUrl.hash = `/home?post=${encodeURIComponent(post.id)}`;

    function update(change) {
        if (onUpdatePost) onUpdatePost(post.id, change);
        else setLocalPost(change);
    }

    function addComment(parentId, body) {
        update((current) => ({
            ...current,
            comments: current.comments + 1,
            thread: [
                ...(current.thread || (current.recentComments || []).map((comment) => ({ ...comment, id: `sample-${comment.author}-${comment.id}`, parentId: null }))),
                { id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, author: 'you', initials: 'YO', body, parentId, likes: 0 },
            ],
        }));
    }

    function likeComment(id) {
        update((current) => ({
            ...current,
            thread: (current.thread || comments).map((comment) => comment.id === id ? { ...comment, liked: !comment.liked } : comment),
        }));
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(shareUrl.href);
            setShareNotice('Post link copied.');
        } catch {
            setShareNotice('Select and copy the link below.');
        }
    }

    async function sharePost() {
        setShareOpen(true);
        if (!navigator.share) return;
        try {
            await navigator.share({ title: post.title, text: post.body || post.title, url: shareUrl.href });
            setShareNotice('Share completed.');
        } catch (error) {
            setShareNotice(error.name === 'AbortError' ? 'Sharing cancelled. You can still copy the link.' : 'Use Copy link to share this post.');
        }
    }

    return (
        <article className="post-card" id={`post-${post.id}`}>
            <header className="post-author">
                <Avatar initials={post.initials} photo={authorPhoto} />
                <div>
                    <a className="post-profile-link" href={post.author === 'you' ? '#/profile' : `#/profile/${post.author}`}>{post.author}</a>
                    {post.verified && <span className="verified">42 ✓</span>}
                    <span className="post-time">{post.time === 'now' ? 'just now' : `${post.time} ago`}</span>
                </div>
                <details className="post-options">
                    <summary className="more-button" aria-label={`Post options for ${post.author}`}>•••</summary>
                    <div className="post-options-menu">
                        <button type="button" disabled={reported} onClick={(event) => { setReported(true); event.currentTarget.closest('details').open = false; }}>{reported ? 'Report noted locally' : 'Report'}</button>
                        <button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; onToggleSaved(); }}>{saved ? 'Unsave post' : 'Save post'}</button>
                        {onPeerAction && post.author !== 'you' && <PeerActions username={post.author} status={peerStatus} onAction={onPeerAction} compact />}
                    </div>
                </details>
            </header>
            {reported && <p className="post-feedback" role="status">Report noted in this preview. Backend connection is needed to send it.</p>}
            <div className="tag-row">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
            <h2>{post.title}</h2>
            {post.body && <p>{post.body}</p>}
            {post.attachments?.length > 0 && (
                <div className="post-attachments">
                    {post.attachments.map((attachment) => (
                        <figure key={attachment.id}>
                            {attachment.kind === 'image' ? <img src={attachment.url} alt={attachment.name} loading="lazy" /> : attachment.kind === 'video' ? <video src={attachment.url} controls preload="metadata" aria-label={attachment.name} /> : <div className="attachment-document">▤ {attachment.name}</div>}
                            <figcaption>
                                <span>{attachment.name} · {(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                                <a href={attachment.url} download={attachment.name}>Download</a>
                                {attachment.mime === 'application/pdf' && <a href={attachment.url} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            )}
            {post.code && <CodeBlock fileName={post.fileName} lines={post.code} />}
            <footer className="post-actions">
                <button className={post.liked ? 'liked' : ''} type="button" aria-label={`Like post by ${post.author}`} aria-pressed={Boolean(post.liked)} onClick={() => update((current) => ({ ...current, liked: !current.liked }))}>♡ {post.likes + (post.liked ? 1 : 0)}</button>
                <button className={commentsOpen ? 'comments-active' : ''} type="button" aria-label={`Comments on ${post.author}'s post`} aria-expanded={commentsOpen} onClick={() => setCommentsOpen(!commentsOpen)}>▱ {post.comments}</button>
                <button type="button" onClick={sharePost} aria-expanded={shareOpen}>↥ Share</button>
            </footer>
            {shareOpen && (
                <section className="post-share-panel" aria-label="Share public post">
                    <div><b>Share public post</b><button type="button" onClick={() => setShareOpen(false)}>Close</button></div>
                    <label>Post link<input value={shareUrl.href} readOnly onFocus={(event) => event.target.select()} /></label>
                    <button type="button" onClick={copyLink}>Copy link</button>
                    {shareNotice && <p role="status">{shareNotice}</p>}
                    <small>Local preview links work on this PC. New posts and attached files need backend storage before others can access them.</small>
                </section>
            )}
            {commentsOpen && (
                <section className="comments-section">
                    <h3>Discussion</h3>
                    <CommentThread comments={comments} onReply={addComment} onLike={likeComment} />
                    <form className="comment-form" onSubmit={(event) => {
                        event.preventDefault();
                        if (!commentText.trim()) return;
                        addComment(null, commentText.trim());
                        setCommentText('');
                    }}>
                        <Avatar initials="YO" small />
                        <input type="text" value={commentText} maxLength={3000} onChange={(event) => setCommentText(event.target.value)} placeholder={`Reply to ${post.author}...`} aria-label={`Comment on ${post.author}'s post`} />
                        <button type="submit" disabled={!commentText.trim()}>Send</button>
                    </form>
                </section>
            )}
        </article>
    );
}
