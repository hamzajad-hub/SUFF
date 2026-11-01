import React, { useState } from 'react';

export default function PeerActions({ username, status = 'none', onAction, compact = false }) {
    const [confirming, setConfirming] = useState(false);
    if (status === 'connected') {
        return <div className="peer-request-actions"><span className="peer-connected" role="status">✓ Peers</span>{confirming ? <><button className="project-secondary" type="button" onClick={() => { setConfirming(false); onAction(username, 'remove'); }}>Confirm remove {username}</button><button className="project-secondary" type="button" onClick={() => setConfirming(false)}>Keep peer</button></> : <button className="project-secondary" type="button" aria-label={`Remove ${username} from peers`} onClick={() => setConfirming(true)}>Remove peer</button>}</div>;
    }

    return (
        <div className={compact ? 'peer-request-actions peer-request-compact' : 'peer-request-actions'}>
            {status === 'incoming' ? (
                <>
                    <button className="project-primary" type="button" onClick={() => onAction(username, 'accept')} aria-label={`Accept ${username}'s request`}>Accept</button>
                    <button className="project-secondary" type="button" onClick={() => onAction(username, 'decline')} aria-label={`Decline ${username}'s request`}>Decline</button>
                </>
            ) : (
                <button
                    className={status === 'outgoing' ? 'project-secondary' : 'project-primary'}
                    type="button"
                    onClick={() => onAction(username, status === 'outgoing' ? 'cancel' : 'send')}
                    aria-label={status === 'outgoing' ? `Cancel request to ${username}` : `Send peer request to ${username}`}
                >
                    {status === 'outgoing' ? 'Cancel request' : compact ? '+ Add' : '+ Send peer request'}
                </button>
            )}
        </div>
    );
}
