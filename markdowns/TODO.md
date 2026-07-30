# CozyStay — TODO

---

## Legend

| Icon | Meaning |
|---|---|
| ✅ | Done |
| 🔜 | In progress |
| ⬜ | Not started |
| 🔮 | Future (deferred) |

---

## ✅ Done — MVP Core

### Auth
- ✅ Email + password signup (bcrypt hashed)
- ✅ Login with JWT
- ✅ JWT stored in localStorage, auto-attached via Axios interceptor
- ✅ AuthContext with auto-restore on page reload
- ✅ Protected route wrapper (role-gated)
- ✅ 3 roles: guest, host, admin
- ✅ Logout clears token + redirects

### Listings
- ✅ Create listing (title, description, price, location, photos as URLs)
- ✅ View single listing detail (populated with host name)
- ✅ Edit listing (owner-only guard)
- ✅ Soft-delete listing (isActive flag, warns on active bookings)
- ✅ Browse all active listings
- ✅ Search/filter by location and max price

### Bookings
- ✅ Request booking with date range
- ✅ End-date-after-start-date validation
- ✅ Overlap detection against confirmed bookings
- ✅ Status: pending → confirmed / declined
- ✅ Host dashboard: view booking requests + accept/decline
- ✅ Guest: view booking history

### Admin
- ✅ Stats dashboard (total users, listings, bookings)
- ✅ CRUD on all users (edit role, name, email, delete)
- ✅ View all listings (deactivate any)
- ✅ View all bookings (delete any)

### Tech
- ✅ React 18 + TypeScript + Vite
- ✅ Express + TypeScript + Mongoose
- ✅ MongoDB Atlas free cluster
- ✅ Project structure (client/ + server/)
- ✅ .gitignore (excludes node_modules, .env, dist, uploads)
- ✅ All dependencies installed
- ✅ `server/.env-example` for new devs to copy

---

## ✅ Recently Completed

### 1. Google OAuth Authentication (Skeleton)

**Status:** Backend + frontend code implemented. User needs to provide their Google Client ID.

**Tasks:**
- [x] Install `google-auth` on backend
- [x] Implement `POST /api/auth/google` route — verifies token, creates/finds user, returns JWT
- [x] Add "Sign in with Google" button on Login and Register pages
- [x] `GOOGLE_CLIENT_ID` config in `.env` (placeholder)

### 2. Image Preview & Fallback ✓

**Status:** URL-based image entry now shows live preview thumbnails. Broken images show SVG placeholder.

**Tasks:**
- [x] Live thumbnail preview when pasting photo URLs in Create/Edit listing forms
- [x] Broken image fallback (SVG placeholder) on PropertyCard and ListingDetail
- [x] Responsive CSS grid gallery on ListingDetail

---

## ⬜ Up Next — Priority Order

### 1. Image & Video Upload (File Upload)

**Why:** Currently photos are URL-based (user pastes links). Users should upload real files (images + videos).

**Tasks:**
- [ ] Configure file upload on Flask backend (`app/routes/upload.py`)
  - [ ] Accept image types: jpg, png, webp, gif
  - [ ] Accept video types: mp4, webm, mov
  - [ ] File size limits (e.g. 10MB per file)
  - [ ] Store in `server/uploads/` with unique filenames
- [ ] Create `POST /api/upload` route — accepts multipart/form-data, returns file URL
- [ ] Serve `/uploads` statically (Vite proxy already set up: `/uploads` → `localhost:5000`)
- [ ] Update CreateListing page: file input (accept images + videos), preview before submit, upload to `/api/upload`, store returned URLs
- [ ] Update EditListing page: same file upload flow
- [ ] Update ListingDetail page: render videos with `<video>` controls
- [ ] Update PropertyCard: show first image or video thumbnail

**Acceptance:** Host can upload jpg/png/mp4 files from their computer; they appear on the listing page as images (rendered in `<img>`) or videos (playable in `<video>`).

---

### 3. Notification System

**Why:** Users need to know when something happens (booking accepted, new request, etc.) without manually refreshing.

**Tasks:**
- [ ] Create `Notification` Mongoose model:
  ```
  {
    user: ObjectId (ref: User, required),
    type: String (enum: "booking_request" | "booking_accepted" | "booking_declined" | "new_message" etc.),
    message: String,
    relatedBooking: ObjectId (ref: Booking, optional),
    relatedProperty: ObjectId (ref: Property, optional),
    isRead: Boolean (default: false),
    createdAt: Date
  }
  ```
- [ ] Backend: Create notifications on key events:
  - [ ] Guest books → notify host ("New booking request from [guest]")
  - [ ] Host accepts → notify guest ("Your booking at [property] is confirmed")
  - [ ] Host declines → notify guest ("Your booking at [property] was declined")
- [ ] Create `GET /api/notifications` — list user's notifications (newest first, paginated)
- [ ] Create `PUT /api/notifications/:id/read` — mark as read
- [ ] Create `PUT /api/notifications/read-all` — mark all as read
- [ ] Create `GET /api/notifications/unread-count` — badge count
- [ ] Frontend: Notification bell icon in Navbar with unread badge (MUI `<Badge>` if using MUI, or custom CSS)
- [ ] Frontend: Notification dropdown/popover listing recent notifications
- [ ] Frontend: Toast (Snackbar) on new notification (poll every 30s or use the response from API calls)
- [ ] Frontend: Notification page (`/notifications`) for full history

**Acceptance:** When a guest books, the host sees a notification bell badge update. When host accepts, guest gets a notification. Marking read removes the badge.

---

## ⬜ Polish & Edge Cases (from PLAN.md Milestone 5)

- [ ] Consistent error response shape on backend (`{ error: message }`)
- [ ] Loading skeletons / spinners during API calls (instead of plain "Loading..." text)
- [ ] Success/error toast notifications (Snackbar-style) on booking, edit, delete actions
- [ ] Responsive grid layout (mobile-friendly)
- [ ] `min_price` search param on `/api/properties` — filter listings with price >= min_price (frontend: add min price input next to max price)

---

### 7. Availability Calendar Enhancements (from FEATURES.md B2)

**Why:** The overlap check should also exclude dates on the host's blocked/unavailable list. The guest booking flow should also show available dates.

**Tasks:**
- [ ] `GET /api/properties/:id/available-dates` — returns `unavailable_dates` array plus confirmed booking ranges, optionally computes next 90 days of availability
- [ ] Extend booking overlap check (`POST /api/bookings`) — also check that `start_date` and `end_date` don't fall on any date in `property.unavailable_dates` (409 if blocked)
- [ ] Frontend: DatePicker on BookingForm should disable blocked/unavailable dates

**Acceptance:** Guest cannot book dates the host has manually blocked; host can see and manage blocked dates.

### 4. Admin Flagging / Reporting (from FEATURES.md B4)

**Why:** Guests can flag inappropriate listings; admin reviews flagged content in dashboard.

**Tasks:**
- [ ] Add `flagged: Boolean (default: false)` and `flag_reason: String` to Property model
- [ ] Create `POST /api/admin/flag/:id` — admin sets `flagged = true`, `flag_reason = reason`
- [ ] Create `POST /api/admin/unflag/:id` — admin clears flag
- [ ] Update AdminDashboard: show `flagged` status column; clicking a flagged listing shows reason + flag/unflag buttons
- [ ] Auto-deactivate flagged listings (`isActive = false`) when flagged

**Acceptance:** Admin can flag/unflag any listing from dashboard; flagged listings are deactivated and visible in admin table.

---

### 6. Rating Aggregation (from FEATURES.md A1)

**Why:** When reviews are wired up, Property needs cached `avg_rating` and `review_count` so the listing page doesn't recompute on every view.

**Tasks:**
- [ ] Add `avgRating: Float (default: 0)` and `reviewCount: Integer (default: 0)` to Property model
- [ ] Update these fields whenever a new review is created

**Acceptance:** Each property shows its average rating and review count on the listing card and detail page.

### MUI Migration
- Replace plain CSS with MUI components: `<AppBar>`, `<TextField>`, `<Button>`, `<Card>`, `<Grid>`, `<Chip>`, `<Dialog>`, `<DatePicker>`, `<Snackbar>`, `<Avatar>`, `<CircularProgress>`, `<DataGrid>`, etc.
- Install `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@mui/x-date-pickers`, `@mui/x-data-grid`
- Wrap app with `<ThemeProvider>` + `<CssBaseline>`
- Per PLAN.md Section 5 (Milestone 5): MUI `<Grid>` with `xs sm md lg` breakpoints, `<Snackbar>` + `<Alert>` toasts, `<CircularProgress>`/`<Skeleton>` for loading

### Zod Validation (shared)
- Create `shared/` directory with Zod schemas for all API inputs
- Use on both frontend (form validation) and backend (request validation middleware)
- MUI `<TextField error>` + `<FormHelperText>` for inline error display

### Testing
- Vitest for unit tests (validation logic, booking overlap detection, utility functions)
- Integration tests with `mongodb-memory-server`
- Playwright for E2E: signup → create listing → search → book → accept

### Nice-to-Haves (from README + PLAN.md Milestone 6)
- **Reviews & Ratings** — Review model exists; wire up `POST /api/reviews` (only after stay completed + status confirmed), display avg rating on listing
- **Amenity Filters** — Model has `amenities[]`; expose filter checkboxes on Home page with AND logic (`?amenities=wifi,parking`)
- **Availability Calendar** — `unavailableDates[]` on Property model exists; host UI to mark dates; booking excludes them
- **In-App Messaging** — Message model, conversation view, store-and-refresh (no WebSocket)
- **Profile Photos** — Upload endpoint + display on profile + listing detail host avatar
- **Admin Moderation** — Already done (full CRUD on users, listings, bookings)

### Trust & Credibility Mechanisms (from PLAN.md Concerns §2)
- **Email verification** — Send confirmation link on signup; badge for unverified
- **Verification badge** — "Email verified" / "ID verified" flag on User model, display on profile
- **Listing history** — Show host's member since, total listings, response rate
- **Reporting / flagging** — Guest can flag a listing; admin reviews and removes

### Mock Payment Service
- Deferred per user instruction (contradicts README non-goals)
- If revisited: `POST /api/mock-payment` validates `4242 4242 4242 4242` and returns mock transaction ID. Add payment step after host accepts booking.

---

## Known Issues / Technical Debt

- [ ] Photos are URL-based (no upload yet) — being addressed in item 2
- [ ] No input validation library (Zod) — low priority
- [ ] Plain CSS (no MUI theme system) — low priority
- [ ] No pagination on listings or bookings
- [ ] No email verification flow
- [ ] Server error responses could be more consistent
- [ ] All API calls on page load (no React Query/SWR caching)
- [ ] No responsive grid breakpoints for mobile
- [ ] No loading skeletons / spinners (plain text only)
- [ ] No toast/snackbar notifications for success/error feedback
- [ ] Delete confirmation uses browser `confirm()` instead of a proper modal
