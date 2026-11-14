# HG FitAccess — Gym Admin

Read this first in every session. Part A is the filled-in brief, "Project decisions" records where this
repo deliberately departs from the generic template in Part B (decisions win over Part B), and
`docs/API_NOTES.md` lists every API gap and assumption. Keep both files current when you change things.

## Part A: Project brief

```
APP_NAME:           HG FitAccess — Gym Admin
DOMAIN:             Gym management (Humble Globe). Gym owners, general managers, branch managers and
                    receptionists use this dashboard; members use the separate HG FitAccess mobile app.
REFERENCE_REPO:     none

API_BASE_URL_DEV:   https://hgfitaccess-api.onrender.com          (proxied as /api in dev)
API_BASE_URL_PROD:  https://api.hgfitaccess.com  (per spec "servers"; Render URL until DNS is live)
API DOCS:           https://hgfitaccess-api.onrender.com/api/docs/ (spec JSON is embedded in
                    /api/docs/swagger-ui-init.js; there is no /docs-json route)
RESPONSE_ENVELOPE:  { success, message, data }   — list pagination lives at data.pagination
                    { page, limit, total, totalPages }; query params are page + limit (max 100)
ERROR_FIELDS:       message   (validationMessages | error_description | errors[] also handled)

AUTH:
  login:            POST /v1/auth/login  { identifier (email or phone), password }
                    → data { user, accessToken, refreshToken }
  otp:              none on login (verify-email OTP exists for registration only — not used here)
  refresh:          POST /v1/auth/refresh-token { refreshToken } → both tokens rotate
  profile:          GET /v1/auth/me   (no org role here — see roles below)
  role / org:       GET /v1/mobile/organizations → [{ id, name, role, isActive, ... }]
                    PATCH /v1/mobile/organizations/{id}/select  (switch active org)
  logout:           POST /v1/auth/logout
  forgot / reset:   POST /v1/auth/forgot-password { email }, POST /v1/auth/reset-password
                    { email, otp, password, confirmPassword }
  change password:  PATCH /v1/mobile/profile/change-password
  2FA (TOTP):       none

ROLES:              OWNER, GENERAL_MANAGER, MANAGER, RECEPTIONIST   (MEMBER = no dashboard access)
DEFAULT_ROLE_MAP:   RECEPTIONIST (least privileged)
READ_ONLY_ROLES:    none

MODULES (route — roles):
  Overview          /overview         all
  Members (+detail) /members, /members/:id   all
  Memberships       /memberships      all
  Membership Plans  /membershipPlans  all view; OWNER, GENERAL_MANAGER create/edit/deactivate
  Attendance        /attendance       all
  Branches          /branches         OWNER, GENERAL_MANAGER
  Staff             /staff            OWNER, GENERAL_MANAGER, MANAGER (assumed); invite same
  Reports           /reports          all (MANAGER/RECEPTIONIST branch-scoped)
  Settings          /settings         all; gym details editable by OWNER, GENERAL_MANAGER

BRAND:              primary #ACF699, text #FFFFFF, page bg #181A1D, surface #1F2227, border #282C32,
                    muted text #A4A6AA, subtle #61656B (Figma "Colour/Black/*"); dark UI only.
                    font DM Sans (variable woff2 in src/assets/fonts); logo: lucide Dumbbell mark.
DESIGN:             Figma 4HGByYseSZzGhqaDwSExZr, page "Page 1", section "Admin for the Gyms"
                    (node 1697:723): Overview, members-detail, Members, Memberships, Membership Plans,
                    Attendance, Branches, Staff, Reports.

DATA_LAYER:         query-cache
FEATURE_FLAGS:      idle logout on in production (VITE_APP_FEATURE_ENABLED), off in dev
OUT_OF_SCOPE:       tests, i18n, light mode, mobile layout (desktop dashboard ≥ 1280px)
```

## Project decisions (these override Part B)

- **Data layer is `query-cache`.** Reads are `useQuery` keyed `[module, entity, orgId, params]`, writes
  are `useMutation` + `invalidateQueries`. Redux holds only `shared` (notification, header), `auth`
  (user, organizations, active organization — never persisted) and `scope` (selected branch,
  persisted to localStorage). There are no per-module Redux slices.
- **Branch scope.** Every `/dashboard/*` call needs `{ scope, branchId }`. `hooks/useScope.ts` is the
  only place that resolves it. OWNER/GENERAL_MANAGER default to "All branches" (organization scope);
  MANAGER/RECEPTIONIST are pinned to a branch. The picker lives in the header and is hidden on
  pages whose endpoints take no scope (Branches, Staff, Settings).
- **Undocumented response shapes** are read through `utils/normalize.ts` (`pick`, `extractItems`)
  inside each module's hook (`toXRow` / `toX` helpers). Never read raw API fields in components.
  When a real schema is published, replace the normaliser with a typed mapper and delete the
  fallback keys.
- **Design scale.** Figma frames are ~1886px wide. `html { font-size: clamp(12px, .85vw, 16px) }`
  and rem units keep everything proportional, so write sizes as Tailwind rem classes
  (`text-lg` = 18px at full width, `p-6` = 24px). Avoid raw `px` in components.
- **Icons are lucide-react.** The Figma icons are the lucide set (home, users, credit-card, …), and
  Figma asset URLs aren't reachable from the build environment.
- **Toasts are bottom-right**, not top-left, so they don't cover the header or the gym switcher.
- **Actions with no endpoint are not rendered** (Add/Edit/Delete Member, Renew Membership, Edit
  Branch, staff edit/delete, export). Don't add disabled placeholders; add the feature when the
  endpoint exists.
- **Files.** Services are split per module (`services/<module>.ts`); hooks live in
  `hooks/<module>/use<Module>.ts`; shared query-string builder is `utils/helper/query.ts`.
- **Yarn.** `packageManager` is yarn@4.9.2 and the release is vendored at `.yarn/releases` (via
  `yarnPath`), so `yarn` works even where corepack can't download. Never use Yarn 1 to install.
- **Mock mode.** `yarn dev:mock` serves `src/mocks` through MSW (login with any credentials). Mock data
  follows the spec where documented and the normalisers' first-choice keys elsewhere. It is not a
  contract — check `docs/API_NOTES.md` before trusting a mock shape.
- **Verify** with `yarn tsc -b`, `yarn lint`, `yarn build` before reporting done.

## Part B: Build instructions

### B1. Role and rules

You are building {{APP_NAME}}, an internal admin dashboard. Follow the stack, structure and patterns below unless Part A overrides them. Part A wins on any conflict.

- Never invent API fields. If a contract is missing or unclear, ask, or build only the documented part and list the gap.
- Work in phases: Phase 0 (scaffold + core), then one module per request. End each phase with a short summary and open backend questions.
- If `REFERENCE_REPO` is set, copy the files in B13 and adapt names, brand and endpoints. Don't rewrite them from scratch.
- Verify every change with `yarn tsc -b`, `yarn build` and `yarn lint`. Don't report done while any fail.
- Comments explain why (API quirks, derived fields, security decisions), not what.
- Don't add libraries outside B2 without asking.

### B2. Stack

| Concern | Library |
|---|---|
| Framework | React 19, TypeScript ~5.8 (strict) |
| Build / dev server | Vite 7, `@vitejs/plugin-react` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, `tw-animate-css`, `clsx` + `tailwind-merge` (`cn`), `class-variance-authority` |
| UI primitives | Radix UI (dialog, dropdown-menu, popover, select, tabs, checkbox, radio-group, accordion, label, slot) wrapped shadcn-style; `vaul` (drawer); `input-otp`; `react-day-picker`; `lucide-react`; `framer-motion` |
| Routing | `react-router-dom` 7 |
| App state | `@reduxjs/toolkit` 2, `react-redux` 9, `redux-persist` 6 |
| Server calls | `axios`, `@tanstack/react-query` 5 |
| Tables | `@tanstack/react-table` 8 |
| Charts | `echarts` + `echarts-for-react` (main), `recharts` |
| Auth helpers | `react-jwt` (`isExpired`) |
| Inputs | `react-number-format`, `react-time-picker` |
| Dates | `dayjs` (direct dependency) |
| Files | server blob downloads for exports; `exceljs` only for client-built sheets |
| Optional | `@tiptap/*` (rich text), `country-list-js` |
| Dev | `eslint` 9, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier`, `husky`, `lint-staged`, `msw` |

### B3. Tooling

- Yarn 4 (Berry) via corepack; `.yarnrc.yml`: `nodeLinker: node-modules`. Never use a global Yarn 1; it rewrites the lockfile.
- `vite.config.ts`: plugins `[tailwindcss(), react()]`; alias `@` → `./src`; dev proxy `/api` → `API_BASE_URL_DEV` with `changeOrigin: true` (no CORS in dev); `build.rollupOptions.output.manualChunks = { react: ["react", "react-dom", "react-router-dom"] }`.
- Env: `VITE_APP_BASE_URL` (`/api` in `.env.development`, real URL in prod), `VITE_APP_FEATURE_ENABLED` (idle logout). Gitignore `.env*`.
- `tsconfig`: strict, `noUnusedLocals`, `noUnusedParameters`, `moduleResolution: "bundler"`, paths `@/*` → `./src/*`.
- ESLint flat config: `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs["recommended-latest"]`, `reactRefresh.configs.vite`; ignore `dist`.
- Prettier + husky + lint-staged (`prettier --write` on staged files).
- Scripts: `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`, `format`. `predev`/`prebuild` write `public/version.json` (`{ version: "<pkg version>-<timestamp>" }`); gitignore that file.

### B4. File structure

```
public/
  svgs/                     logo, favicon, empty-table.svg, filter.svg, export.svg, sidebar/ icons
  version.json              generated, gitignored
src/
  main.tsx                  providers + route rendering
  index.css                 Tailwind import, @font-face, @theme tokens, shadcn CSS vars
  assets/fonts/
  routes/index.tsx          routes array (lazy pages)
  layout/                   AppLayout, AuthLayout, DashboardLayout
  pages/<module>/           thin route entries; index.tsx = <Outlet /> for nested routes
  components/
    ui/                     shadcn-style primitives: button, dialog, drawer, dropdown-menu, select,
                            popover, calendar, table, tabs, checkbox, switch, input, label, skeleton, input-otp
    shared/                 DataTable, pagination/, SearchInput, Floating{Input,NumberInput,PasswordInput,Select},
                            MultiSelect, StatCard, CardSkeleton, FileUpload, NotificationComponent,
                            Sidebar, IdleLogout, modal/, modalForm/
    <module>/               <Module>Component.tsx, <Entity>Table.tsx, constants.ts, modal/
  services/<module>.ts      axios calls only
  hooks/<module>/use<Module>.ts   react-query hooks
  hooks/                    useTypedSelector, useLogout, useVersionCheck
  store/                    store.ts, rootReducer.ts, resetAction.ts, slices/<module>Slice.tsx
  types/index.ts            shared types (Modal, LocalRoutes, DataTableProps, GenericGetAllCall,
                            NotificationType, slice states, payloads)
  utils/                    axiosConfig.ts, token.ts, roleAccess.ts,
                            helper/ (dates, numbers, currency, copy, downloadFile, truncateText)
  lib/utils.ts              cn()
  data/constants.ts         static option lists
```

Naming: components PascalCase; services `get<Thing>APICall` / `update<Thing>APICall`; hooks `useGet<Thing>` / `useUpdate<Thing>`; slice action `update<Module>State`; one top-level route segment per module, camelCase (`/settlementWithdrawals`).

### B5. Bootstrap and routing

- `main.tsx` provider order: `Provider(store)` > `PersistGate` > `QueryClientProvider` (`mutations.retry: false`) > `BrowserRouter` > `Suspense` > `AppLayout` > `Routes`.
- Each route's element is wrapped by flag: `noLayout` → bare; `requiresAuth` → `DashboardLayout`; else `AuthLayout`. `children` render as nested `<Route>`s.
- `routes/index.tsx` exports `routes: LocalRoutes[]` (`{ path, element, requiresAuth, children?, noLayout? }`). Every page is `lazy()` except Login (first paint). Detail pages are `:id` children under a parent whose page is `<Outlet />`. `*` → NotFound with `noLayout`.

### B6. Layouts, auth and session

- **AppLayout**: renders the global notification (auto-clears after 7s) and runs `useVersionCheck` (polls `/version.json` every 10s; hard reload when it changes).
- **AuthLayout**: split screen; logo + form on the left, brand image on the right, footer year.
- **DashboardLayout**:
  - Sidebar, a header card (title/subtitle from `shared.header`, user initials linking to `/settings`, logout), content in `Suspense` with `CardSkeleton`.
  - The user profile is not persisted. If it's missing, fetch it before rendering children. Rendering before the role is known lets a restricted role bypass the route guard by reloading. If the fetch fails, log out.
  - Route guard: if `canAccessPath(role, pathname)` is false, show an error notification and `navigate(getLandingPath(role), { replace: true })`.
  - Token check on route change and every 60s: refresh token missing or expired → log out; access token expired → `checkToken()`.
  - Listen for the `auth:logout` window event: `resetApp()`, clear storage, go to `/`.
  - Save `redirectAfterLogin` for deep links before logging out; Login sends the user there after sign-in.
- Tokens: access token in `sessionStorage.token`; refresh token in `localStorage.refreshToken`.
- `useLogout`: `resetApp()`, remove both tokens and any `persist:*` keys, navigate `/`.
- IdleLogout (only when `VITE_APP_FEATURE_ENABLED === "true"`): 5 min idle; warning modal with a 90s countdown; "I'm still here" resets the timer.
- Login flow: login → OTP step if required → store tokens → redirect. Forgot/reset password pages. 2FA setup and code modal under Settings → Security if Part A lists TOTP.

### B7. HTTP, state and data layer

**HTTP** (`utils/axiosConfig.ts`): `createAxiosInstance(baseURL, skipAuth)`. Each service file creates its own instance; `skipAuth = true` for login, OTP, forgot password and refresh.
- Request interceptor:
  1. Read-only block: lazily `import("@/store/store")` to read the role (avoids an import cycle). Reject the request if `isReadOnlyRole(role) && !isRequestAllowedForReadOnly(method, url)`.
  2. If the access token is expired, `await checkToken()`. On failure, dispatch `auth:logout` and reject.
  3. Set `Authorization: Bearer <token>`.
- Response interceptor: always throw `new Error(message)`, with message = `validationMessages` (joined) || `error_description` || `message` || "An error occurred". Parse `Blob` error bodies (from exports) as JSON first. Callers only read `error.message`.
- `utils/token.ts` `checkToken()`: one shared in-flight refresh promise, so concurrent requests don't each spend a rotating refresh token.

**State** (Redux Toolkit):
- One slice per module, `store/slices/<module>Slice.tsx`. Its state type lives in `types/index.ts` and extends `{ message?: string; errorMessage?: string }`.
- One generic reducer per slice: `update<Module>State({ actualState: keyof State, newState })`.
- Every slice resets on logout: `extraReducers: (b) => b.addCase(resetApp, () => initialState)`.
- Persistence is opt-in per slice with a key whitelist. Root whitelist is `[]`. Table filters go to sessionStorage; harmless preferences go to localStorage. Never persist fetched records, the user or tokens through redux-persist.
- `sharedSlice`: `notification { message, type }` and `header { route, title, subtitle? }`.
- Typed hooks `useAppSelector` and `useAppDispatch`. `serializableCheck: false`.

**Services** (`services/<module>.ts`): async functions returning `response.data`. Build queries with `URLSearchParams`; send `page` and `size`; omit empty filters. Exports use `{ responseType: "blob" }`. Comment any endpoint quirk.

**Hooks** (`hooks/<module>/use<Module>.ts`), per `DATA_LAYER`:
- `redux-mirror` (default, matches the reference app):
  - Every call, reads included, is a `useMutation`.
  - `onSuccess` writes the list and `pagination` into the slice; writes also set slice `message` and show a success notification.
  - `onError` sets `errorMessage`, clears the list on failed fetches and shows an error notification.
  - Components call `mutation.mutate(params)` from a `useEffect` keyed on page, pageSize, search and filters. They read data with `useAppSelector` and use `mutation.isPending` for loading.
  - After a write, a `useEffect` on the slice's `message` closes modals, clears `message` and refetches.
- `query-cache`: reads use `useQuery` with keys `[module, entity, params]`; writes use `useMutation` + `invalidateQueries`; Redux holds only session and UI state. Notifications work the same way.
- Normalise inconsistent response shapes in one helper per hook file (e.g. `extractItems(data)` that accepts an array or a nested key).

### B8. Role access (`utils/roleAccess.ts`, the single source of truth)

- `getAccessMap()`: role → allowed top-level paths. Unknown role → `DEFAULT_ROLE_MAP`. Dev-only paths are added only on `localhost` or hosts containing `dev`.
- `DENIED_SUBPATHS`: per-role regexes for sub-pages under an allowed base path.
- `canAccessPath(role, pathname)`: paths that appear in no role's list are ungoverned and allowed.
- `SIDEBAR_PATH_ORDER` + `getLandingPath(role)`: the first allowed path in sidebar order.
- Action-level checks: one roles array and one `canDoX(role)` function per action. Never inline role strings in components.
- Read-only roles: `isReadOnlyRole`, `canExportData`, and `isRequestAllowedForReadOnly(method, url)` = GET/HEAD/OPTIONS, minus a `MUTATING_GETS` regex list, plus `SELF_SERVICE_WRITES` (own password, own 2FA). Enforce in three places: UI gating, the DataTable backstop, and the axios interceptor.
- The Sidebar filters items and groups by `getAllowedPaths(role)`.

### B9. UI kit

- **Notifications**: `dispatch(updateSharedState({ actualState: "notification", newState: { message, type: NotificationType.success | error | info } }))`. Rendered top-left with framer-motion, gradient background per type.
- **Page header**: every module component dispatches `header { route, title }` on mount.
- **DataTable** (`shared/DataTable.tsx`), props:
  - `columns`, `data`, `tableName` or `headerContent`, `emptyState { header, subHeader }`
  - `enableSearch` + `onSearchChange` (debounced 400ms inside)
  - server pagination: `totalCount` (= totalPages), `currentPage`, `onPageChange`, `pageSize`, `onPageSizeChange`
  - `loading` (5 skeleton rows), `onRowClick`, column `meta.className`
  - buttons: `filter`/`handleFilter`, `exportData`/`handleExport`, `addNew`/`addButton`/`onAddNew`, `actionButton`, `secondaryButton`, `multipleActionButton`
  - read-only backstop: hides add, export and action buttons for read-only roles.
- **modalForm kit** (`shared/modalForm/`):
  - `ActionModal`: every create, update and confirm dialog. 440px wide; left-aligned title + X; optional `description` and `icon`; fields as children; full-width Cancel (grey `#979797`) / Submit (primary) grid; `loading`, `submitDisabled`; `submitClassName` for red destructive actions; `footer` override.
  - `FilterModal`: Reset / Apply. Field order: date range (time row beneath), primary entity, country, type/category, status. Status and type dropdowns get an "All" row (`withAllOption` / `fromSelectValue`). A half-filled date range disables Apply. Prefill from the active filters on open.
  - `ExportModal`: Cancel / Download, divider above the footer, same field order. Save the blob with `downloadFile(blob, filename)`.
  - `ModalDateField`, `ModalReadOnlyField`, `ModalSwitchRow`; `utils.ts` holds shared classes (`modalSelectProps`, `modalInputProps`, `modalTextareaClass`, `calendarPopoverClass`, `modalButtonClass`) and date helpers (DD/MM/YYYY display).
- **Detail view**: right-side vaul `Drawer` (~500px) with label/value rows. Actions sit in the drawer footer, gated by `canX`.
- **Inputs**: floating-label inputs and selects accept `labelClassName`, `triggerClassName` and `itemClassName`. Selected and hovered options use the primary colour.
- **Styling**: Tailwind v4, CSS-first. Tokens go in `@theme` in `index.css` (e.g. `--color-appPrimary`, `--color-textBlack`, `--color-lightGray`, `--color-inputGrey`, `--font-brand`). Self-host fonts as woff2 with `font-display: swap`. Page background `bg-lightGray`; cards white, `rounded-lg shadow-sm`. Merge classes with `cn()`.

### B10. Screen conventions

- **Tabs**: local state `[{ title, active, id }]`; active tab underlined in primary; each tab renders the same table component with different props (`status`, `tableName`, `emptyState`).
- **Tables**:
  - Local `{ page, pageSize }`, `searchText` and `activeFilters`; refetch when any change.
  - Search, filter and page-size changes reset to page 1.
  - S/N column = `(page - 1) * pageSize + row.index + 1`.
- **Row actions**: ellipsis dropdown with `stopPropagation` so the row click doesn't fire. Hide actions from roles without access. Disable (don't hide) actions the record's state forbids, so the user can see why.
- **Stat cards**: only when a stats endpoint exists. Never show placeholder numbers.
- **Display**:
  - Empty values → "N/A" ("-" for dates); dates through one shared formatter; amounts with currency symbol and 2 decimals.
  - Long references are truncated with a `title` tooltip and a copy icon (copy shows a success notification).
  - Status pills: `rounded-full text-xs`, colours from the module's `constants.ts`. Success `#00974F` on `#f0fff8`, error `#D91A1A` on `#fff3f2`, pending `#F1AE00` on `#fff5c9`. Show unknown statuses verbatim, not mislabelled.
- **Sensitive actions**: money movement and access changes use a two-step confirm when the API supports it (emailed token → enter token → commit). Rejections require a reason. Destructive submits are red.

### B11. Phase 0: scaffold and core

1. Tooling (B3), `index.css` tokens and fonts from BRAND, base types.
2. `axiosConfig.ts`, `token.ts`, `roleAccess.ts` with Part A's roles.
3. Store: `resetAction`, `sharedSlice`, `authSlice`, a user/profile slice (not persisted).
4. Routes, the three layouts, Sidebar, NotFound.
5. Auth pages: login (+ OTP), forgot/reset password; profile fetch; logout; idle logout.
6. UI kit (B9) and the `empty-table`, `filter` and `export` svgs.
7. Settings: Profile, Security (change password, 2FA if in scope), Users (if admin management is in scope).

Done when: you can log in, the sidebar shows only the role's modules, you land on the first allowed page, and an expired session logs you out.

### B12. Module recipe (one module per request)

1. Read the Part C spec. List gaps and assumptions before writing code.
2. Add types to `types/index.ts` (`<Module>State`, payloads).
3. `services/<module>.ts`.
4. `store/slices/<module>Slice.tsx`; register it in `rootReducer` (persist config only if needed).
5. `hooks/<module>/use<Module>.ts`.
6. `components/<module>/`:
   - `<Module>Component.tsx`: sets the header; tabs and stat cards if the spec has them.
   - `<Entity>Table.tsx`
   - `constants.ts`: status → pill colours, option lists, derived fields (comment why they're derived).
   - `modal/`: Create/Edit/Confirm → `ActionModal`; Filter → `FilterModal`; Export → `ExportModal`; details → Drawer.
7. `pages/<module>/<Module>Index.tsx` (+ an `index.tsx` Outlet for nested routes).
8. Wire up: lazy route, Sidebar entry, access map per role, `SIDEBAR_PATH_ORDER`, `canX` helpers.
9. Verify: `yarn tsc -b`, `yarn build`, `yarn lint`.
10. Report: what was built, derived or assumed fields, open backend questions.

Definition of done:
- [ ] Route is lazy, in the Sidebar, in the access map for the intended roles, and in `SIDEBAR_PATH_ORDER`
- [ ] Write actions are gated by `canX`; read-only roles see no write or export controls, and their requests are blocked
- [ ] Loading skeletons, empty-state copy, and an error notification on failure
- [ ] Server pagination and debounced search; search, filters and page size reset to page 1
- [ ] Modals use the modalForm kit; filter/export field order is followed
- [ ] No fetched data persisted; the slice resets on `resetApp`
- [ ] No invented fields; derived or assumed fields are commented
- [ ] `tsc -b`, `build` and `lint` pass
- [ ] Summary lists open backend questions

### B13. Portable core (copy when `REFERENCE_REPO` is set)

Copy these, then rename tokens, endpoints and roles:

```
vite.config.ts  tsconfig*.json  eslint.config.js  .yarnrc.yml  .gitignore  package.json (deps + scripts)
src/main.tsx  src/index.css  src/lib/utils.ts  src/types/index.ts (base types only)
src/utils/axiosConfig.ts  src/utils/token.ts  src/utils/roleAccess.ts
src/utils/helper/{copy,downloadFile,dateFormat,numberFormatter,index}.ts
src/store/{store,rootReducer,resetAction}.ts  src/store/slices/{shared,auth}Slice.tsx
src/hooks/{useTypedSelector,useLogout,useVersionCheck}.ts
src/layout/*  src/routes/index.tsx (structure only)
src/components/ui/*
src/components/shared/{DataTable,Searchinput,Select,FloatingInput,FloatingNumberInput,
  FloatingPasswordInput,MultiSelect,StatCard,CardSkeleton,FileUpload,NotificationComponent,
  Sidebar,IdleLogout,PreventInspection}.tsx
src/components/shared/{pagination,modal,modalForm}/*
src/components/auth/*  src/components/settings/* (trim to scope)
```

Drop domain-specific pieces (e.g. a global country selector, currency or merchant helpers) unless Part A needs them.

---

## Part C: Module spec (one per feature)

```
MODULE:           {{name}}
ROUTE:            {{/camelCasePath}}   detail: {{/:id page | drawer}}
SIDEBAR:          {{group > item}}, icon {{svg}}
ROLES (view):     {{...}}
ROLES (actions):  {{action: roles}}
DESIGN:           {{Figma link | screenshots}}

ENDPOINTS:
  {{METHOD /path}}: query {{...}}, body {{...}}, response {{sample JSON}}
  {{...}}

LIST:
  tabs:           {{e.g. Pending | Approved | Rejected → status param | none}}
  columns:        {{Label ← field (format)}}
  search:         {{endpoint/param | none}}
  filters:        {{fields}}
  export:         {{endpoint, format, fields | none}}
  stat cards:     {{endpoint | none}}

DETAIL:           {{drawer | page}}; fields {{...}}
ACTIONS:          {{name: endpoint, confirm type (simple | reason required | emailed token), roles}}
EMPTY STATES:     {{per tab: header / subheader}}
KNOWN GAPS:       {{anything the backend hasn't confirmed}}
```
