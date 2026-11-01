// These endpoints are provided by the backend team. No recovery data is stored locally.
export async function requestPasswordRecovery(action, payload, signal) {
    const base = import.meta.env.VITE_AUTH_API_URL?.trim();

    if (!base) {
        throw new Error('Password recovery is not connected yet. No email was sent and no password was changed.');
    }

    const response = await fetch(`${base.replace(/\/$/, '')}/password/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
        signal,
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error('Too many attempts. Please wait before trying again.');
        }
        if (action === 'reset' && [400, 401, 410].includes(response.status)) {
            throw new Error('This reset link is invalid or has expired. Request a new link.');
        }
        throw new Error('We could not complete your request. Please try again later.');
    }
}
