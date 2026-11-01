# 42 sign-in — frontend handoff

SUF offers email/password forms and a Continue with 42 button. The button is independent of form validation and uses a same-tab redirect. A new tab is unnecessary: the backend callback returns the user to SUF.

## Configuration

Set `VITE_42_LOGIN_URL` in a local `.env` file to the backend's agreed OAuth start endpoint, then restart Vite. For example, `VITE_42_LOGIN_URL=http://localhost:3000/auth/42/start` is an illustrative endpoint, not an implemented route. This value is public browser configuration, never a client secret. Without it, the button displays an unavailable message and does not navigate.

## Backend responsibilities

1. Register SUF as its own application with 42 and configure its callback URL. Do not reuse Intra's client ID, callback URL, or copied login-session URL.
2. Start the supported authorization flow, generate fresh unpredictable state bound to the session, and redirect to 42.
3. Validate state and handle denied access or provider errors on callback. Exchange the authorization code on the server; keep secrets and provider tokens out of frontend code.
4. Read the authenticated 42 profile through the official API. Establish the team's student eligibility rule using trusted profile/enrollment data. Owning a 42 account or using a school-looking email alone must not automatically grant the student badge.
5. Create or sign in the SUF user and return to SUF with a secure session. Do not place tokens in the frontend URL. Provide the verified status through the authenticated backend user response.
6. For users who signed up with email, implement a separate authenticated account-linking flow. Do not silently merge accounts just because email addresses match.

No backend or real verification is implemented in this frontend change. The profile badge must be based on the server's result, never a browser flag.
