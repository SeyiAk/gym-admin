# API notes, gaps and backend questions

Source: the OpenAPI 3.0.3 spec embedded in `https://hgfitaccess-api.onrender.com/api/docs/swagger-ui-init.js`
(read 14 Nov 2026). The same spec covers the member mobile app; this file lists only what the admin
dashboard uses.

## Endpoints the dashboard calls

| Area | Endpoint | Used by |
|---|---|---|
| Auth | `POST /v1/auth/login`, `POST /v1/auth/refresh-token`, `POST /v1/auth/logout`, `GET /v1/auth/me` | login, session |
| Auth | `POST /v1/auth/forgot-password`, `POST /v1/auth/reset-password` | forgot / reset password |
| Org / role | `GET /v1/mobile/organizations`, `PATCH /v1/mobile/organizations/{id}/select` | role resolution, gym switcher |
| Account | `PATCH /v1/mobile/profile/change-password` | Settings → Security |
| Organization | `GET /v1/organizations/{id}`, `PATCH /v1/organizations/{id}` | Settings → Gym |
| Overview | `GET /v1/dashboard/overview` | Overview, Attendance, Branches KPIs |
| Members | `GET /v1/dashboard/members`, `GET /v1/dashboard/members/{memberId}` | Members, Member details |
| Memberships | `GET /v1/dashboard/memberships` | Memberships |
| Plans | `GET /v1/membership-plans/branch/{branchId}`, `POST /v1/membership-plans`, `PATCH /v1/membership-plans/{id}`, `PATCH /v1/membership-plans/{id}/deactivate` | Membership Plans |
| Branches | `GET /v1/dashboard/branches`, `POST /v1/dashboard/branches`, `GET /v1/dashboard/branches/{branchId}/qr` | Branches, scope picker |
| Staff | `GET /v1/dashboard/staff`, `POST /v1/dashboard/staff` | Staff |
| Reports | `GET /v1/dashboard/reports` | Reports, Attendance |

Not used: `/auth/register`, `/auth/verify-email`, `/auth/resend-verification-otp`, `/mobile/home`,
`/mobile/me`, `/mobile/profile*` (except change-password), `/mobile/attendance/*` (member-only),
`POST /organizations`, `GET /organizations` (super admin), `POST /organizations/{id}/branches` and
`POST /organizations/{id}/invitations` (the `/dashboard` equivalents are used instead).

## Questions for the backend

### Blocking or high impact

1. **Role and branch assignment.** `GET /auth/me` returns no organization role and no branch. The
   app gets the role from `GET /mobile/organizations` (a mobile route). There is no way to get a
   MANAGER/RECEPTIONIST's assigned branch, so the app uses the first branch from
   `/dashboard/branches`. That endpoint is documented as OWNER/GENERAL_MANAGER only, so for branch
   roles it may 403 and leave them with "No branch selected".
   → Can `/auth/me` (or a `/dashboard/me`) return `{ organization, role, branches[] }`?
2. **Missing response schemas.** These document a 200 with no body schema, so the UI reads them
   defensively (`utils/normalize.ts`) and shows "N/A" for anything missing:
   - `GET /dashboard/members/{memberId}` (personal info, current membership, history, attendance
     summary, 14-day attendance, recent check-ins)
   - `GET /dashboard/memberships` (summary metrics + records)
   - `GET /dashboard/branches`
   - `GET /dashboard/staff`
   - `GET /dashboard/reports`
   - `GET /dashboard/branches/{id}/qr` (image data URL? URL? raw token?)
   - item shapes of `upcomingRenewals[]` and `recentActivities[]` in `/dashboard/overview`
3. **Undefined request schemas.** `POST /dashboard/branches` references
   `#/components/schemas/CreateBranch` and `POST /dashboard/staff` references
   `#/components/schemas/CreateInvitation`, but `components.schemas` is missing from the spec.
   We send the documented bodies of `POST /organizations/{id}/branches` and
   `POST /organizations/{id}/invitations` (`{ email, role }`). Does a staff invite need a `branchId`
   for MANAGER/RECEPTIONIST?
4. **No admin attendance endpoint.** The Attendance screen (daily log with check-in, check-out,
   duration, present/absent, Today / This Week / Custom) has no backing API. The screen currently
   shows overview/report figures plus recent activity. → Need e.g.
   `GET /dashboard/attendance?scope&branchId&startDate&endDate&page&limit` plus summary counts.

### Design features with no endpoint (not rendered)

- Members: Add Member, Edit, Delete. Member details: More, Edit Member, Renew Membership.
- Memberships: edit / delete row actions.
- Branches: Edit Branch; per-branch members, staff and revenue counts on cards.
- Staff: view / edit / remove, Full-time / Part-time type, job titles (Head Trainer, Cleaner …).
  The API only knows org roles.
- Plans: feature bullet lists (the cards show description, duration, grace period and revenue
  instead); listing deactivated plans.
- Notifications bell, export buttons.

### Design vs API mismatches (adapted)

| Design | API | What the app does |
|---|---|---|
| "Today's Check-ins" KPI (Overview) | `monthlyCheckIns` only | Shows "Monthly Check-ins" |
| Growth chart "12 Months" | `growthPeriod` = 7d / 30d / custom | 7 Days / 30 Days / Custom date range |
| Reports "3 / 6 / 12 Months" | `period` = 3 or 6, or start/end | 3 Months / 6 Months / Custom |
| Reports "Retention Rate" | not provided | Shows active members (if returned) |
| Members tabs All / Active / Inactive | ACTIVE / INACTIVE / SUSPENDED | Adds a Suspended tab |
| Memberships tabs incl. "Inactive" | PENDING / ACTIVE / EXPIRED / SUSPENDED / CANCELLED | Tabs follow the API enum |
| "Most Popular" plan badge | not provided | Derived: plan with most active members |
| Staff search, filters | only `page`, `limit` | No search on Staff |

### Smaller questions

- `GET /membership-plans/branch/{id}` returns active plans only. Is there a way to list inactive
  ones (and reactivate)?
- Does `/dashboard/reports` return `activeMembers` / retention? What units are monthly revenue
  labels (e.g. `"2026-09"` or `"Sep"`)?
- The 422 error body format isn't documented. The app reads `message`, then `errors[]`, then
  `validationMessages`.
- Production base URL: the spec says `https://api.hgfitaccess.com`, but `.env.production` points at
  the Render URL until that domain is live.
