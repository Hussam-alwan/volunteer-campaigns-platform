# Volunteer Campaigns Platform — Element Inventory

A list of every page, every button, and every sidebar element the new design needs. No styling — just what to put on the screens. Every page maps to a real backend endpoint (from `apidocs.json`). Don't add screens for features the API doesn't support — those are called out at the bottom.

---

## App shell

Every authenticated page has:

- **Sidebar** (left, persistent)
- **Topbar** (top of content area, persistent)
- **Content area** (the page itself)

### Sidebar

**Top section**
- Logo + product name ("Volunteer")

**Nav items** (in this order)

- Dashboard → `/dashboard`
- Campaigns → `/campaigns`
- Applications → `/applications`
- Attendance → `/attendance`
- Students → `/students`
- Colleges → `/colleges`
- Categories → `/categories`
- Reports → `/reports`

**Bottom section**
- Current user avatar + name (clicks to `/profile` — future)
- Log Out button → opens confirmation modal

> Fix existing mismatch: sidebar currently links `Dashboard → "/"` and `Users → "/users"`, but the actual routes are `/dashboard` and `/students`. Pick one set.

### Topbar

- Global search input (placeholder for now)
- Notifications icon (bell)
- Messages icon
- User avatar + name
- Settings / kebab menu

---

## Pages

### 1. Login (`/login`) — public

**Elements**
- Logo + tagline
- Email input
- Password input
- Error banner (only on failure)

**Buttons**
- "Sign In" (submit)
- "Create an account" (link → `/register`)

### 2. Register (`/register`) — public

**Elements**
- Logo + tagline
- Form fields: first name, last name, student ID, phone, email, password, academic year (1–5 dropdown), college (dropdown sourced from `/colleges`)
- Error banner (only on failure)

**Buttons**
- "Sign Up" (submit)
- "Sign In" (link → `/login`)

### 3. Dashboard (`/dashboard`)

**Elements**
- Greeting row: "Welcome back, {firstName}" + today's date
- 4 stat tiles: Total Students · Active Campaigns · Colleges · Avg Attendance %
- Bar chart: Students per College
- Pie chart: Application Status (Approved / Pending / Rejected)

**Buttons**
- "Refresh" (top-right, icon)

### 4. Campaigns (`/campaigns`)

**Elements**
- Page title + subtitle
- 3 stat tiles: Total · Ongoing · Pending Approval
- Search input
- Status filter chips: All / Pending / Approved / Ongoing / Completed / Rejected / Cancelled
- Category filter dropdown
- Campaigns table — columns: Campaign (title + location + dates), Category, Volunteers (X/Y + bar), Progress %, Status pill, Actions
- Pagination footer

**Buttons (page-level)**
- "Create New Campaign" (primary, top-right)

**Buttons (per row)**
- Manage photos → opens photo gallery modal
- Edit → opens campaign form modal in edit mode
- Delete → opens confirmation modal

**Modal: Create / Edit Campaign**
- Header with title that switches between "Create New Campaign" and "Edit Campaign"
- Fields: title, description, location, category, max volunteers, start date, end date
- "Cancel" button
- "Confirm & Create" / "Save Changes" button

**Modal: Manage Photos**
- "Upload Local Files" area (multi-file input)
- "Add Photo via URL" input + "Add" button
- Grid of existing photos, each with a delete button on hover

**Modal: Delete Confirmation**
- "Cancel" button
- "Delete" button

### 5. Applications (`/applications`)

**Elements**
- Page title + subtitle
- Tabs: All / Pending / Approved / Rejected / Withdrawn
- Applications table — columns: Student (name + ID), Campaign (title), Applied At, Status, Actions
- Pagination footer

**Buttons (per row)**
- Approve
- Reject
- Remove

### 6. Attendance (`/attendance`)

**Elements**
- Page title + subtitle
- Campaign selector dropdown (top-right)
- 3 stat tiles: Total Volunteer Hours · Latest Progress % · Active Volunteers
- Search input (by student name/ID)
- Attendance table — columns: Student (name + ID), Date, Hours, Status pill, Notes
- Pagination footer

**Buttons (page-level)**
- "Log Attendance" (primary)

**Modal: Log Attendance**
- Student dropdown (from `/users`)
- Status dropdown (PRESENT / ABSENT / LATE / EXCUSED)
- Hours input
- Date picker
- Notes input
- "Cancel" button
- "Save Record" button

> No edit/delete on attendance rows — backend doesn't support it.

### 7. Students (`/students`)

**Elements**
- Page title + subtitle
- Search input
- Filter dropdowns: college, academic year
- Students table — columns: Name, Student # / Email, College, Academic Year, Total Hours, Status (active / banned), Actions
- Pagination footer

**Buttons (per row)**
- View detail → opens side panel or profile modal
- Ban / Unban (toggle, with confirmation)

**Side panel / modal: Student Profile**
- Profile info (name, email, phone, student #, college, academic year)
- Applications list for this student
- Attendance history
- Total hours

### 8. Colleges (`/colleges`)

**Elements**
- Page title + subtitle
- Search input
- Colleges table — columns: ID, Name, Description, Created At, Updated At, Actions
- Pagination footer

**Buttons (page-level)**
- "Add New College" (primary)

**Buttons (per row)**
- Edit → opens form modal
- Delete → opens confirmation modal

**Modal: Create / Edit College**
- Header switches between "Add New College" and "Modify College Details"
- Fields: name, description
- Edit mode shows readonly "Created At" and "Last Updated" pills
- "Cancel" button
- "Confirm & Save" / "Save Changes" button

### 9. Categories (`/categories`)

**Elements**
- Page title + subtitle
- Search input
- Categories table — columns: ID, Name, Description, Created At, Updated At, Actions
- Pagination footer

**Buttons (page-level)**
- "Add New Category" (primary)

**Buttons (per row)**
- Edit
- Delete

**Modal: Create / Edit Category**
- Fields: name, description
- "Cancel" / "Save" buttons

### 10. Reports (`/reports`)

**Elements**
- Page title + subtitle
- 4 stat tiles: Total Students · Active Campaigns · Colleges · Avg Attendance %
- Bar chart: Students per College
- Pie chart: Application Status distribution

**Buttons**
- "Refresh Data" (primary, top-right)

### 11. Profile (`/profile`) — future

**Elements** (when added)
- User info (name, email, phone, etc.)
- Change password form
- Logout

---

## Shared elements

These show up on multiple pages — define them once.

### Button types

- **Primary** — page-level CTA (Create, Save, Submit)
- **Secondary** — Cancel, back, low-priority actions
- **Ghost / Icon** — table-row actions, toolbar buttons
- **Danger** — destructive confirmation buttons inside modals

### Table

- Header row with column labels
- Body rows with row-hover affordance
- Per-row action icons (right-aligned)
- Empty state row ("No records found")
- Loading state (skeleton rows)
- Pagination footer: page size selector, prev/next, page indicator

### Modal

- Header (title + close `X` button)
- Body (form or content)
- Footer (Cancel left + Confirm right)
- Backdrop click closes (except destructive confirm modals)

### Confirmation modal

- Icon
- Title ("Delete this X?")
- Body text ("This action cannot be undone.")
- "Cancel" button
- Destructive action button ("Delete", "Ban", "Logout")

### Form fields

- Label
- Input (text / number / date / select / textarea)
- Helper text (optional)
- Error text (when invalid)

### Status pill

Used in tables. Variants:
- Pending (yellow/orange)
- Approved / Present / Ongoing (green)
- Rejected / Absent (red)
- Late (amber)
- Excused / Draft (slate)
- Completed (purple/blue)
- Cancelled / Withdrawn (rose/gray)

### Toast / notification

- Success
- Error
- Info

Top-right, auto-dismiss after a few seconds. Used for quick confirmations after an action (e.g. "Application approved").

### Empty state

- Icon
- Heading
- Supporting line
- Optional CTA button

### Error state

- Icon
- "Failed to load X"
- "Try Again" button

### Loading state

- Page-level spinner (rare — only on initial load)
- Inline skeletons (preferred for tables)
- In-button spinner (during submit)

---

## Cross-cutting decisions to make

1. **Route naming**: Align sidebar links with actual routes (`/dashboard` not `/`, `/students` not `/users`).
2. **Roles / permissions**: Should non-admin users see admin actions (approve application, delete campaign, ban user)? If yes, hide or show based on role.
3. **Pagination behavior**: One standard pager component used everywhere.
4. **Confirmation pattern**: Decide which actions use a full modal vs a toast confirmation.
5. **Mobile**: In or out of scope?

---

## Features the backend doesn't support yet

Don't design these for v1 — they need backend work first.

- Edit or delete an existing attendance record
- Edit or delete an existing progress entry
- `current_volunteers` and `actual_progress` on the campaign list (today must be derived per-campaign — expensive)
- Notifications / activity feed
- User profile editing (no PUT endpoint on `/users/{id}` for self)
- Global search (no search endpoint)
- Messaging / inbox
