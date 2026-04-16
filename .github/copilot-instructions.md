# Workspace Instructions

## Project Shape
- This repo contains a Node/Express backend in [backend/](../backend/) and an Expo React Native frontend in [frontend/](../frontend/).
- The assignment requirements live in [instructions.md](../instructions.md); treat that file as the source of truth.
- Planning notes are in [ideas.md](../ideas.md); link to them instead of duplicating them here.

## Run Commands
- Backend: run `npm install` and then `npm start` inside [backend/](../backend/).
- Frontend: run `npm install` and then `npm start` inside [frontend/].
- Frontend variants are available through the package scripts: `npm run android`, `npm run ios`, and `npm run web`.
- The backend expects Redis to be available and listens on port `3001`.

## Code Boundaries
- Backend entry point: [backend/app.js](../backend/app.js). Keep Express, Redis, and logging changes there or in [backend/utils/logger.js](../backend/utils/logger.js).
- Frontend entry point: [frontend/App.js](../frontend/App.js). Keep UI and client-side state there unless a refactor clearly warrants another file.
- Preserve the `StAuth10244` statement at the top of source files that already contain it.

## Working Rules
- Keep TODO changes local to React state unless a backend save, restore, or clear action is explicitly intended.
- Match the existing style and keep edits minimal.
- Do not add `node_modules` or other generated artifacts to the submission.
- Prefer linking to existing docs rather than repeating their contents.
