# CozyStay — Project History

## Session 1 — Initial Implementation (2026-07-30)

### Context
- Full-stack P2P property rental platform (Airbnb-like)
- Tech stack: React 18 + TypeScript (Vite), Node.js + Express, MongoDB (Mongoose), JWT auth
- 3 user roles: **guest**, **host**, **admin**

### What was built

**Backend (Express + TypeScript + Mongoose):**
- `server/src/models/` — User, Property, Booking, Review schemas
  - User: name, email, hashed password, role (guest|host|admin), profilePhoto
  - Property: host ref, title, description, pricePerNight, location, photos[], amenities[], isActive (soft delete)
  - Booking: property ref, guest ref, startDate, endDate, status (pending|confirmed|declined)
- `server/src/middleware/auth.ts` — `protect` (JWT verify) + `authorize(...roles)` (role check)
- `server/src/routes/auth.ts` — register, login, get-me
- `server/src/routes/properties.ts` — full CRUD with search/filter, ownership guard, active-booking delete protection
- `server/src/routes/bookings.ts` — create (date overlap check), my bookings, host requests, accept/decline
- `server/src/routes/users.ts` — admin CRUD on all users
- `server/src/routes/admin.ts` — stats, list all listings/bookings, admin deactivate/delete

**Frontend (Vite + React + TypeScript):**
- `client/src/context/AuthContext.tsx` — auth state, token in localStorage, auto-restore on reload
- `client/src/api/index.ts` — Axios instance with Bearer token interceptor + 401 auto-redirect
- Components: Navbar, ProtectedRoute (role-gated), PropertyCard
- 11 pages: Home (search + grid), Login, Register (with role picker), ListingDetail (booking form), CreateListing, EditListing, MyBookings, HostDashboard (manage listings + booking requests), AdminDashboard (tabs: stats/users/listings/bookings with inline edit/delete), NotFound
- Plain CSS styling (no MUI yet)

### Decisions made
- PLACEHOLDER: Photos are URL-based (no Multer file upload implemented yet)
- Admin has full CRUD over users, listings, and bookings (extended from README)
- Booking overlap uses `$lt`/`$gt` on confirmed bookings
- `.env` is gitignored; friends share the same MongoDB Atlas connection string

### Database
- MongoDB Atlas free M0 cluster (512MB)
- Network: Allow All (`0.0.0.0/0`) for dev

### Commands to run
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

---

## Session 2 — Plan Review & TODO Creation (2026-07-30)

### What was discussed
- Reviewed PLAN.md against current implementation
- PLAN.md specifies MUI, Zod, Multer upload, and different route naming — gaps identified
- Mock payment is in PLAN's "Concerns" section but contradicts README's non-goals; deferred to future
- Admin is listed as nice-to-have in PLAN but already implemented (full CRUD)

### New requirements added
1. **Google OAuth** — Sign in with Google to verify real users (reduces fake accounts)
2. **Image & Video upload/rendering** — Replace URL-based photos with real file upload (Multer), support mp4/video rendering
3. **Notification system** — In-app notifications for booking requests, accept/decline events, with bell icon + badge
4. **Mock payment** — Deferred to future

### Files created
- `TODO.md` — comprehensive task list with done/up-next/future sections

### Key decisions
- MUI migration is lower priority than OAuth, uploads, and notifications
- Google OAuth uses passport-google-oauth20
- Notifications are polling-based (not WebSocket, per README non-goals)
- Each new feature gets a dedicated acceptance criteria in TODO.md

### Files created this session
- `TODO.md` — comprehensive task list with done/up-next/future sections

---

## Session 3 — TODO Enrichment from PLAN.md + FEATURES.md (2026-07-30)

### What was done
- Cross-referenced PLAN.md milestones against current implementation — found gaps in Polish (skeletons, toasts, responsive, min_price)
- Cross-referenced FEATURES.md (Flask+MySQL reference) against our TODO — extracted applicable tasks for Express+MongoDB stack
- Identified items from FEATURES.md NOT in TODO and added them
- Removed payment model prep (user will handle migration later)
- Committed TODO.md updates

### Items added from FEATURES.md to TODO:
- **Admin Flagging/Reporting** — `flagged` + `flag_reason` on Property, admin flag/unflag endpoints, auto-deactivate on flag
- **Rating Aggregation** — `avgRating` + `reviewCount` on Property model (prep for reviews feature)
- **min_price search** — add to Polish section (backend + frontend filter)
- **Availability Calendar Enhancements** — `/available-dates` endpoint, overlap check extended to include `unavailable_dates`
- **Rate Limiting & Security** — `express-rate-limit`, auth throttle, security headers (added to Future)

### Items removed per user instruction
- Payment Model Prep (migration done later by user)

### Key decisions
- Moved from Aiven Cloud MySQL to local MySQL server
- Updated DATABASE_URL to `mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/cozystay`
- Removed SSL/ca.pem from config.py for local dev
- .env.example updated with placeholder credentials
- User needs to: create `cozystay` database in local MySQL, set root password, update .env

---

## Session 4 — Database Setup, Bug Fixes, Google OAuth, Image Rendering (2026-07-30)

### What was done
1. **Switched to local MySQL** — Updated `.env` with local MySQL credentials, removed Aiven Cloud/SSL config
2. **Created database schema** — `server/schema.sql` with CREATE TABLE statements for MySQL Workbench
3. **Created seed script** — `server/seed.py` with 5 users, 5 properties, 7 bookings, 2 reviews
4. **Fixed MongoDB `_id` → SQL `id` mismatch** — All frontend components were using `_id` (MongoDB convention) but Flask/SQL returns `id`
5. **Fixed camelCase → snake_case mismatch** — Frontend was sending `pricePerNight`, `startDate`, etc. but backend expects `price_per_night`, `start_date`, etc.
6. **Fixed property 404 bug** — Property links now correctly use `property.id` instead of `property._id`
7. **Implemented Google OAuth skeleton**:
   - Backend: `POST /api/auth/google` verifies token via Google's tokeninfo endpoint, creates/finds user
   - Frontend: Google Sign-In button on both Login and Register pages
   - Config: `GOOGLE_CLIENT_ID` in `.env` (placeholder — user must set real ID)
8. **Image rendering improvements**:
   - Added live thumbnail preview when pasting photo URLs in Create/Edit listing forms
   - Added broken image fallback (SVG placeholder) on PropertyCard and ListingDetail
   - Responsive CSS grid gallery on ListingDetail
9. **Updated dependencies** — Added `google-auth`, `requests` to `requirements.txt`; installed `@react-oauth/google` on frontend

### Files created
- `server/schema.sql` — MySQL CREATE TABLE statements
- `server/seed.py` — Database seed script
- `SETUP.md` — Local setup guide
- `client/src/vite-env.d.ts` — Vite type declarations

### Key decisions
- Google OAuth uses token verification approach (frontend gets credential → backend verifies via Google API) instead of redirect flow
- Photos remain URL-based (users paste links); image preview shows thumbnails as URLs are entered
- All frontend field names now match backend snake_case convention instead of using a camelCase transformer
