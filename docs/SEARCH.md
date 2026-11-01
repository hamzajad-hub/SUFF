# Community search

Use the top-bar search field and press Enter, or choose Search in navigation. `/search` searches public posts, projects, peers, discussion rooms, and tags together. It includes sample data and content created in this tab session. Private messages, offline message caches, and private profile fields are excluded.

## Controls

- Text queries match all entered words, ignoring case and Latin accents.
- `@username` matches content owners and peer usernames; `#tag` matches a complete tag, including `C++`.
- Type tabs narrow results and show matching counts.
- Tag filters combine with query and type.
- Sorting supports relevance, activity, name A–Z, and name Z–A.
- Results use six items per page. Pages clamp safely after filtering; empty results provide a reset action.
- Query, type, tag, sorting and page stay in the URL, survive refresh for public records, and support Back/Forward.
- Room links open the exact project and room, including on direct SSR requests.

Examples: `/search?q=React&type=projects&tag=React&sort=name-asc` and `/search?type=rooms`.

Search is server-rendered for public sample data and hydrated using the same initial index. Results use noindex metadata to avoid indexing arbitrary queries. This frontend index can be replaced or extended with authorized backend search once APIs are ready. Temporary posts, projects, rooms and files survive navigation, including legal pages, but end on refresh or logout. Their URLs are not persistent public records until the backend stores them.

The subject's advanced-search minor module includes filters, sorting, and pagination. They are implemented together here; final credit remains subject to evaluation.
