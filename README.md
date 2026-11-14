# HG FitAccess — Gym Admin

Admin dashboard for gyms on HG FitAccess (Humble Globe): overview, members, memberships, membership
plans, attendance, branches, staff, reports and settings.

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · TanStack Query/Table · Redux Toolkit · Radix UI · ECharts.

## Getting started

```bash
corepack enable        # once; or use the vendored release: node .yarn/releases/yarn-4.9.2.cjs
yarn install
cp .env.example .env.development
yarn dev               # http://localhost:5173, API proxied to Render
yarn dev:mock          # same UI on mock data (MSW), any credentials log in
```

The Render API sleeps when idle, so the first request can take 30–60s.

| Script | |
|---|---|
| `yarn dev` / `yarn dev:mock` | Dev server (real API / mock data) |
| `yarn build` | Typecheck + production build to `dist/` |
| `yarn lint` | ESLint |
| `yarn format` | Prettier |

## Environment

| Variable | Purpose |
|---|---|
| `VITE_APP_BASE_URL` | API root. `/api` in dev (proxied), full URL incl. `/api` in prod |
| `API_BASE_URL_DEV` | Proxy target for `/api` in dev |
| `VITE_APP_FEATURE_ENABLED` | `true` enables 5-minute idle logout |
| `VITE_APP_MOCK` | `true` serves `src/mocks` via MSW |

## Docs

- `CLAUDE.md`: project brief, conventions and build instructions (read first)
- `docs/API_NOTES.md`: endpoint map, API gaps and open backend questions

## Moving to the permanent repo

History moves with the code:

```bash
git remote set-url origin git@github.com:<org>/<new-repo>.git
git push --mirror origin
```
