# Changes Report

A complete record of changes applied to the project. Grouped by theme so you can scan it.

---

## 1. Authentication & API plumbing

### Bugs fixed
- **`authorization.apis.ts` was completely broken**: no imports, no `register` function, no default export. Rewrote it with proper login + register and an `authApis` default export.
- **Two duplicate auth stores** (`src/store/auth.store.ts` and `src/zustand/auth.store.ts`). Deleted the unused `zustand/` copy. Single store now exposes `{ token, user, setAuth, logout }` with `persist`/`localStorage`.
- **Two duplicate axios instances** (`axios.ts` and `api.instance.ts`). Deleted `axios.ts`. Everything goes through `api.instance.ts`.
- **`App.tsx` referenced `state.loading` and `state.checkAuth`** that didn't exist on the store. Removed dead code; layouts now read `token` directly from the store.
- **`LoginPage.tsx`** simplified — no more dynamic `typeof setAuth === "function"` scaffolding; calls `setAuth(user, accessToken)` directly.

### Session/CORS fix
- Backend uses **session cookies, not JWT** (confirmed by backend commit "implement session-based authentication"). Wired:
  - `api.instance.ts` → `withCredentials: true`, and the interceptor skips attaching a fake Bearer when the token is the session sentinel.
  - `authorization.apis.ts` falls back to a `cookie_session_active` sentinel when no Authorization header is returned, so the route guard knows the user is logged in.
- **Vite proxy**: `vite.config.ts` rewrites cookies to `localhost` (`cookieDomainRewrite` + `cookiePathRewrite`). All API traffic goes through `/api-railway/...` so the browser sees it as same-origin and the `Set-Cookie` lands correctly.
- `constants/domain.ts` → `API_BASE_URL` switched from the Railway URL to `/api-railway/api/v1`.

---

## 2. Each page wired end-to-end

### Colleges (`/colleges`)
- Killed duplicate `ICreateCollegeInput` / `IUpdateCollegeInput` type defs in `Colleges.interfaces.ts`.
- One `ICollegeInput` matching `CollegeRequestDTO` (just `{ name, description }`).
- Dropped manual `URLSearchParams` ceremony in `Colleges.apis.ts` and the defensive `collegeId` stripping.
- Form no longer sends `createdAt` / `updatedAt` — backend manages those.
- ID column removed from the table (you asked for that explicitly).
- Typography overhauled: table headers in muted gray (`#6e6e73`) at 12px regular weight; rows at 15px with semibold name and lighter description. Removed the bright indigo timestamp pills.
- Page heading uses the new 34px / SF Pro Display / weight 600 / tight tracking.
- Action buttons (edit/delete) use a single hover-tinted style — no more conflicting green/red base colors.

### Campaigns (`/campaigns`)
- **Required-field fix**: backend's `CampaignRequestDTO` requires `status` and `proposedBy`. The form was silently dropping them.
  - `proposedBy` now pulled from auth store.
  - `status` defaults to `"PENDING"` on create; preserved from the existing campaign on edit.
- Pagination index bug: `pageIndex: 1` → `0` (Spring is 0-indexed).
- Response unwrap: `response.data` → `response.content` (Spring Page shape).
- Full shape mapping: backend's `campaignId / startDate / endDate / maxVolunteers / category` → frontend's `id / start_date / end_date / max_volunteers / categoryId`. Same in reverse for create.
- Mutation hooks: `useAddCampaign`, `useUpdateCampaign`, `useDeleteCampaign` — all invalidate `["campaigns"]` so the list refetches automatically.
- Component: edit / delete buttons added per row.
- Per-campaign progress: new **Activity icon** in row actions opens a modal showing latest %, history, and a form to log a new entry. (Backend only supports `POST` on progress, no `PUT`/`DELETE`, so the modal appends rather than edits.)
- Search input wired (client-side filter by title / location / status).
- Broken "Filters" placeholder button removed.

### Applications (`/applications`)
- Cherry-picked from the `aya` branch:
  - `API/Application/Application.apis.ts` + `Application.interfaces.ts`
  - The full `ApplicationStatus.tsx` (705 lines)
- Fixed `Application.apis.ts` import from the deleted `../axios` to `../api.instance`.
- Form rewired: `Student ID` / `Campaign ID` raw-number inputs replaced with **dropdowns** sourced from `/users` and `/campaigns`. Submits IDs to the backend but shows names to the user.

### Attendance (`/attendance`)
- Removed broken `TAutoComplete` import in `Attendance.interfaces.ts` pointing at a non-existent module.
- **Dropped `updateAttendance`** — backend has no `PUT` endpoint for it.
- `createAttendance` now auto-injects `recordedBy` from the auth store (was hardcoded `2`).
- Added a **campaign selector dropdown** at the top of the page (was hardcoded to campaign 1).
- Student dropdown now sourced from `/users` (new `Users.apis.ts`) — was a hardcoded `staticStudents` list.
- Status enum extended with `EXCUSED`.
- `latestProgress` default changed from a fake `"35%"` to `"0%"`.
- Cleaner unwrap: `data.content` only — no more 3-fallback defensive chain.
- Hides student ID (`#123`) under the name in the table — only the name shows now.
- The "Log Progress" button + modal you added then asked to remove — moved to Campaigns page.

### Reports (`/reports`)
- Null guards on `avgAttendance`, `studentsPerCollege`, and `applicationStatusCounts` so the page renders even with partial data.
- "Refresh Data" button removed.
- Pie / bar chart colors restored to a real palette (green/orange/red for status, mixed Apple-system colors for college bars) instead of a single-blue scale.

### Dashboard (`/dashboard`)
- Cherry-picked from `aya`:
  - `API/Dasgboard/Dashboard.apis.ts` + interfaces
  - `pages/Dashboard.tsx` (rewritten to fetch real data; old version had hardcoded chart values).
- Rewrote `Dashboard.apis.ts` to use the backend's `/dashboard/stats` endpoint directly (1 call instead of 7 parallel `/applications?status=X` calls — much faster).
- Fixed `/students` (doesn't exist) → `/users`.
- Fixed response shape access — `.content` instead of `.data` everywhere.
- "Attendance Insights" chart now shows one bar per campaign (latest progress %) instead of one campaign's history.
- Chart container `h-75` → `h-72` (h-75 isn't a real Tailwind class, was producing 0-height).
- "Create New Campaign" button wired to `navigate("/campaigns")`.
- Removed placeholder `<Navbar />` from the page (it literally rendered the text "Navbar"). Deleted the `Navbar.tsx` file entirely.

---

## 3. Apple-style visual redesign (token-level)

### Tokens added in `index.css`
- Color variables: action blue, parchment, ink, hairlines, muted text.
- Font stack: `SF Pro Display` (headings) / `SF Pro Text` (body) with `system-ui`/Inter fallback.
- Base body size: **17px** (was 14–15px in most places).
- Global negative letter-spacing for the "Apple tight" feel.
- Global `cursor: pointer` on buttons (Tailwind v4 dropped the default).

### Color swap (77+ occurrences across the codebase)
- `#5D3FD3` → `#0066cc` (Action Blue)
- `#4C32B3` → `#004999` (darker variant)
- `#F8FAFC` / `#F9F9FB` / `#F5F3FF` → `#f5f5f7` (Apple parchment)
- Pie/chart purples/cyans (`#8B5CF6`, `#22D3EE`, `#F472B6`, etc.) initially blanded to grays, then **restored to a real multi-color palette** (green / orange / red / purple / cyan) per your follow-up request.

### Shape & typography
- Auth submit + main CTAs → `rounded-full` (the Apple pill grammar).
- Sidebar restyled: pill-shaped active state, blue tint, smaller icons, no purple bar. Routes fixed (was `/` and `/users` linking nowhere; now `/dashboard` and `/students` matching the actual routes).
- Sidebar now **edge-to-edge full-height** (no floating-island look). Layout padding removed from `ProtectedLayout`.

---

## 4. Branch consolidation (`aya` cherry-pick)

Brought over from `origin/aya`:
- `API/Application/` (verbatim, fixed one import)
- `API/Dasgboard/` (rewrote `Dashboard.apis.ts` to match fix-bugs's actual shapes)
- `components/dashboard/ApplicationStatus.tsx` (verbatim)
- `pages/Dashboard.tsx` (verbatim)

**Did not pull**: `RecentApplications.tsx` / `TopVolunteers.tsx` (placeholder components), `App.tsx`, auth files, `axios.ts`, Campaign/College/Attendance/Reports (fix-bugs versions are better).

---

## 5. Smaller fixes

- Cursor on buttons restored globally.
- Dashboard loads faster (one API call for stats, not seven).
- Hidden student ID in attendance table (only name).
- Hidden college ID in Colleges table.
- Removed broken "Filters" button on Campaigns.

---

## Documentation produced

- **`DESIGN.md`** — element inventory: every page, every button, every modal, every shared component. Lists what the new design should contain without colors/fonts.
- **`CHANGES.md`** — this file.

---

## Known limitations (need backend work)

- No edit/delete on attendance — backend exposes only `POST` and `GET`.
- No edit/delete on progress — same.
- Campaign list doesn't return `current_volunteers`, `actual_progress`, or `photos` — those columns show 0/empty until the backend exposes them.
- Categories page doesn't exist yet — the Campaign create form still hardcodes Environment/Education/Health. Backend has `/categories`, ready when you want to wire it.
- `/applications` 401s if you log in *before* the proxy fix lands — old cookie was set against the Railway domain. Fresh login through the proxy fixes it.

---

## Files most heavily touched

```
src/index.css
src/App.tsx
src/constants/domain.ts
src/store/auth.store.ts                            (rewritten)
src/API/api.instance.ts
src/API/axios.ts                                   (deleted)
src/API/Authorization/authorization.apis.ts        (rewritten)
src/API/Application/                               (new from aya)
src/API/Campaingns/Campaign.apis.ts                (rewritten + mapper)
src/API/Campaingns/Campaingnqueries.ts             (rewritten)
src/API/Colleges/Colleges.apis.ts                  (rewritten)
src/API/Colleges/Colleges.interfaces.ts            (rewritten)
src/API/Colleges/Collegesqueries.ts                (rewritten)
src/API/Attendance/Attendance.apis.ts              (rewritten)
src/API/Attendance/Attendance.interfaces.ts        (rewritten)
src/API/Attendance/Attendancequeries.ts            (rewritten)
src/API/Dasgboard/                                 (new from aya, rewritten apis)
src/API/Users/Users.apis.ts                        (new)
src/components/auth/LoginPage.tsx
src/components/auth/RegisterPage.tsx
src/components/dashboard/CampaignManagement.tsx
src/components/dashboard/Colleges.tsx
src/components/dashboard/AttendanceProgress.tsx
src/components/dashboard/ApplicationStatus.tsx     (from aya)
src/components/dashboard/Reports.tsx
src/components/layout/Sidebar.tsx
src/components/layout/Navbar.tsx                   (deleted)
src/pages/Dashboard.tsx                            (replaced from aya)
src/zustand/auth.store.ts                          (deleted)
```
