# CozyStay — Backend Feature Division

> **2 people, both on backend (Node.js + Express + MongoDB).**
>
> Work is split by domain so each person owns independent feature sets with minimal file conflicts.
>
> 🔴 **Backend Dev A** — Core API, Bookings, Payments, Reviews, Validation
> 🔵 **Backend Dev B** — Extended Features: Messaging, Calendar, Photos, Admin, Polish

---

## Current State (Already Built)

The following is **already implemented** in `server/`. Both devs should read these files before starting.

| File | Status |
|---|---|
| `server/src/config/db.ts` | ✅ MongoDB connection |
| `server/src/index.ts` | ✅ Express app, CORS, all routes registered |
| `server/src/types/index.ts` | ✅ TypeScript types (AuthPayload, AuthRequest, UserRole, BookingStatus) |
| `server/src/middleware/auth.ts` | ✅ JWT `protect` + role-based `authorize` middleware |
| `server/src/models/User.ts` | ✅ User schema with bcrypt password hashing, `profilePhoto` field |
| `server/src/models/Property.ts` | ✅ Property schema with `amenities`, `unavailableDates`, `isActive` fields |
| `server/src/models/Booking.ts` | ✅ Booking schema with `status` enum, compound index on dates |
| `server/src/models/Review.ts` | ✅ Review schema (model only — **no routes yet**) |
| `server/src/routes/auth.ts` | ✅ Register, Login, Get Me |
| `server/src/routes/properties.ts` | ✅ CRUD + search/filter (location, maxPrice, amenities) |
| `server/src/routes/bookings.ts` | ✅ Create, My Bookings, Host Requests, Respond (accept/decline) |
| `server/src/routes/admin.ts` | ✅ Admin stats, list all listings/bookings, delete |
| `server/src/routes/users.ts` | ✅ Admin user management (list, get, update, delete) |

---

## Backend Dev A — Core API & Transactions

### Files you own
```
server/src/routes/reviews.ts     (new)
server/src/routes/payments.ts    (new)
server/src/middleware/validate.ts (new)
server/src/lib/validations.ts    (new)
server/src/lib/bookingOverlap.ts (new)
```

### A1: Reviews API (Nice-to-have #10)

**Goal:** Guests leave reviews after completed stays. Ratings display on listings.

**Review model already exists** — you only need routes.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| A1.1 | Create review | `POST /api/reviews` | Body: `bookingId, rating (1-5), text (optional)`. Find booking. Verify: belongs to caller, `endDate` passed, status is `"paid"`. Check no existing review for this booking. Create review. Update property's `avgRating` and `reviewCount` (aggregate all reviews for that property). | Not your booking → 403. Too early (endDate not passed) → 400. Duplicate review → 409. |
| A1.2 | Get listing reviews | `GET /api/reviews/:propertyId` | Find all reviews where `property = propertyId`. Populate guest name. Sort by `createdAt` desc. Return array + `{ avgRating, reviewCount }`. | Invalid propertyId → 400. |
| A1.3 | Update Property model | Modify `server/src/models/Property.ts` | Add fields: `avgRating: Number (default: 0)`, `reviewCount: Number (default: 0)`. Update on every new review (A1.1) via aggregation pipeline. | — |

**Files to create:**
- `server/src/routes/reviews.ts`
- `server/src/lib/ratingHelpers.ts` (helper to recalculate avgRating on Property)

**File to modify:**
- `server/src/models/Property.ts` (add avgRating, reviewCount)
- `server/src/index.ts` (register `/api/reviews` route)

**Depends on:** Feature 4 (Booking must exist and be completed)

---

### A2: Mock Payment API (Concern #1 from PLAN.md)

**Goal:** After host accepts a booking, guest simulates paying via mock card.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| A2.1 | Mock charge | `POST /api/payments/pay` | Body: `bookingId, cardNumber, cardExpiry, cardCvc`. Find booking. Must be `status: "confirmed"` and `paymentStatus: "unpaid"`. Validate card number format (basic Luhn check or just check === `"4242424242424242"`). Compute `totalAmount` = nights × property.pricePerNight. Update booking: `status: "paid"`, `paymentStatus: "paid"`, `transactionId: mock_${Date.now()}`, `totalAmount`. Return `{ success: true, transactionId }`. | Booking not found → 404. Not confirmed → 400. Already paid → 400. Invalid card → 400 "Card declined". |
| A2.2 | Get payment status | `GET /api/payments/:bookingId/status` | Return `{ status, paymentStatus, transactionId, totalAmount }` for a booking. Verify caller is guest or host of that booking. | Not authorized → 403. Not found → 404. |
| A2.3 | Refund | `POST /api/payments/refund` | Body: `bookingId`. Find booking with `paymentStatus: "paid"`. Set `paymentStatus: "refunded"`, `status: "declined"`. Return updated. Admin only. | Not admin → 403. Not paid → 400. |

**Stripe alternative (if you prefer):** Use Stripe test mode instead of mock. Install `stripe` npm package, use test key from `.env`. Create PaymentIntent on `/api/payments/create-payment-intent`, confirm on `/api/payments/confirm`. Stripe test card `4242 4242 4242 4242` always succeeds.

**Files to create:**
- `server/src/routes/payments.ts`
- `server/src/lib/paymentHelpers.ts` (Stripe client init or mock logic)

**File to modify:**
- `server/src/index.ts` (register `/api/payments` route)

**Depends on:** Feature 4 (booking must be confirmed)

---

### A3: Input Validation & Error Handling (Feature 6 — Polish)

**Goal:** All endpoints validate input with Zod, return consistent errors.

| # | Task | Details |
|---|---|---|
| A3.1 | Shared Zod schemas | Create `server/src/lib/validations.ts` with schemas for: `signupSchema`, `loginSchema`, `createPropertySchema`, `updatePropertySchema`, `createBookingSchema`, `createReviewSchema`, `mockPaymentSchema`. Export them. Each schema defines field types, required/optional, min/max lengths, custom error messages. |
| A3.2 | Validation middleware | Create `server/src/middleware/validate.ts` — generic middleware `validate(schema)` that runs `schema.parse(req.body)` and catches Zod errors, returning `400 { error: "Validation failed", details: [{ field, message }] }`. |
| A3.3 | Apply validation | Update ALL route files (`auth.ts`, `properties.ts`, `bookings.ts`, `admin.ts`, `users.ts`, `reviews.ts`, `payments.ts`) to use `validate(schema)` middleware on mutation endpoints (POST, PUT). |
| A3.4 | Global error handler | In `server/src/index.ts`, add Express error middleware `(err, req, res, next)`. Handle: Mongoose `ValidationError` → 400, Mongoose `CastError` (invalid ObjectId) → 400, Mongoose duplicate key `11000` → 409, `JsonWebTokenError` → 401, `TokenExpiredError` → 401. Log stack in dev only. Return `{ error: message }`. |
| A3.5 | MinPrice search | Update `server/src/routes/properties.ts` — add `minPrice` query param filter alongside existing `maxPrice`. Already supports: `location`, `maxPrice`, `amenities`. Add: `if (minPrice) filter.pricePerNight = { ...filter.pricePerNight, $gte: Number(minPrice) }`. |

**Files to create:**
- `server/src/lib/validations.ts`
- `server/src/middleware/validate.ts`

**Files to modify:**
- `server/src/index.ts` (add error middleware)
- `server/src/routes/properties.ts` (add minPrice)
- All route files (add validation middleware imports)

**Depends on:** Nothing — can be done in parallel with all features

---

### A4: Booking Overlap Helper

**Goal:** Centralized overlap-check logic used by both bookings and availability.

| # | Task | Details |
|---|---|---|
| A4.1 | Overlap function | Create `server/src/lib/bookingOverlap.ts`. Export `async function checkOverlap(propertyId, startDate, endDate, excludeBookingId?)`: queries `Booking` for confirmed bookings where dates overlap. Returns conflicting booking or null. Takes optional `excludeBookingId` to skip the current booking during updates. |
| A4.2 | Integrate | Use this in `bookings.ts` create route and in availability calendar checks. |

**File to create:** `server/src/lib/bookingOverlap.ts`

**Depends on:** Nothing

---

## Backend Dev B — Extended Features & Platform

### Files you own
```
server/src/routes/messages.ts         (new)
server/src/routes/availability.ts     (new)
server/src/routes/upload.ts           (new, or extend existing)
server/src/middleware/upload.ts        (new)
server/src/models/Message.ts          (new)
```

### B1: In-App Messaging (Nice-to-have #13)

**Goal:** Guests message hosts before booking.

**Data model:**
```
Message {
  senderId:   ObjectId (ref: User, required)
  receiverId: ObjectId (ref: User, required)
  listingId:  ObjectId (ref: Property, required)
  text:       String (required, max 2000)
  read:       Boolean (default: false)
  createdAt:  Date (auto)
}
```

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B1.1 | Send message | `POST /api/messages` | Body: `listingId, text`. Find listing to get `hostId` (receiver). Sender = current user. Save message. Return 201 + message. Optionally set `receiverId` from body if guest messages guest (edge case) — default to host. | Listing not found → 404. Text empty → 400. |
| B1.2 | Get conversation | `GET /api/messages/:listingId` | Return messages between current user and the other party for this listing. Find: `{ listingId, $or: [{senderId: user, receiverId: other}, {senderId: other, receiverId: user}] }`. Sort by `createdAt` asc. Mark unread messages as read (where `receiverId === currentUser`). Populate sender name for display. | Listing not found → 404. |
| B1.3 | Get inbox | `GET /api/messages/inbox` | Return list of unique conversations for current user. Use aggregation pipeline: group by `listingId`, get latest message per group, count unread where `receiverId === currentUser && read === false`. Populate listing title + other user's name. Sort by most recent message. | — |
| B1.4 | Mark as read | `PUT /api/messages/read/:listingId` | Mark all messages in a conversation where `receiverId === currentUser` as `read: true`. Return `{ modifiedCount }`. | — |

**Files to create:**
- `server/src/models/Message.ts`
- `server/src/routes/messages.ts`

**File to modify:**
- `server/src/index.ts` (register `/api/messages` route)

**Depends on:** Feature 1 (auth), Feature 2 (listing exists)

---

### B2: Availability Calendar (Nice-to-have #12)

**Goal:** Hosts block dates. Booking form excludes blocked dates.

**Property model already has `unavailableDates: [Date]`** — you only need routes.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B2.1 | Block dates | `POST /api/properties/:id/block-dates` | Body: `dates: ["YYYY-MM-DD", ...]`. Verify caller owns property. Add dates to `unavailableDates` array (using `$addToSet` to avoid duplicates). Return updated property. | Not owner → 403. Property not found → 404. Invalid date format → 400. |
| B2.2 | Unblock dates | `DELETE /api/properties/:id/block-dates` | Body: `dates: ["YYYY-MM-DD", ...]`. Verify ownership. Remove dates from `unavailableDates` array (using `$pull`). Return updated property. | Not owner → 403. |
| B2.3 | Get available dates | `GET /api/properties/:id/available-dates` | Return `{ unavailableDates: Date[], blockedRanges: [{start, end}] }`. Optionally compute next 90 days of availability, excluding blocked dates and existing confirmed bookings. Used by frontend to gray out dates on the DatePicker. | Property not found → 404. |
| B2.4 | Extend overlap check | Update `server/src/routes/bookings.ts` | In create booking: also check that `startDate` and `endDate` do not fall on any date in `property.unavailableDates`. Return 409 if blocked. | — |

**No new models needed.** Property model already has `unavailableDates`.

**Files to create:**
- `server/src/routes/availability.ts` (or add to `properties.ts`)

**Files to modify:**
- `server/src/routes/bookings.ts` (add blocked-date check)
- `server/src/index.ts` (register routes if creating new file)

**Depends on:** Feature 2 (property must exist), Feature 4 (booking overlap logic)

---

### B3: Profile Photo Upload (Nice-to-have #14)

**Goal:** Users upload a profile photo.

**User model already has `profilePhoto` field** — you only need upload route.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B3.1 | Multer config | `server/src/middleware/upload.ts` | Configure Multer: `storage: diskStorage`, destination `server/uploads/`, filename `Date.now() + '-' + randomUUID + ext`. File filter: only images (jpeg, png, webp). Size limit: 5MB. Export as `uploadSingle` middleware. | — |
| B3.2 | Upload photo | `POST /api/users/profile-photo` | Use `uploadSingle('photo')`. Save file. Update `User.profilePhoto = /uploads/filename`. Return `{ url }`. | No file → 400. Wrong type → 400. Too large → 400. |
| B3.3 | Serve uploads | Already done in `index.ts` | `app.use('/uploads', express.static(...))` already exists — verify it works. | — |
| B3.4 | Get user profile | `GET /api/users/profile` | Return current user's data (name, email, role, profilePhoto). No admin needed — any logged-in user can view their own profile. | — |

**File to create:**
- `server/src/middleware/upload.ts`

**Files to modify:**
- `server/src/routes/users.ts` (add `/profile-photo` and `/profile` endpoints)
- `server/src/index.ts` if needed

**Depends on:** Feature 1 (user must exist and be authenticated)

---

### B4: Admin Moderation Enhancements (Nice-to-have #15)

**Goal:** Strengthen admin capabilities.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B4.1 | Dashboard stats | Already exists at `GET /api/admin/stats` | Returns `{ totalUsers, totalActiveListings, totalBookings }`. Verify it works, add `totalRevenue` (sum of all paid booking `totalAmount`). | — |
| B4.2 | Flag/report listing | `POST /api/admin/flag/:id` | Body: `reason`. Mark `Property.flagged = true`, `Property.flagReason = reason`. Use admin middleware. Return updated property. Add `flagged` and `flagReason` fields to Property model. | Not admin → 403. |
| B4.3 | Unflag listing | `POST /api/admin/unflag/:id` | Set `flagged = false`, clear `flagReason`. | Not admin → 403. |
| B4.4 | Add fields to Property | Modify `server/src/models/Property.ts` | Add: `flagged: Boolean (default: false)`, `flagReason: String`. | — |

**Files to modify:**
- `server/src/routes/admin.ts` (add flag/unflag endpoints)
- `server/src/models/Property.ts` (add flagged fields)

**Depends on:** Feature 1 (admin role)

---

### B5: Rate Limiting & Security (Feature 6 — Polish)

**Goal:** Protect auth endpoints from brute force.

| # | Task | Details |
|---|---|---|
| B5.1 | Install express-rate-limit | `npm install express-rate-limit` |
| B5.2 | Auth rate limit | Apply to auth routes: 10 login attempts / 15 min window, 5 signup attempts / 15 min window. Return 429 with `{ error: "Too many attempts, try later" }`. |
| B5.3 | General rate limit | 100 requests / 15 min for general API. Apply after auth routes to avoid locking out login. |
| B5.4 | Helmet | `npm install helmet`. Add `app.use(helmet())` in `index.ts` for security headers. |

**Files to modify:**
- `server/src/index.ts` (add helmet and rate limiter)
- `server/src/routes/auth.ts` (add auth-specific rate limiter)

**Depends on:** Nothing — can be done in parallel

---

## File Ownership Matrix

| File | Owner | Status |
|---|---|---|
| `server/src/index.ts` | 🔴/🔵 Both | ✅ Done, modify to register new routes |
| `server/src/config/db.ts` | 🔵 B | ✅ Done |
| `server/src/types/index.ts` | 🔴 A | ✅ Done |
| `server/src/middleware/auth.ts` | 🔴 A | ✅ Done |
| `server/src/middleware/validate.ts` | 🔴 A | ❌ New |
| `server/src/middleware/upload.ts` | 🔵 B | ❌ New |
| `server/src/models/User.ts` | 🔵 B | ✅ Done |
| `server/src/models/Property.ts` | 🔴/🔵 Both | ✅ Done, both modify (A: avgRating, B: flagged) |
| `server/src/models/Booking.ts` | 🔴 A | ✅ Done |
| `server/src/models/Review.ts` | 🔴 A | ✅ Done (model exists, no routes) |
| `server/src/models/Message.ts` | 🔵 B | ❌ New |
| `server/src/routes/auth.ts` | 🔴 A | ✅ Done |
| `server/src/routes/properties.ts` | 🔴 A | ✅ Done, needs minPrice |
| `server/src/routes/bookings.ts` | 🔴 A | ✅ Done, needs overlap helper + blocked-date check |
| `server/src/routes/admin.ts` | 🔵 B | ✅ Done, needs flag/unflag |
| `server/src/routes/users.ts` | 🔵 B | ✅ Done, needs profile-photo + profile |
| `server/src/routes/reviews.ts` | 🔴 A | ❌ New |
| `server/src/routes/payments.ts` | 🔴 A | ❌ New |
| `server/src/routes/messages.ts` | 🔵 B | ❌ New |
| `server/src/routes/availability.ts` | 🔵 B | ❌ New |
| `server/src/lib/validations.ts` | 🔴 A | ❌ New |
| `server/src/lib/bookingOverlap.ts` | 🔴 A | ❌ New |
| `server/src/lib/paymentHelpers.ts` | 🔴 A | ❌ New |
| `server/src/lib/ratingHelpers.ts` | 🔴 A | ❌ New |

---

## Feature Dependency Graph

```
                  ┌─────────────────────────────┐
                  │  Already Built (Foundation)  │
                  │  Auth · Properties · Bookings │
                  │  Admin · Users · Middleware   │
                  └──────────┬──────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌─────────▼─────────┐
     │  Backend Dev A  │          │  Backend Dev B    │
     │                 │          │                   │
     │  A1: Reviews    │          │  B1: Messaging    │
     │  A2: Payments   │          │  B2: Availability  │
     │  A3: Validation │          │  B3: Profile Photo │
     │  A4: Overlap    │          │  B4: Admin Enhance │
     │  (minPrice fix) │          │  B5: Rate Limiting │
     └────────┬────────┘          └─────────┬─────────┘
              │                             │
              └──────────┬──────────────────┘
                         │
                  ┌──────▼──────┐
                  │ Integration │
                  │  Test all   │
                  └─────────────┘
```

---

## Sprint Plan (Backend Only)

| Sprint | Dev A (Core) | Dev B (Extended) |
|---|---|---|
| **Sprint 1** | A4: Booking overlap helper. A3: Zod validation schemas + validate middleware. Apply validation to existing routes. Add global error handler in `index.ts`. Add `minPrice` to properties search. | B3: Multer config + profile photo upload route. B5: Install helmet + express-rate-limit, apply to auth and general routes. |
| **Sprint 2** | A1: Reviews routes + rating helpers. Update Property model with avgRating/reviewCount. Register `/api/reviews` in index. | B1: Message model + routes (send, conversation, inbox, mark read). Register `/api/messages`. |
| **Sprint 3** | A2: Mock payment routes (pay, status, refund). Payment helpers. Register `/api/payments`. Install Stripe (optional). | B2: Availability routes (block/unblock/get dates). Update booking route to check blocked dates. Register routes. |
| **Sprint 4** | Integration testing. Fix bugs. Ensure all endpoints return consistent error shapes. | B4: Admin flag/unflag endpoints. Update Property model. Test all admin flows. |
| **Sprint 5+** | Stripe real integration (optional). Payment webhooks (optional). | Any remaining polish. Documentation. |

---

## API Contract Process (How to stay in sync)

Both devs share a single API contract document. When one person adds a new endpoint, they update this table:

| Method | Path | Auth | Request Body / Query | Response | Errors | Owner |
|---|---|---|---|---|---|---|
| POST | /api/reviews | Guest | `{ bookingId, rating, text? }` | `{ review }` | 400, 403, 409 | 🔴 A |
| GET | /api/reviews/:propertyId | No | — | `{ reviews[], avgRating, reviewCount }` | 400 | 🔴 A |
| POST | /api/payments/pay | Guest | `{ bookingId, cardNumber, cardExpiry, cardCvc }` | `{ success, transactionId }` | 400, 404 | 🔴 A |
| POST | /api/messages | Auth | `{ listingId, text }` | `{ message }` | 400, 404 | 🔵 B |
| GET | /api/messages/:listingId | Auth | — | `{ messages[] }` | 404 | 🔵 B |
| GET | /api/messages/inbox | Auth | — | `{ conversations[] }` | — | 🔵 B |
| POST | /api/properties/:id/block-dates | Host | `{ dates: ["YYYY-MM-DD"] }` | `{ property }` | 403, 404 | 🔵 B |
| DELETE | /api/properties/:id/block-dates | Host | `{ dates: ["YYYY-MM-DD"] }` | `{ property }` | 403, 404 | 🔵 B |
| POST | /api/users/profile-photo | Auth | multipart/form-data `photo` | `{ url }` | 400 | 🔵 B |
| GET | /api/users/profile | Auth | — | `{ user }` | — | 🔵 B |
| POST | /api/admin/flag/:id | Admin | `{ reason }` | `{ property }` | 403 | 🔵 B |
| POST | /api/admin/unflag/:id | Admin | — | `{ property }` | 403 | 🔵 B |

---

## Git Workflow

```bash
# Both start from main
git checkout main
git pull

# Dev A creates feature branch
git checkout -b feature/reviews-payments-validation

# Dev B creates feature branch
git checkout -b feature/messaging-availability-photos

# Commit often, push daily
git add .
git commit -m "A1: Add reviews CRUD routes"
git push origin feature/reviews-payments-validation

# When ready, create PR and merge to main
# After merge, both pull main and rebase their branches
```

**Conflict zones** (coordinate before editing):
- `server/src/index.ts` — both will register new routes. Communicate which line each adds.
- `server/src/models/Property.ts` — Dev A adds `avgRating`/`reviewCount`, Dev B adds `flagged`/`flagReason`. Coordinate field additions.
- `server/src/routes/bookings.ts` — Dev A adds validation, Dev B adds blocked-date check. Communicate changes.
