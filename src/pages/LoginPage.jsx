import React, { useState } from 'react';

export default function LoginPage({ onEnter, theme, onToggleTheme }) {
    const [mode, setMode] = useState('login');
    const [visible, setVisible] = useState(false);
    const [notice, setNotice] = useState('');
    const signup = mode === 'signup';

    function continueWith42() {
        const loginUrl = import.meta.env.VITE_42_LOGIN_URL;

        if (!loginUrl) {
            setNotice(
                '42 sign-in is not available yet. Please try again later.',
            );
            return;
        }

        const destination = new URL(loginUrl, window.location.origin);

        if (!['http:', 'https:'].includes(destination.protocol)) {
            setNotice('42 sign-in is unavailable. Please try again later.');
            return;
        }

        window.location.assign(destination.href);
    }

    function changeMode(nextMode) {
        setMode(nextMode);
        setNotice('');
        setVisible(false);
    }

    function submit(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if (signup && data.get('password') !== data.get('confirm')) {
            setNotice('Your passwords do not match. Please try again.');
            return;
        }

        onEnter();
    }

    return (
        <main className="shell">
            <button
                className="theme-toggle login-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                aria-label={
                    theme === 'dark'
                        ? 'Switch to light mode'
                        : 'Switch to dark mode'
                }
                title={
                    theme === 'dark'
                        ? 'Switch to light mode'
                        : 'Switch to dark mode'
                }
            >
                {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>

            <section
                className="story"
                aria-label="About SUF"
            >
                <a
                    className="brand"
                    href="#/login"
                    aria-label="Stack Under Flow"
                >
                    <img
                        src="/logo.png"
                        style={theme === 'light' ? {
                            filter: 'invert(1) hue-rotate(180deg) contrast(1.35)',
                            mixBlendMode: 'multiply',
                        } : undefined}
                        alt="SUF — Stack Under Flow"
                    />
                </a>

                <div className="story-body">
                    <div className="eyebrow">
                        <span /> A COMMUNITY BUILT BY PEERS
                    </div>
                    <h1>
                        Great code starts
                        <br />
                        with a <em>conversation.</em>
                    </h1>
                    <p>
                        Share what you’re building. Find your peers.
                        <br />
                        Turn the next roadblock into a breakthrough.
                    </p>

                    <div className="terminal">
                        <div className="terminal-bar">
                            <i />
                            <i />
                            <i />
                            <span>the flow / discussion room</span>
                        </div>
                        <div className="terminal-content">
                            <p>
                                <b>user1@SUF</b> <span>~</span> How do I fix
                                this pipe?
                            </p>
                            <p>
                                <b className="purple">user2@SUF</b>{' '}
                                <span>~</span> Let’s work through it together.
                            </p>
                            <p>
                                <b>user3@SUF</b> <span>~</span>{' '}
                                <span className="cursor">▍</span>
                            </p>
                        </div>
                    </div>

                    <div className="features">
                        <span>01 / Share projects</span>
                        <span>02 / Solve together</span>
                        <span>03 / Keep learning</span>
                    </div>
                </div>

                <footer>
                    STACK UNDER FLOW <span>Built for curious minds.</span>
                </footer>
            </section>

            <section className="auth">
                <div className="form-wrap">
                    <div className="small-label">YOUR NEXT CHAPTER</div>
                    <h2>{signup ? 'Find your people.' : 'Welcome back.'}</h2>
                    <p className="intro">
                        {signup
                            ? 'Create an account and join the conversation.'
                            : 'Your projects and peers are waiting for you.'}
                    </p>

                    <div
                        className="switch"
                        aria-label="Account options"
                    >
                        <button
                            type="button"
                            aria-pressed={!signup}
                            className={!signup ? 'selected' : ''}
                            onClick={() => changeMode('login')}
                        >
                            Log in
                        </button>
                        <button
                            type="button"
                            aria-pressed={signup}
                            className={signup ? 'selected' : ''}
                            onClick={() => changeMode('signup')}
                        >
                            Sign up
                        </button>
                    </div>

                    <form
                        key={mode}
                        onSubmit={submit}
                    >
                        {signup && (
                            <label>
                                Username
                                <input
                                    name="username"
                                    autoComplete="username"
                                    placeholder="Choose your username"
                                    pattern="[A-Za-z0-9_]{3,24}"
                                    title="Use 3–24 letters, numbers, or underscores"
                                    required
                                />
                            </label>
                        )}

                        <label>
                            Email address
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                required
                            />
                        </label>

                        <label>
                            Password
                            <div className="password">
                                <input
                                    name="password"
                                    type={visible ? 'text' : 'password'}
                                    autoComplete={
                                        signup
                                            ? 'new-password'
                                            : 'current-password'
                                    }
                                    placeholder={
                                        signup
                                            ? 'At least 12 characters'
                                            : 'Enter your password'
                                    }
                                    minLength={signup ? 12 : undefined}
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={
                                        visible
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                    onClick={() => setVisible(!visible)}
                                >
                                    {visible ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </label>

                        {signup && (
                            <label>
                                Confirm password
                                <input
                                    name="confirm"
                                    type={visible ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Enter your password again"
                                    required
                                />
                            </label>
                        )}

                        {!signup && (
                            <a className="text-button" href="#/forgot-password">
                                Forgot password?
                            </a>
                        )}
                        <button
                            className="primary"
                            type="submit"
                        >
                            {signup ? 'Create account' : 'Log in'}{' '}
                            <span aria-hidden="true">↗</span>
                        </button>
                    </form>

                    <div className="auth-divider">or</div>
                    <button
                        className="intra-button"
                        type="button"
                        onClick={continueWith42}
                    >
                        <strong aria-hidden="true">42</strong>
                        Continue with 42
                    </button>

                    {notice && (
                        <p
                            className="notice"
                            role="status"
                        >
                            {notice}
                        </p>
                    )}

                    <p className="prototype">
                        Frontend preview · Account services coming next
                    </p>
                </div>
            </section>
        </main>
    );
}

