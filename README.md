# Submission Tracker

> 🎬 **[Watch the demo video](./demo.mp4)**

A full-stack submission management tool for operations managers to browse, filter, and inspect broker-submitted opportunities. Built with Django REST Framework and Next.js.

---

## Quick Start

```bash
# Terminal 1 — Backend
cd backend
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:3000/submissions**. No `.env.local` needed — the frontend defaults to `http://localhost:8000/api`.

To seed test data: `python manage.py seed_submissions` (use `--force` to rebuild).

---

## What I Built

The scaffold provided data models, serializers, and empty page shells. Everything below is my implementation.

### Backend

**Query Optimization** — Added `select_related("broker", "company", "owner")` to collapse 3N FK lookups into a single JOIN. For the detail endpoint, added `prefetch_related("contacts", "documents", "notes")` — the detail view runs exactly **4 queries total** regardless of data size.

**Filters** — Extended the filter set beyond the required `status`, `broker_id`, and `company_search` to include all bonus filters: `created_from`, `created_to`, `has_documents`, `has_notes`. The boolean filters use annotated counts to stay in SQL rather than pulling data into Python.

**Latest Note Subquery** — Used a correlated `Subquery` to fetch the most recent note author/body/timestamp per submission in the list view. Scales with the database — no N+1 or in-memory slicing.

**Broker Endpoint** — Added `pagination_class = None` to return a flat `Broker[]` array instead of a paginated wrapper, matching the frontend hook's expectations.

**Tests** — 23 tests covering filters (status, broker, company search, has_documents, has_notes, combined), serialization (nested relations, counts, latest note preview), the broker endpoint (flat array, no pagination), and query optimization (`assertNumQueries` verifying 2 queries for list and 4 for detail).

```bash
cd backend && python manage.py test submissions.tests -v2
```

### Frontend

**URL-Driven Filters** — All filter state lives in `useSearchParams()`, not `useState`. Filtered views are bookmarkable, shareable, and survive page refresh. Browser back/forward works correctly. Page number resets to 1 when filters change.

**Submissions Table** — 9-column MUI table (Company, Broker, Owner, Status, Priority, Created, Docs, Notes, Latest Note) with color-coded status and priority chips. Row click navigates to the detail view.

**Pagination** — `TablePagination` synced to URL params. Uses `placeholderData: (prev) => prev` in React Query so the previous page stays visible while the next loads — no blank flashes.

**Loading / Empty / Error States** — Skeleton rows during loading, contextual empty messages (different text when filters are active vs. no data), and an error alert with an inline retry button wired to `refetch()`.

**Detail Page** — Four section components (Summary, Contacts, Documents, Notes), each with self-contained empty state handling. Contacts and documents include actionable `mailto:`, `tel:`, and download links. Notes display in reverse chronological order with preserved whitespace.

**Debounced Search** — `useDebounce(value, 300)` on the company search input. The URL updates on every keystroke but the API call only fires after 300ms of inactivity.

**Caching** — Broker list cached with `staleTime: Infinity` (fetched once per session). Detail views cached for 60 seconds.

---

## Architecture

```
Browser (Next.js :3000)  →  axios GET  →  Django API (:8000/api/)  →  SQLite
         ↑                                        ↓
   React Query cache  ←  camelCase JSON  ←  DRF Serializers
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/submissions/` | Paginated list with nested broker/company/owner, doc/note counts, latest note preview |
| `GET /api/submissions/:id/` | Full detail with contacts, documents, notes |
| `GET /api/brokers/` | Flat broker list for dropdown |

### Filter Params

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Exact match, case-insensitive (`new`, `in_review`, `closed`, `lost`) |
| `broker_id` | number | FK match on broker |
| `company_search` | string | Partial match on company legal name |
| `created_from` | datetime | Range filter (gte) |
| `created_to` | datetime | Range filter (lte) |
| `has_documents` | boolean | Submissions with/without documents |
| `has_notes` | boolean | Submissions with/without notes |

---

## Key Tradeoffs

**Subquery vs. loading all notes in Python** — `Subquery` keeps the latest-note logic in SQL. The alternative (fetching all notes and slicing in Python) would reintroduce N+1 queries or require loading unbounded data into memory.

**`select_related` vs. `prefetch_related`** — `select_related` (SQL JOIN) for single-object FKs (broker, company, owner). `prefetch_related` (batched queries) for one-to-many relations (contacts, documents, notes) where a JOIN would produce a cross product.

**URL state vs. `useState` for filters** — For an ops tool where a manager wants to bookmark "all in-review submissions from Broker X", URL state is the correct default. The added complexity is minimal.

---

## Stretch Goals Implemented

- All bonus backend filters: `created_from`, `created_to`, `has_documents`, `has_notes`
- 23 automated backend tests with query count assertions
- Debounced company search (300ms)
- React Query placeholder data for seamless pagination
- Infinity stale time on broker cache

---

## Files Modified

| File | Changes |
|------|---------|
| `backend/submissions/filters/submission.py` | Added 6 filters (broker_id, company_search, date range, boolean presence) |
| `backend/submissions/views.py` | select_related, prefetch_related, latest note subquery, broker pagination fix |
| `backend/submissions/tests.py` | 23 tests across 4 test classes |
| `frontend/lib/hooks/useSubmissions.ts` | Enabled queries, added page param support |
| `frontend/lib/hooks/useBrokerOptions.ts` | Enabled query, infinity stale time |
| `frontend/app/submissions/page.tsx` | Full list UI with table, filters, pagination, URL sync |
| `frontend/app/submissions/[id]/page.tsx` | Full detail UI with 4 section components |
| `frontend/app/submissions/components/` | SubmissionTable, SubmissionFilters, StatusChip, PriorityChip |
| `frontend/app/submissions/[id]/components/` | SummarySection, ContactsSection, DocumentsSection, NotesSection |
| `frontend/lib/constants.ts` | Color mappings and label formatting |
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.
