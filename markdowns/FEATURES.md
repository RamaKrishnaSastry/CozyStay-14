# CozyStay — Backend Feature Division

> **2 people, both on backend (Flask + MySQL).**
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
| `server/app/__init__.py` | ✅ Flask app factory, CORS, JWT, DB init |
| `server/app/config.py` | ✅ Config classes (MySQL URI, JWT secret, upload path) |
| `server/app.py` | ✅ Entry point |
| `server/app/models/user.py` | ✅ User model with password hashing |
| `server/app/models/property.py` | ✅ Property model with JSON fields for photos/amenities |
| `server/app/models/booking.py` | ✅ Booking model with status enum, composite index |
| `server/app/models/review.py` | ✅ Review model (model only — **no routes yet**) |
| `server/app/routes/auth.py` | ✅ Register, Login, Get Me |
| `server/app/routes/properties.py` | ✅ CRUD + search/filter (location, max_price, amenities) |
| `server/app/routes/bookings.py` | ✅ Create, My Bookings, Host Requests, Respond (accept/decline) |
| `server/app/routes/admin.py` | ✅ Admin stats, list all listings/bookings, delete |
| `server/app/routes/users.py` | ✅ Admin user management (list, get, update, delete) |

---

## Backend Dev A — Core API & Transactions

### Files you own
```
server/app/routes/reviews.py     (new)
server/app/routes/payments.py    (new)
server/app/schemas/              (new directory)
server/app/utils/
├── __init__.py
├── errors.py                    (error handlers)
└── helpers.py                   (booking overlap, rating calc)
```

### A1: Reviews API (Nice-to-have #10)

**Goal:** Guests leave reviews after completed stays. Ratings display on listings.

**Review model already exists** — you only need routes.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| A1.1 | Create review | `POST /api/reviews` | Body: `booking_id, rating (1-5), text (optional)`. Find booking. Verify: belongs to caller, `end_date` passed, status is `"paid"`. Check no existing review for this booking. Create review. Update property's `avg_rating` and `review_count` (aggregate all reviews for that property). | Not your booking → 403. Too early (end_date not passed) → 400. Duplicate review → 409. |
| A1.2 | Get listing reviews | `GET /api/reviews/:property_id` | Find all reviews where `property_id = property_id`. Join guest name. Sort by `created_at` desc. Return array + `{ avg_rating, review_count }`. | Invalid property_id → 400. |
| A1.3 | Update Property model | Modify `server/app/models/property.py` | Add fields: `avg_rating: Float (default: 0)`, `review_count: Integer (default: 0)`. Update on every new review (A1.1) via aggregation. | — |

**Files to create:**
- `server/app/routes/reviews.py`
- `server/app/utils/helpers.py` (rating calculation helpers)

**Files to modify:**
- `server/app/models/property.py` (add avg_rating, review_count)
- `server/app/__init__.py` (register `/api/reviews` blueprint)

**Depends on:** Feature 4 (Booking must exist and be completed)

---

### A2: Mock Payment API (Concern #1 from PLAN.md)

**Goal:** After host accepts a booking, guest simulates paying via mock card.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| A2.1 | Mock charge | `POST /api/payments/pay` | Body: `booking_id, card_number, card_expiry, card_cvc`. Find booking. Must be `status: "confirmed"` and `payment_status: "unpaid"`. Validate card number format (basic Luhn check or just check === `"4242424242424242"`). Compute `total_amount` = nights × property.price_per_night. Update booking: `status: "paid"`, `payment_status: "paid"`, `transaction_id: mock_${timestamp}`, `total_amount`. Return `{ success, transaction_id }`. | Booking not found → 404. Not confirmed → 400. Already paid → 400. Invalid card → 400 "Card declined". |
| A2.2 | Get payment status | `GET /api/payments/:booking_id/status` | Return `{ status, payment_status, transaction_id, total_amount }` for a booking. Verify caller is guest or host of that booking. | Not authorized → 403. Not found → 404. |
| A2.3 | Refund | `POST /api/payments/refund` | Body: `booking_id`. Find booking with `payment_status: "paid"`. Set `payment_status: "refunded"`, `status: "declined"`. Return updated. Admin only. | Not admin → 403. Not paid → 400. |

**Files to create:**
- `server/app/routes/payments.py`

**Files to modify:**
- `server/app/models/booking.py` (add payment_status, transaction_id, total_amount fields)
- `server/app/__init__.py` (register `/api/payments` blueprint)

**Depends on:** Feature 4 (booking must be confirmed)

---

### A3: Input Validation & Error Handling (Feature 6 — Polish)

**Goal:** All endpoints validate input with Marshmallow, return consistent errors.

| # | Task | Details |
|---|---|---|
| A3.1 | Marshmallow schemas | Create `server/app/schemas/` with schemas for: `RegisterSchema`, `LoginSchema`, `PropertySchema`, `BookingSchema`, `ReviewSchema`, `PaymentSchema`. Each schema defines fields, required/optional, length validators, custom error messages. |
| A3.2 | Validation decorator | Create `server/app/utils/errors.py` — decorator `@validate(schema)` that runs `schema.load(request.json)` and catches `ValidationError`, returning `400 { error: "Validation failed", details: [{ field, message }] }`. |
| A3.3 | Apply validation | Update ALL route files to use `@validate(schema)` decorator on mutation endpoints (POST, PUT). |
| A3.4 | Global error handler | In `server/app/__init__.py`, register `@app.errorhandler` for: `IntegrityError` (duplicate key) → 409, `404` → `{ error: "Not found" }`, `422` → validation errors. Return `{ error: message }`. |
| A3.5 | Min_price search | Update `server/app/routes/properties.py` — add `min_price` query param filter alongside existing `max_price`. Already supports: `location`, `max_price`, `amenities`. Add: `if min_price: filter.append(Property.price_per_night >= float(min_price))`. |

**Files to create:**
- `server/app/schemas/__init__.py`
- `server/app/schemas/user.py`
- `server/app/schemas/property.py`
- `server/app/schemas/booking.py`
- `server/app/utils/errors.py`

**Files to modify:**
- `server/app/__init__.py` (add error handlers)
- `server/app/routes/properties.py` (add min_price)
- All route files (add validation decorators)

**Depends on:** Nothing — can be done in parallel with all features

---

### A4: Booking Overlap Helper

**Goal:** Centralized overlap-check logic used by both bookings and availability.

| # | Task | Details |
|---|---|---|
| A4.1 | Overlap function | Add to `server/app/utils/helpers.py`. Function `check_overlap(property_id, start_date, end_date, exclude_booking_id=None)`: queries `Booking` for confirmed bookings where dates overlap. Returns conflicting booking or None. Takes optional `exclude_booking_id` to skip the current booking during updates. |
| A4.2 | Integrate | Use this in `bookings.py` create route and in availability calendar checks. |

**File to modify:** `server/app/utils/helpers.py`

**Depends on:** Nothing

---

## Backend Dev B — Extended Features & Platform

### Files you own
```
server/app/routes/messages.py         (new)
server/app/routes/availability.py     (new)
server/app/routes/upload.py           (new)
server/app/middleware/
├── __init__.py
├── auth.py                           (JWT decorators - already exists)
└── upload.py                         (File upload helpers)
server/app/models/message.py          (new)
```

### B1: In-App Messaging (Nice-to-have #13)

**Goal:** Guests message hosts before booking.

**Data model:**
```
Message {
  id:           INT PK AUTO_INCREMENT
  sender_id:    INT FK → User
  receiver_id:  INT FK → User
  listing_id:   INT FK → Property
  text:         TEXT (max 2000)
  read:         BOOLEAN (default: false)
  created_at:   DATETIME
}
```

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B1.1 | Send message | `POST /api/messages` | Body: `listing_id, text`. Find listing to get `host_id` (receiver). Sender = current user. Save message. Return 201 + message. | Listing not found → 404. Text empty → 400. |
| B1.2 | Get conversation | `GET /api/messages/:listing_id` | Return messages between current user and the other party for this listing. Filter: `WHERE listing_id = ? AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))`. Sort by `created_at` asc. Mark unread messages as read (where `receiver_id = current_user`). Return with sender name. | Listing not found → 404. |
| B1.3 | Get inbox | `GET /api/messages/inbox` | Return list of unique conversations for current user. Use SQL GROUP BY `listing_id`, get latest message per group, count unread where `receiver_id = current_user AND read = false`. Join listing title + other user's name. Sort by most recent message. | — |
| B1.4 | Mark as read | `PUT /api/messages/read/:listing_id` | Mark all messages in a conversation where `receiver_id = current_user` as `read = true`. Return `{ modified_count }`. | — |

**Files to create:**
- `server/app/models/message.py`
- `server/app/routes/messages.py`

**Files to modify:**
- `server/app/__init__.py` (register `/api/messages` blueprint)

**Depends on:** Feature 1 (auth), Feature 2 (listing exists)

---

### B2: Availability Calendar (Nice-to-have #12)

**Goal:** Hosts block dates. Booking form excludes blocked dates.

**Property model already has `unavailable_dates` JSON field** — you only need routes.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B2.1 | Block dates | `POST /api/properties/:id/block-dates` | Body: `dates: ["YYYY-MM-DD", ...]`. Verify caller owns property. Fetch property, add dates to `unavailable_dates` list (deduplicate). Save. Return updated property. | Not owner → 403. Property not found → 404. Invalid date format → 400. |
| B2.2 | Unblock dates | `DELETE /api/properties/:id/block-dates` | Body: `dates: ["YYYY-MM-DD", ...]`. Verify ownership. Remove dates from `unavailable_dates` list. Save. Return updated property. | Not owner → 403. |
| B2.3 | Get available dates | `GET /api/properties/:id/available-dates` | Return `{ unavailable_dates: [], blocked_ranges: [{start, end}] }`. Optionally compute next 90 days of availability, excluding blocked dates and existing confirmed bookings. | Property not found → 404. |
| B2.4 | Extend overlap check | Update `server/app/routes/bookings.py` | In create booking: also check that `start_date` and `end_date` do not fall on any date in `property.unavailable_dates`. Return 409 if blocked. | — |

**No new models needed.** Property model already has `unavailable_dates` JSON.

**Files to create:**
- `server/app/routes/availability.py`

**Files to modify:**
- `server/app/routes/bookings.py` (add blocked-date check)
- `server/app/__init__.py` (register routes if creating new file)

**Depends on:** Feature 2 (property must exist), Feature 4 (booking overlap logic)

---

### B3: Profile Photo Upload (Nice-to-have #14)

**Goal:** Users upload a profile photo.

**User model already has `profile_photo` field** — you only need upload route.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B3.1 | Upload config | `server/app/middleware/upload.py` | Configure allowed extensions (jpeg, png, webp), size limit (5MB), save path `server/uploads/`, filename `timestamp_uuid.ext`. | — |
| B3.2 | Upload photo | `POST /api/users/profile-photo` | Use `request.files['photo']`. Validate extension and size. Save file. Update `User.profile_photo = /uploads/filename`. Return `{ url }`. | No file → 400. Wrong type → 400. Too large → 400. |
| B3.3 | Serve uploads | Already done in `app/__init__.py` | `app.static_folder = 'uploads'` or register static route. Verify it works. | — |
| B3.4 | Get user profile | `GET /api/users/profile` | Return current user's data (name, email, role, profile_photo). Any logged-in user can view their own profile. | — |

**Files to create:**
- `server/app/middleware/upload.py`

**Files to modify:**
- `server/app/routes/users.py` (add `/profile-photo` and `/profile` endpoints)
- `server/app/__init__.py` if needed

**Depends on:** Feature 1 (user must exist and be authenticated)

---

### B4: Admin Moderation Enhancements (Nice-to-have #15)

**Goal:** Strengthen admin capabilities.

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| B4.1 | Dashboard stats | Already exists at `GET /api/admin/stats` | Returns `{ total_users, total_active_listings, total_bookings }`. Verify it works, add `total_revenue` (sum of all paid booking `total_amount`). | — |
| B4.2 | Flag/report listing | `POST /api/admin/flag/:id` | Body: `reason`. Mark `Property.flagged = true`, `Property.flag_reason = reason`. Use admin middleware. Return updated property. Add `flagged` and `flag_reason` fields to Property model. | Not admin → 403. |
| B4.3 | Unflag listing | `POST /api/admin/unflag/:id` | Set `flagged = false`, clear `flag_reason`. | Not admin → 403. |
| B4.4 | Add fields to Property | Modify `server/app/models/property.py` | Add: `flagged: Boolean (default: false)`, `flag_reason: String`. | — |

**Files to modify:**
- `server/app/routes/admin.py` (add flag/unflag endpoints)
- `server/app/models/property.py` (add flagged fields)

**Depends on:** Feature 1 (admin role)

---

### B5: Rate Limiting & Security (Feature 6 — Polish)

**Goal:** Protect auth endpoints from brute force.

| # | Task | Details |
|---|---|---|
| B5.1 | Install flask-limiter | `pip install flask-limiter` |
| B5.2 | Auth rate limit | Apply to auth routes: 10 login attempts / 15 min window, 5 signup attempts / 15 min window. Return 429 with `{ error: "Too many attempts, try later" }`. |
| B5.3 | General rate limit | 100 requests / 15 min for general API. Apply after auth routes to avoid locking out login. |
| B5.4 | Security headers | Add Flask-Talisman or simple `@app.after_request` to set `X-Content-Type-Options`, `X-Frame-Options`, etc. |

**Files to modify:**
- `server/app/__init__.py` (add limiter and security headers)
- `server/app/routes/auth.py` (add auth-specific rate limiter)

**Depends on:** Nothing — can be done in parallel

---

## File Ownership Matrix

| File | Owner | Status |
|---|---|---|
| `server/app/__init__.py` | 🔴/🔵 Both | ✅ Done, modify to register new blueprints |
| `server/app/config.py` | 🔵 B | ✅ Done |
| `server/app.py` | 🔵 B | ✅ Done |
| `server/app/middleware/auth.py` | 🔴 A | ✅ Done |
| `server/app/middleware/upload.py` | 🔵 B | ❌ New |
| `server/app/models/user.py` | 🔵 B | ✅ Done |
| `server/app/models/property.py` | 🔴/🔵 Both | ✅ Done, both modify (A: avg_rating, B: flagged) |
| `server/app/models/booking.py` | 🔴 A | ✅ Done |
| `server/app/models/review.py` | 🔴 A | ✅ Done (model exists, no routes) |
| `server/app/models/message.py` | 🔵 B | ❌ New |
| `server/app/routes/auth.py` | 🔴 A | ✅ Done |
| `server/app/routes/properties.py` | 🔴 A | ✅ Done, needs min_price |
| `server/app/routes/bookings.py` | 🔴 A | ✅ Done, needs overlap helper + blocked-date check |
| `server/app/routes/admin.py` | 🔵 B | ✅ Done, needs flag/unflag |
| `server/app/routes/users.py` | 🔵 B | ✅ Done, needs profile-photo + profile |
| `server/app/routes/reviews.py` | 🔴 A | ❌ New |
| `server/app/routes/payments.py` | 🔴 A | ❌ New |
| `server/app/routes/messages.py` | 🔵 B | ❌ New |
| `server/app/routes/availability.py` | 🔵 B | ❌ New |
| `server/app/schemas/` | 🔴 A | ❌ New |
| `server/app/utils/errors.py` | 🔴 A | ❌ New |
| `server/app/utils/helpers.py` | 🔴 A | ❌ New |

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
     │  (min_price fix)│          │  B5: Rate Limiting │
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
| **Sprint 1** | A4: Booking overlap helper. A3: Marshmallow validation schemas + validate decorator. Apply validation to existing routes. Add global error handler in `__init__.py`. Add `min_price` to properties search. | B3: File upload config + profile photo upload route. B5: Install flask-limiter, apply to auth and general routes. Add security headers. |
| **Sprint 2** | A1: Reviews routes + rating helpers. Update Property model with avg_rating/review_count. Register `/api/reviews` blueprint. | B1: Message model + routes (send, conversation, inbox, mark read). Register `/api/messages` blueprint. |
| **Sprint 3** | A2: Mock payment routes (pay, status, refund). Update Booking model with payment fields. Register `/api/payments` blueprint. | B2: Availability routes (block/unblock/get dates). Update booking route to check blocked dates. Register routes. |
| **Sprint 4** | Integration testing. Fix bugs. Ensure all endpoints return consistent error shapes. | B4: Admin flag/unflag endpoints. Update Property model. Test all admin flows. |
| **Sprint 5+** | Stripe real integration (optional). Payment webhooks (optional). | Any remaining polish. Documentation. |

---

## API Contract Process (How to stay in sync)

Both devs share a single API contract document. When one person adds a new endpoint, they update this table:

| Method | Path | Auth | Request Body / Query | Response | Errors | Owner |
|---|---|---|---|---|---|---|
| POST | /api/reviews | Guest | `{ booking_id, rating, text? }` | `{ review }` | 400, 403, 409 | 🔴 A |
| GET | /api/reviews/:property_id | No | — | `{ reviews[], avg_rating, review_count }` | 400 | 🔴 A |
| POST | /api/payments/pay | Guest | `{ booking_id, card_number }` | `{ success, transaction_id }` | 400, 404 | 🔴 A |
| POST | /api/messages | Auth | `{ listing_id, text }` | `{ message }` | 400, 404 | 🔵 B |
| GET | /api/messages/:listing_id | Auth | — | `{ messages[] }` | 404 | 🔵 B |
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
- `server/app/__init__.py` — both will register new blueprints. Communicate which line each adds.
- `server/app/models/property.py` — Dev A adds `avg_rating`/`review_count`, Dev B adds `flagged`/`flag_reason`. Coordinate field additions.
- `server/app/routes/bookings.py` — Dev A adds validation, Dev B adds blocked-date check. Communicate changes.
