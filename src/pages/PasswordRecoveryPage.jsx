import React, { useEffect, useRef, useState } from 'react';
import { requestPasswordRecovery } from '../utils/passwordRecovery.js';

export default function PasswordRecoveryPage({ reset, theme, onToggleTheme }) {
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [visible, setVisible] = useState(false);
    const request = useRef(null);
    const token = useRef(new URLSearchParams(window.location.hash.split('?')[1] || '').get('token') || '');

    useEffect(() => {
        // Remove the recovery secret from the address bar after reading it.
        if (reset && token.current) {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/reset-password`);
        }
        return () => request.current?.abort();
    }, [reset]);

    async function submit(event) {
        event.preventDefault();
        if (busy || done) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const password = String(data.get('password') || '');

        if (reset && (password.length < 12 || password.length > 128)) {
            setNotice('Use between 12 and 128 characters for your new password.');
            return;
        }
        if (reset && password !== data.get('confirm')) {
            setNotice('Your passwords do not match. Please try again.');
            return;
        }

        setNotice('');
        setBusy(true);
        const controller = new AbortController();
        request.current = controller;
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
            await requestPasswordRecovery(
                reset ? 'reset' : 'forgot',
                reset ? { token: token.current, password } : { email: String(data.get('email')).trim() },
                controller.signal,
            );
            form.reset();
            setVisible(false);
            setDone(true);
            if (reset) token.current = '';
            setNotice(reset
                ? 'Your password has been changed. You can now return to login.'
                : 'If an account uses this email address, you will receive a password reset link. Check your inbox and spam folder.');
        } catch (error) {
            setNotice(error.name === 'AbortError'
                ? 'The request timed out or was cancelled. Please try again.'
                : error instanceof TypeError
                    ? 'Unable to reach account services. Please try again later.'
                    : error.message);
        } finally {
            window.clearTimeout(timeout);
            setBusy(false);
        }
    }

    return (
        <main className="shell">
            <button className="theme-toggle login-theme-toggle" type="button" onClick={onToggleTheme}>
                {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>
            <section className="story" aria-label="Account recovery">
                <a className="brand" href="#/login">SUF · Stack Under Flow</a>
                <div className="story-body">
                    <div className="eyebrow">BACK TO YOUR COMMUNITY</div>
                    <h1>Pick up<br />where you <em>left off.</em></h1>
                    <p>Recover access to your projects, peers, and conversations.</p>
                </div>
                <footer>STACK UNDER FLOW <span>Built for curious minds.</span></footer>
            </section>
            <section className="auth">
                <div className="form-wrap">
                    <div className="small-label">ACCOUNT RECOVERY</div>
                    <h2>{reset ? 'Choose a new password.' : 'Forgot your password?'}</h2>
                    <p className="intro">{reset
                        ? 'Use a new password for your SUF account.'
                        : 'Enter your account email and we will request a reset link. If you joined with 42, recover your Intra password through 42.'}</p>
                    {reset && !token.current && !done ? (
                        <p className="notice" role="alert">Open the reset link from your email to choose a new password. Missing or expired link? Request another below.</p>
                    ) : !done && (
                        <form onSubmit={submit} aria-busy={busy}>
                            {reset ? (
                                <>
                                    <label>New password
                                        <div className="password">
                                            <input name="password" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} placeholder="12–128 characters" />
                                            <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide passwords' : 'Show passwords'}>{visible ? 'Hide' : 'Show'}</button>
                                        </div>
                                    </label>
                                    <label>Confirm new password
                                        <input name="confirm" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} />
                                    </label>
                                </>
                            ) : (
                                <label>Email address
                                    <input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required disabled={busy} />
                                </label>
                            )}
                            <button className="primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : reset ? 'Save new password' : 'Send reset link'}</button>
                        </form>
                    )}
                    {notice && <p className="notice" role="status">{notice}</p>}
                    {reset && !done && <p><a href="#/forgot-password">Request a new reset link</a></p>}
                    <p><a className="text-button" href="#/login">← Back to login</a></p>
                    <p className="prototype">{import.meta.env.VITE_AUTH_API_URL ? 'Password recovery uses connected account services.' : 'Frontend preview · Email delivery and password changes need account services.'}</p>
                </div>
            </section>
        </main>
    );
}
