# Contributing to NEXUS

Thank you for your interest in contributing!

## Development Setup

Follow the [Quick Start](README.md#-quick-start) in the README to get a local environment running.

## Project Structure

```
nexus/
├── backend/   Express API (TypeScript)
├── frontend/  Next.js 14 App Router (TypeScript)
└── scripts/   Data import utilities
```

## Branching

- `main` — stable, always deployable
- `develop` — integration branch
- `feature/your-feature-name` — feature branches

## Workflow

1. Fork the repo
2. Create a feature branch off `develop`
3. Write your code + tests
4. Run `npm test` in `backend/` — all tests must pass
5. Run `npm run type-check` in `frontend/` — no TypeScript errors
6. Open a PR against `develop`

## Backend conventions

- **Controllers** handle HTTP — parse req, call service, send res.
- **Services** handle business logic and DB queries.
- Always add a test for new endpoints in `backend/tests/`.
- Use `AppError` for expected failures (4xx). Let unexpected errors bubble to `errorHandler`.
- Cache expensive queries in Redis with a `CACHE_TTL` of 5 minutes.

## Frontend conventions

- **Pages** live in `src/app/` (Next.js App Router).
- **Components** are split by concern: `map/`, `panels/`, `sidebar/`, `ui/`.
- **Hooks** own all data fetching (`useSWR`) and side effects.
- **Store** (`useStore`) owns global UI state only — no server data.
- Use Tailwind utility classes. Avoid inline styles except for dynamic values.
- All new components must be `'use client'` only if they use browser APIs or hooks.

## Adding a new API endpoint

1. Add the route to `backend/src/routes/`.
2. Create a controller in `backend/src/controllers/`.
3. Register the router in `backend/src/app.ts`.
4. Add the client method to `frontend/src/lib/api.ts`.
5. Write a test in `backend/tests/`.

## Adding a new page

1. Create `frontend/src/app/your-page/page.tsx`.
2. Add any required data fetching in a hook under `frontend/src/hooks/`.
3. Add route to `middleware.ts` if it needs auth protection.

## Code style

- TypeScript strict mode is enforced.
- No `any` unless unavoidable — prefer `unknown` + type narrowing.
- All async functions must handle errors with `try/catch` or pass to `next(err)`.

## Questions

Open a GitHub Discussion or file an issue tagged `question`.
