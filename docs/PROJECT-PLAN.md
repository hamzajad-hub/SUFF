# SUF — Stack Under Flow

SUF is a developer community platform focused on sharing projects, getting help, discussing code, and learning together. It is designed with 42 students in mind while remaining open to the wider developer community.

## Vision

SUF gives developers one place to:

- discover projects and active discussions;
- create a project and explain its goal;
- read a project PDF or README before joining the discussion;
- open focused discussion rooms for a specific problem;
- share small code examples and get help from peers;
- find people, projects, posts, rooms, and topics through one search bar.

The visual direction is modern and dark, with subtle space-inspired backgrounds and restrained terminal-green highlights. Normal interface text uses **Inter**. Code blocks and terminal-style rooms use **JetBrains Mono**.

## Brand direction

- **Name:** Stack Under Flow (SUF)
- **Working logo direction:** a custom circuit-trace monogram made from the letters **S**, **U**, and **F**.
- **Main colors:**
  - Background: `#050A0E`
  - Panels: `#0B1218`
  - Main accent: `#00E6A8`
  - Main text: `#F1F5F4`
  - Secondary text: `#8B9AA5`
  - Borders: `#1A2933`

## Main navigation and pages

### Home

The main community feed. It includes a create-post area, posts, trending projects, suggested peers, and recent discussions.

### Explore and Search Results

One global search bar can search for:

- a peer by `@username` or name;
- a tag such as `#minishell`, `#c`, or `#docker`;
- a project by name;
- posts and discussion rooms by title or keywords.

Results can be filtered through: **All**, **Peers**, **Projects**, **Posts**, **Rooms**, and **Tags**.

### Projects

Lists 42 projects and community-created projects. Users can search, browse categories, view active projects, and select **Add Project**.

Projects are ranked by a combination of recent discussion activity and total discussion activity. A project with conversations happening today should appear above an inactive project with old messages.

### Add Project

The creator provides:

- project name;
- short description;
- category and `#` tags;
- a project PDF and/or README;
- an optional first discussion room.

### Project Details

Each project page contains:

- project name, creator, description, and tags;
- a PDF or README explaining the requirements;
- useful links and project resources;
- related posts;
- project discussion rooms;
- a **Create Room** action.

### Discussion Rooms

Rooms belong to a project and focus on a specific question or topic. They show the room title, description, tags, recent activity, message count, and online peers.

Rooms are ranked by recent activity and participation, so active help rooms appear first.

### Individual Discussion Room

The room is terminal-inspired but remains easy to read. It includes:

- terminal-style messages, such as `hamza@SUF >`;
- a normal message input styled like a command line;
- VS Code-style code blocks with a file name, language, line numbers, syntax colors, and copy action;
- a small online compiler for short examples only;
- a language selector, **Run Code** action, output area, and compiler-error area;
- room members and online peers.

The code runner is for small examples, debugging snippets, and explanations. It is not intended to run complete projects such as Minishell or Cub3D.

### 42 Students

A dedicated area for 42 students, including common 42 projects, 42-focused rooms, verified student posts, resources, and project tips.

### Messages

Private conversations between peers.

### Peers

SUF uses the word **Peers** instead of Friends. The Home page can suggest people through an **Add Peers** card and an **Add Peer** action.

### Profile

Shows user information, created projects, posts, saved items, and the `42 Verified` badge when applicable.

### Settings

Contains profile settings, account and password settings, notification controls, dark/light mode, and 42 verification settings.

### Login and Sign Up

Provides account creation and login, with optional 42 verification.

## 42 verification

Users who verify through an official 42 authorization flow receive a `42 Verified` badge beside their username. and link by intra acc.

## Reusable interface components

The frontend will reuse these pieces across pages:

- top bar and side navigation;
- project cards and post cards;
- user identity row, avatar, and `42 Verified` badge;
- project tags;
- VS Code-style code block;
- room message, terminal input, and code runner;
- trending-project, add-peers, and recent-discussions cards;
- buttons, inputs, search, and filters.

## Build order

1. Confirm the logo with the team.
2. Create the frontend project.
3. Build the shared layout: top bar, sidebar, cards, buttons, typography, and colors.
4. Build the Home page.
5. Build Projects, Project Details, and Discussion Rooms.
6. Add global search and tag results.
7. Add profiles, peers, messages, and 42 Students.
8. Connect the frontend to a backend and database.
9. Build secure 42 verification and an isolated code-runner service.

## Current status

The product vision, visual direction, typography, color palette, main components, search behavior, project system, room ranking, and page architecture are defined. The next step is detailed page design, then frontend implementation.
