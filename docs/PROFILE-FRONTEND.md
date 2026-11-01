# Profile frontend

Route: #/profile. Open from the avatar link in the shared header.

Implemented: own-profile display, editing display name and username, short bio, skills, GitHub/portfolio/LinkedIn links, photo selection/removal, and local browser persistence. Photos accept PNG/JPEG/WebP up to 2 MB. Browser storage failures show a session-only notice. Links allow HTTP/HTTPS only.

The profile Posts tab shows posts authored by the preview user in the shared Home state. Those posts are session-only. Projects and Discussion rooms have empty states pending account activity endpoints; no invented personal activity is displayed.

Backend integration: ProfilePage accepts account with is42Verified, intraUsername, campus, peerCount and projectCount. Verification and campus data are not editable. The current shell does not yet supply an authenticated account. Add GET/PATCH profile and photo upload endpoints, username availability checks, and project/room activity endpoints. Local browser profile storage is preview data, not an account or authentication source. Saved posts are not shown publicly.

This step implements the user's own profile. Viewing another user's profile and sending peer requests need the public-profile route and peer service in a later step.

Validation: production build passed; browser checked profile navigation, edit form and successful save. Responsive layout inspected at the preview's narrow viewport. Full cross-browser checks are still pending.

## Photo fix (27 October 2026)
Avatar selection now accepts non-empty PNG/JPEG/WebP/GIF up to 10 MB and decodes/resizes them to a 512-pixel square WebP image for browser storage. Unsupported or unreadable formats show an error; HEIC should be exported as JPEG. Save changes applies the draft. The shared header/composer and own-post avatars use the saved profile image. Save controls remain visible while scrolling the edit popup. Browser tests verified preview, save, header image presence, refresh persistence, and photo removal using a temporary SUF logo; the test photo was removed and existing profile text preserved. Backend account upload/storage is still required for synchronization across devices.

