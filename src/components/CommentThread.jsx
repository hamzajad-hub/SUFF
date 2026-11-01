import React, { useState } from 'react';
import Avatar from './Avatar.jsx';

function CommentItem({ comment, comments, onReply, onLike, depth = 0 }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const children = comments.filter((item) => item.parentId === comment.id);
    return (
        <article className="thread-comment">
            <div className="thread-comment-body">
                <Avatar initials={comment.initials || 'YO'} small />
                <div className="thread-bubble">
                    <a className="post-profile-link" href={comment.author === 'you' ? '#/profile' : `#/profile/${comment.author}`}>{comment.author}</a>
                    <p>{comment.body}</p>
                    <div className="thread-actions">
                        <button type="button" aria-label={`Like comment by ${comment.author}`} aria-pressed={Boolean(comment.liked)} onClick={() => onLike(comment.id)}>♡ {(comment.likes || 0) + (comment.liked ? 1 : 0)}</button>
                        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>Reply</button>
                    </div>
                    {open && (
                        <form className="thread-reply-form" onSubmit={(event) => {
                            event.preventDefault();
                            if (!text.trim()) return;
                            onReply(comment.id, text.trim());
                            setText('');
                            setOpen(false);
                        }}>
                            <input aria-label={`Reply to ${comment.author}'s comment`} value={text} onChange={(event) => setText(event.target.value)} maxLength={3000} placeholder="Write a reply..." />
                            <button type="submit" disabled={!text.trim()}>Send reply</button>
                        </form>
                    )}
                </div>
            </div>
            {children.length > 0 && (
                <div className={depth < 3 ? 'thread-children' : 'thread-children thread-deep'}>
                    {children.map((child) => <CommentItem key={child.id} comment={child} comments={comments} onReply={onReply} onLike={onLike} depth={depth + 1} />)}
                </div>
            )}
        </article>
    );
}

export default function CommentThread({ comments, onReply, onLike }) {
    return <div className="comment-thread">{comments.filter((comment) => comment.parentId == null).map((comment) => <CommentItem key={comment.id} comment={comment} comments={comments} onReply={onReply} onLike={onLike} />)}</div>;
}
