# Password recovery handoff

Frontend routes:
- `#/forgot-password`: email entry and reset-link request.
- `#/reset-password?token=...`: new password and confirmation. The token is read into memory and removed from the address bar. Reloading requires reopening the email link.

Configure `VITE_AUTH_API_URL` with the backend auth base URL, then rebuild Vite. This is a public URL, never a secret. Without it the UI explicitly reports that no email was sent and no password changed.

Expected contract (agree these paths with the backend team):
- POST `{base}/password/forgot`, JSON `{email}`. Return 2xx for both existing and nonexistent accounts, with the same neutral response and similar timing.
- POST `{base}/password/reset`, JSON `{token, password}`. Return 2xx only after the password is successfully changed. 400/401/410 represent invalid or expired tokens; 429 represents rate limiting. Response bodies are not displayed to users.

Use HTTPS in production, allow the frontend origin with credentialed CORS if on separate origins, and enforce the server's CSRF policy. Server must validate email and password, generate random single-use expiring tokens, store token hashes, deliver the email, securely hash passwords, rate-limit requests, invalidate used tokens and existing sessions as appropriate. Never log passwords or reset tokens. Set an appropriate Referrer-Policy and avoid third-party scripts on reset pages. Frontend validation currently requires 12–128 characters and matching confirmation; agree a shared policy with backend. Login/signup themselves remain a demo pending real authentication.

Requests time out after 15 seconds, duplicate submissions are disabled while waiting, errors preserve inputs, successful requests clear form fields, and passwords/tokens are not stored in browser storage. 42-only users should use 42's own recovery process.
