import React from 'react';

export default function VoteControls({ item, onVote, label }) {
    return (
        <div className="vote-controls" aria-label={`Votes for ${label}`}>
            <button type="button" aria-label={`Upvote ${label}`} aria-pressed={item.myVote === 1} onClick={() => onVote(1)}>▲</button>
            <span aria-label={`Score ${item.score || 0}`}>{item.score || 0}</span>
            <button type="button" aria-label={`Downvote ${label}`} aria-pressed={item.myVote === -1} onClick={() => onVote(-1)}>▼</button>
        </div>
    );
}
