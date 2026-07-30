# CozyStay — Feature Breakdown & Work Division

> **2 people.** Person A = Backend (Node.js, Express, MongoDB). Person B = Frontend (React, MUI, Router).
>
> Features are split so each person can work mostly independently. Dependencies are noted at the top of each feature.
>
> **Color key for files:** 🔴 = Person A (backend) · 🔵 = Person B (frontend) · 🟢 = Shared

---

## Feature 0: Project Scaffolding

**Goal:** Both projects initialized, first page loads, database connects.

### Person A — Initialize Backend

| Step | Details |
|---|---|
| Create `server/` | `npm init`, install express, mongoose, typescript, ts-node-dev, cors, dotenv |
| TypeScript config | `tsconfig.json` with strict mode, ES2020 target, outDir: `./dist` |
| Entry point | `server/src/index.ts` — Express app, CORS, JSON body parser, listen on `PORT` |
| MongoDB connection | `server/src/config/db.ts` — connect to `MONGODB_URI` env var, log success/failure |
| Health check | `GET /api/health` → `{ status: "ok", db: "connected" }` |
| `.env.example` | `PORT=5000`, `MONGODB_URI=mongodb://localhost:27017/cozystay`, `JWT_SECRET=dev-secret` |
| Verify | Server starts, health endpoint returns OK, DB connects |

**Files created (Person A):** `server/package.json`, `server/tsconfig.json`, `server/src/index.ts`, `server/src/config/db.ts`, `server/.env.example`

### Person B — Initialize Frontend

| Step | Details |
|---|---|
| Create `client/` | `npm create vite@latest client -- --template react-ts` |
| Install deps | `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `react-router-dom`, `axios` |
| Theme setup | `client/src/theme.ts` — MUI `createTheme` with cozy colors (warm primary, teal secondary) |
| App shell | `client/src/App.tsx` — `ThemeProvider` + `CssBaseline` + `BrowserRouter` + placeholder routes |
| Navbar | `client/src/components/Navbar.tsx` — MUI `<AppBar>` with app title, Login/Signup links (no auth yet) |
| Root page | `client/src/pages/Home.tsx` — placeholder "Welcome to CozyStay" |
| Axios client | `client/src/api/client.ts` — Axios instance with `baseURL: http://localhost:5000/api` |
| Verify | `npm run dev` shows themed page with navbar |

**Files created (Person B):** `client/package.json`, `client/vite.config.ts`, `client/src/main.tsx`, `client/src/App.tsx`, `client/src/theme.ts`, `client/src/components/Navbar.tsx`, `client/src/pages/Home.tsx`, `client/src/api/client.ts`

**Depends on:** Nothing

---

## Feature 1: User Authentication (MVP story #1, #9)

**Goal:** Users can sign up, log in, persist session, log out. Protected pages redirect to login.

### Data Model

**User schema (Person A):**
```
{
  name:         String (required, trimmed)
  email:        String (required, unique, lowercase, trimmed)
  passwordHash: String (required)
  role:         String (enum: "guest" | "host" | "admin", default: "guest")
  createdAt:    Date (auto, immutable)
}
```

### Person A — Auth Backend

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| 1.1 | Signup | `POST /api/auth/signup` | Validate input (Zod: name 2-50 chars, email valid format, password 6+ chars). Check email uniqueness. Hash password (bcrypt, 12 rounds). Create User. Sign JWT (payload: `{ userId, role }`, expires: 7d). Return `{ token, user }`. | Duplicate email → 409. Invalid fields → 400 with field-level errors. |
| 1.2 | Login | `POST /api/auth/login` | Find user by email. Compare password hash. Sign JWT. Return `{ token, user }`. | Wrong email → 401 "Invalid credentials". Wrong password → 401 "Invalid credentials". (Same message to prevent email enumeration.) |
| 1.3 | Get current user | `GET /api/auth/me` | Verify JWT from `Authorization: Bearer <token>` header. Find user by ID from token. Return `{ user }` (exclude passwordHash). | Missing/invalid token → 401. User deleted → 404. |
| 1.4 | Auth middleware | `server/src/middleware/auth.ts` | Extract Bearer token. Verify with `jwt.verify()`. Attach `req.user = { userId, role }` to request. Export as `requireAuth`. | No token → 401. Invalid/expired → 401. |
| 1.5 | Role middleware | `server/src/middleware/hostOnly.ts` | After `requireAuth`, check `req.user.role === "host"`. Export as `requireHost`. | Not a host → 403. |

**Files created (Person A):**
- `server/src/models/User.ts`
- `server/src/routes/auth.ts`
- `server/src/middleware/auth.ts`
- `server/src/middleware/hostOnly.ts`
- `server/src/lib/validations.ts` (Zod schemas for signup/login)
- `server/src/types/index.ts` (extend Express Request)

### Person B — Auth Frontend

| # | Task | Page/Component | Implementation |
|---|---|---|---|
| 1.6 | AuthContext | `client/src/context/AuthContext.tsx` | Store `{ user, token }` in state + localStorage. Provide `login()`, `signup()`, `logout()`, `isAuthenticated`, `user`, `userRole`. On mount, check localStorage for existing token and call `GET /api/auth/me` to restore session. |
| 1.7 | Login page | `client/src/pages/Login.tsx` | MUI `<Paper>` centered card. `<TextField>` for email, `<TextField type="password">` for password, `<Button variant="contained">` submit. Show `<Alert severity="error">` on 401. On success, call context `login()` and redirect to `/` (or previous page). |
| 1.8 | Signup page | `client/src/pages/Signup.tsx` | Same layout as Login. Extra `<TextField>` for name. `<Select>` or toggle for role (guest/host). Validate passwords match (confirm password field). On success, auto-login and redirect. |
| 1.9 | Navbar auth | Update `Navbar.tsx` | If logged in: show user name + avatar + logout `<Button>`. If not: show Login / Signup links. Logout calls `context.logout()` and redirects to `/`. |
| 1.10 | ProtectedRoute | `client/src/components/ProtectedRoute.tsx` | Wrapper component. If not authenticated, redirect to `/login` with `?redirect=` param. Optional `role` prop — if user role doesn't match, redirect to home with error toast. |
| 1.11 | Axios interceptor | Update `client/src/api/client.ts` | Attach `Authorization: Bearer <token>` from localStorage to every request. On 401 response, clear token and redirect to `/login`. |

**Files created (Person B):**
- `client/src/context/AuthContext.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/Signup.tsx`
- `client/src/components/ProtectedRoute.tsx`

**Files modified (Person B):**
- `client/src/components/Navbar.tsx`
- `client/src/api/client.ts`

**Depends on:** Feature 0 (scaffolding)
**API Contract:** Person A must provide the exact request/response shapes for the three auth endpoints before Person B can integrate.

---

## Feature 2: Listings CRUD (MVP stories #2, #4, #7)

**Goal:** Hosts can create, view, edit, and delete property listings with photos.

### Data Model

**Property schema (Person A):**
```
{
  hostId:        ObjectId (ref: User, required, indexed)
  title:         String (required, 10-100 chars)
  description:   String (required, 50-5000 chars)
  pricePerNight: Number (required, > 0, max 2 decimal places)
  location:      String (required, 3-200 chars)
  photos:        [String] (required, at least 1 URL, max 10)
  createdAt:     Date (auto, immutable)
}
```

### Person A — Listings Backend

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| 2.1 | Create listing | `POST /api/listings` | Body: title, description, pricePerNight, location, photos (string[]). Validate with Zod. Set `hostId` from `req.user.userId`. Save. Return 201 + listing. | Missing `hostId` (not authenticated) → 401. Validation fail → 400. Empty photos → 400. |
| 2.2 | Get single listing | `GET /api/listings/:id` | Find by `_id`. Populate `hostId` with `name email` (select fields). Return listing + host info. | Invalid ObjectId → 400. Not found → 404. |
| 2.3 | Get all listings | `GET /api/listings` | Optional query params: `location` (case-insensitive regex), `minPrice`, `maxPrice`. Return array sorted by `createdAt` desc. Always return array (empty if none). | Invalid price params → 400. |
| 2.4 | Update listing | `PUT /api/listings/:id` | Find listing. Check `listing.hostId === req.user.userId`. Update allowed fields. Return updated listing. | Not owner → 403. Not found → 404. Validation fail → 400. |
| 2.5 | Delete listing | `DELETE /api/listings/:id` | Find listing. Check ownership. Check for active (confirmed, future) bookings. If active bookings exist, return 409 with warning. If no active bookings, delete. Return 200. | Not owner → 403. Has active bookings → 409 with `{ error: "Listing has active bookings", activeBookings: number }`. |
| 2.6 | Upload photos | `POST /api/upload` | Accept multipart `photo` field. Multer saves to `server/uploads/` with UUID filename. Return `{ url: "/uploads/uuid.jpg" }`. Serve `uploads/` as static via Express. | No file → 400. Wrong type → 400. File > 5MB → 400. |

**Files created (Person A):**
- `server/src/models/Property.ts`
- `server/src/routes/listings.ts`
- `server/src/routes/upload.ts`
- `server/src/middleware/upload.ts` (Multer config)
- Update `server/src/lib/validations.ts` (listing Zod schemas)
- Update `server/src/index.ts` (register routes, serve static uploads)

### Person B — Listings Frontend

| # | Task | Page/Component | Implementation |
|---|---|---|---|
| 2.7 | CreateListing page | `client/src/pages/CreateListing.tsx` | MUI `<TextField>` for title, description (multiline), price (type="number"), location. Photo upload: `<input type="file">` × 1-10, preview thumbnails, upload button calls `POST /api/upload`, stores returned URLs. Form validates client-side (Zod). On submit, calls `POST /api/listings`. Redirect to `/listings/:newId` on success. Protected: host only. |
| 2.8 | ListingDetail page | `client/src/pages/ListingDetail.tsx` | Fetch `GET /api/listings/:id` on mount. MUI `<Card>` with `<ImageList>` for photos. Display: title, description, price per night, location, host name + avatar. "Request to Book" button (visible to guests — link to booking flow, Feature 4). "Edit" button (visible to owner — links to edit). Loading: MUI `<Skeleton>`. Not found: redirect to 404. |
| 2.9 | EditListing page | `client/src/pages/EditListing.tsx` | Fetch listing on mount (verify ownership via API). Pre-fill form fields. Same form layout as Create. On submit, call `PUT /api/listings/:id`. Redirect to detail page. Delete button at bottom: MUI `<Dialog>` confirmation. If delete returns 409 (active bookings), show warning dialog with count. |
| 2.10 | ListingCard component | `client/src/components/listings/ListingCard.tsx` | MUI `<Card>` with `sx={{ maxWidth: 345 }}`. `<CardMedia>` (first photo, 200px height), `<CardContent>` with title, location `<Chip>`, price per night `<Typography variant="h6">`. Entire card is a clickable `<Link>` to `/listings/:id`. |

**Files created (Person B):**
- `client/src/pages/CreateListing.tsx`
- `client/src/pages/ListingDetail.tsx`
- `client/src/pages/EditListing.tsx`
- `client/src/components/listings/ListingCard.tsx`
- `client/src/api/listings.ts` (API calls for listings CRUD)

**Files modified (Person B):**
- `client/src/App.tsx` (add routes for `/listings/new`, `/listings/:id`, `/listings/:id/edit`)

**Depends on:** Feature 1 (auth — host role check, JWT for ownership)
**API Contract:** Person A provides exact listing JSON shape. Person B needs the `GET /api/listings` response shape for the listing card.

---

## Feature 3: Browse & Search (MVP story #3)

**Goal:** Guests can browse all listings on the home page and filter by location and price.

### Person A — Search Backend

| # | Task | Endpoint | Logic |
|---|---|---|---|
| 3.1 | Search/filter listings | (Already created in 2.3) | Ensure `GET /api/listings` supports: `?location=Lisbon` (case-insensitive partial match on `location` field), `?minPrice=50&maxPrice=200` (filter `pricePerNight`). All optional — omit a param to skip that filter. |

**No new files.** Update `server/src/routes/listings.ts` query logic.

### Person B — Search Frontend

| # | Task | Page/Component | Implementation |
|---|---|---|---|
| 3.2 | Home page with grid | `client/src/pages/Home.tsx` | Fetch `GET /api/listings` on mount and on filter change. Render MUI `<Grid container spacing={3}>` of `<ListingCard>` components. Loading: MUI `<CircularProgress>` centered. Empty state: MUI `<Alert severity="info">` "No listings found — try adjusting your filters." |
| 3.3 | SearchFilters component | `client/src/components/listings/SearchFilters.tsx` | Location: MUI `<TextField>` with search `<InputAdornment>`. Price range: MUI `<TextField type="number">` for min + max (or `<Slider>` with min/max labels). "Search" `<Button>` and "Clear" `<Button>`. On search update, calls parent callback with filter params → re-fetches API. |
| 3.4 | URL query sync | Update `Home.tsx` | Sync filters with URL search params (`?location=X&minPrice=Y&maxPrice=Z`) so browser back/forward works. Use `useSearchParams` from React Router. |

**Files created (Person B):**
- `client/src/components/listings/SearchFilters.tsx`
- `client/src/hooks/useListings.ts` (fetch listings with debounced query params)

**Files modified (Person B):**
- `client/src/pages/Home.tsx`

**Depends on:** Feature 2 (listing cards, listing data in DB)
**API Contract:** Person A ensures `GET /api/listings` handles the three query params.

---

## Feature 4: Booking Flow (MVP stories #5, #6, #8)

**Goal:** Guests can request to book, hosts can accept/decline, guests see booking history.

### Data Model

**Booking schema (Person A):**
```
{
  propertyId:      ObjectId (ref: Property, required, indexed)
  guestId:         ObjectId (ref: User, required, indexed)
  startDate:       Date (required)
  endDate:         Date (required)
  status:          String (enum: "pending" | "confirmed" | "declined" | "paid", default: "pending")
  paymentStatus:   String (enum: "unpaid" | "paid" | "refunded", default: "unpaid")
  transactionId:   String (optional)
  totalAmount:     Number (required, computed)
  createdAt:       Date (auto, immutable)
}
```

**Validation rules:**
- `endDate` must be after `startDate`
- `startDate` must be today or in the future
- No overlapping **confirmed** bookings for the same property
- Maximum stay: 30 nights

### Person A — Booking Backend

| # | Task | Endpoint | Logic | Error Cases |
|---|---|---|---|---|
| 4.1 | Create booking | `POST /api/bookings` | Body: `propertyId, startDate, endDate`. Validate dates. Calculate `totalAmount` = `pricePerNight * nights`. Check booking overlap (query confirmed bookings with overlapping dates). Save with `status: "pending"`. Return 201 + booking. | Overlap → 409 "These dates are already booked". Past start → 400. End before start → 400. Exceeds 30 nights → 400. Property not found → 404. |
| 4.2 | Guest bookings | `GET /api/bookings/my` | Find bookings where `guestId = req.user.userId`. Populate `propertyId` (title, location, photos). Sort by `createdAt` desc. Return array. | — |
| 4.3 | Host requests | `GET /api/host/requests` | Find properties where `hostId = req.user.userId`. Find bookings for those properties where `status: "pending"`. Populate `guestId` (name, email) and `propertyId` (title). Sort by `createdAt` desc. | Not a host → 403. |
| 4.4 | Accept booking | `PUT /api/bookings/:id/accept` | Find booking. Find property. Verify `property.hostId === req.user.userId`. Double-check no overlap (another guest might have booked in the meantime). Set `status: "confirmed"`. Return updated. | Not your property → 403. Not found → 404. Already processed → 400. Overlap conflict → 409. |
| 4.5 | Decline booking | `PUT /api/bookings/:id/decline` | Same ownership check. Set `status: "declined"`. Return updated. | Not your property → 403. Already processed → 400. |

**Files created (Person A):**
- `server/src/models/Booking.ts`
- `server/src/routes/bookings.ts`
- Update `server/src/index.ts` (register booking routes)
- Helpers in `server/src/lib/bookingOverlap.ts`

### Person B — Booking Frontend

| # | Task | Page/Component | Implementation |
|---|---|---|---|
| 4.6 | Booking form | Section on `ListingDetail.tsx` | "Request to Book" button → opens MUI `<Dialog>` with `<DatePicker>` (start) + `<DatePicker>` (end) from `@mui/x-date-pickers`. Shows computed total price. "Confirm Booking" `<Button>`. On success, redirect to `/bookings` with success toast. |
| 4.7 | MyBookings page | `client/src/pages/MyBookings.tsx` | Fetch `GET /api/bookings/my`. MUI `<List>` or `<Table>`. Each row: property photo (small), title, dates, total price, status `<Chip>` (pending=warning, confirmed=success, declined=error, paid=info). Click row → navigate to `/listings/:id`. Empty state: "You have no bookings yet." |
| 4.8 | HostDashboard page | `client/src/pages/HostDashboard.tsx` | Fetch `GET /api/host/requests`. MUI `<DataGrid>` or `<Card>` list. Each request shows: guest name + email, property title, dates, total price, "Accept" `<Button color="success">`, "Decline" `<Button color="error">`. On accept/decline, optimistically update UI. MUI `<Tabs>` to switch between "Pending", "Confirmed", "Declined". |

**Files created (Person B):**
- `client/src/pages/MyBookings.tsx`
- `client/src/pages/HostDashboard.tsx`
- `client/src/components/bookings/BookingForm.tsx`
- `client/src/api/bookings.ts`

**Files modified (Person B):**
- `client/src/pages/ListingDetail.tsx`
- `client/src/App.tsx` (add routes for `/bookings`, `/host/dashboard`)

**Depends on:** Feature 2 (listings exist to book), Feature 1 (auth for guest/host roles)
**API Contract:** Person A provides exact date format (`YYYY-MM-DD`?), response shapes, and error bodies.

---

## Feature 5: Mock Payment (Concern #1 from PLAN.md)

**Goal:** After host accepts a booking, guest simulates paying via a mock credit card form.

### Person A — Payment Backend

Choose one approach:

**Option A — Stripe Test Mode (recommended for realism):**

| # | Task | Endpoint | Logic |
|---|---|---|---|
| 5.1 | Create PaymentIntent | `POST /api/payments/create-payment-intent` | Takes `bookingId`. Finds booking (must be "confirmed"). Computes amount from `totalAmount`. Calls Stripe API to create PaymentIntent. Returns `{ clientSecret }` to frontend. |
| 5.2 | Confirm payment | `POST /api/payments/confirm` | Takes `bookingId`, `paymentIntentId`. Verifies with Stripe. Updates booking: `status: "paid"`, `paymentStatus: "paid"`, `transactionId`. Returns updated booking. |
| 5.3 | Refund (decline after payment) | `POST /api/payments/refund` | If host declines a booking after payment was made (edge case), create a Stripe refund. Set `paymentStatus: "refunded"`. |

**Option B — Simple mock (zero dependencies, faster):**

| # | Task | Endpoint | Logic |
|---|---|---|---|
| 5.1 (alt) | Mock pay | `POST /api/mock-payment` | Body: `bookingId, cardNumber`. Validate card is test card. Update booking `status: "paid"`, `paymentStatus: "paid"`, `transactionId: mock_${Date.now()}`. Return `{ success: true }`. |

**Files created (Person A):**
- `server/src/routes/payments.ts` (or `mock-payments.ts`)
- `server/src/lib/paymentHelpers.ts` (Stripe client init)
- `server/.env` update with `STRIPE_SECRET_KEY` (if using Stripe)

**Update Booking model** — already has `paymentStatus`, `transactionId`, `totalAmount` fields.

### Person B — Payment Frontend

| # | Task | Page/Component | Implementation |
|---|---|---|---|
| 5.4 | Payment page | `client/src/pages/Payment.tsx` (or section on MyBookings) | After host accepts booking, guest sees "Pay Now" button on `/bookings`. Click opens a payment form: MUI `<TextField>` for card number, expiry, CVC, cardholder name. "Pay $X" `<Button>`. If using Stripe: integrate Stripe Elements (CardElement) via `@stripe/react-stripe-js`. If using mock: simple form + API call. On success: MUI `<Alert severity="success">` "Payment successful!" — booking shows "paid" badge. |
| 5.5 | Payment status display | Update `MyBookings.tsx` | Show `paymentStatus` as `<Chip>` (unpaid=warning, paid=success, refunded=error). Only show "Pay Now" button when `status === "confirmed" && paymentStatus === "unpaid"`. |

**Files created (Person B):**
- `client/src/pages/Payment.tsx`
- `client/src/api/payments.ts`

**Files modified (Person B):**
- `client/src/pages/MyBookings.tsx`
- `client/src/App.tsx` (add `/payment/:bookingId` route)

**Depends on:** Feature 4 (booking must exist and be confirmed)
**API Contract:** Person A decides which payment approach and publishes the API contract.

---

## Feature 6: Polish & Edge Cases (MVP quality)

**Goal:** Handle errors gracefully, loading states, 404, responsive layout, toast notifications.

### Person A — Backend Polish

| # | Task | Details |
|---|---|---|
| 6.1 | Global error handler | Express error middleware `(err, req, res, next)`. Log stack trace in dev. Return `{ error: message }` consistently. Handle Mongoose validation errors, CastError (invalid ObjectId), duplicate key errors. |
| 6.2 | Input validation on all endpoints | Zod middleware or per-route validation. Return 400 with `{ error: string, details?: field-level errors }`. |
| 6.3 | Rate limiting | `express-rate-limit` on auth endpoints (5 attempts/min for login, 3/min for signup). |
| 6.4 | CORS config | Allow specific origin(s) from env var. |

**Files modified (Person A):**
- `server/src/index.ts` (add error middleware)
- All route files (add validation)

### Person B — Frontend Polish

| # | Task | Details |
|---|---|---|
| 6.5 | 404 page | `client/src/pages/NotFound.tsx` — MUI `<Typography variant="h1">404</Typography>`, message, "Go Home" button. |
| 6.6 | Loading states | Every page uses MUI `<Skeleton>` or `<CircularProgress>` while fetching data. |
| 6.7 | Form validation | Client-side Zod validation on all forms. MUI `<TextField error>` + `<FormHelperText>` for each field. Disable submit button while submitting. |
| 6.8 | Toast notifications | MUI `<Snackbar>` + `<Alert>` for success/error after API calls. Auto-dismiss after 4 seconds. |
| 6.9 | Responsive layout | MUI `<Container>`, `<Grid>` with `xs sm md lg` breakpoints. Test at 375px, 768px, 1200px widths. |
| 6.10 | Confirmation dialogs | MUI `<Dialog>` for destructive actions: delete listing, decline booking. |

**Files created (Person B):**
- `client/src/pages/NotFound.tsx`
- `client/src/components/ui/Toast.tsx` (Snackbar wrapper)

**Depends on:** All previous features (polish is applied everywhere)

---

## Feature 7: Reviews & Ratings (Nice-to-have #10)

**Goal:** Guests can leave reviews after completed stays. Ratings display on listings.

### Data Model

**Review schema (Person A):**
```
{
  bookingId:  ObjectId (ref: Booking, required, unique)
  guestId:    ObjectId (ref: User, required)
  propertyId: ObjectId (ref: Property, required, indexed)
  rating:     Number (required, 1-5, integer)
  text:       String (optional, max 2000 chars)
  createdAt:  Date (auto)
}
```

### Backend (Person A)

| Task | Endpoint | Logic |
|---|---|---|
| Create review | `POST /api/reviews` | Verify booking exists, belongs to guest, `endDate` has passed, `status === "paid"`. Check no duplicate review for this booking. Save. Update property's average rating (store `avgRating` on Property). |
| Get listing reviews | `GET /api/listings/:id/reviews` | Return all reviews for property, sorted by date desc, with guest name. Include average rating. |
| Get avg rating | `GET /api/listings/:id` (update) | Include `avgRating` and `reviewCount` in listing response. |

**Files created:** `server/src/models/Review.ts`, `server/src/routes/reviews.ts`
**Update:** `server/src/models/Property.ts` (add `avgRating`, `reviewCount`)

### Frontend (Person B)

| Task | Implementation |
|---|---|
| Review form | On `ListingDetail.tsx` after booking "Completed" badge. MUI `<Rating>` component (1-5 stars) + `<TextField>` for text. Submit review, show success toast. |
| Review list | Section on `ListingDetail.tsx` showing all reviews with guest avatar, name, date, stars, text. |
| Listing card update | Show star rating on `<ListingCard>` if `avgRating` exists. |

**Depends on:** Feature 4 (booking must exist and be completed)

---

## Feature 8: Amenity Filters (Nice-to-have #11)

**Goal:** Guests filter listings by amenities (wifi, parking, pets, etc.).

### Changes

**Backend (Person A):**
- Add `amenities: [String]` to Property model
- Update `GET /api/listings` to accept `?amenities=wifi,parking` — filter properties that contain ALL specified amenities (AND logic)
- Update listing create/edit validation to allow amenity strings

**Frontend (Person B):**
- Add MUI `<Checkbox>` group to `SearchFilters.tsx`: WiFi, Parking, Pets Allowed, Air Conditioning, Kitchen, Washer
- Update API call to include selected amenities in query string
- Prettify amenity display on `ListingDetail.tsx` with MUI `<Chip>` tags

**Depends on:** Feature 3 (search UI)

---

## Feature 9: Availability Calendar (Nice-to-have #12)

**Goal:** Hosts can block dates, and those dates are excluded from new booking requests.

### Changes

**Backend (Person A):**
- Add `unavailableDates: [Date]` or `UnavailableDate` model (propertyId, date)
- `POST /api/properties/:id/block-dates` — host marks dates as unavailable
- `GET /api/properties/:id/available-dates` — return list of available date ranges
- Update booking overlap check to also consider blocked dates

**Frontend (Person B):**
- Add "Availability" section on `EditListing.tsx` — MUI `<DateCalendar>` to select and block dates
- Show blocked dates visually on the booking `<DatePicker>` (grayed out)

**Depends on:** Feature 2 (listing must exist), Feature 5 (booking overlap logic)

---

## Feature 10: In-App Messaging (Nice-to-have #13)

**Goal:** Guests message hosts before booking.

### Data Model

**Message schema (Person A):**
```
{
  senderId:   ObjectId (ref: User)
  receiverId: ObjectId (ref: User)
  listingId:  ObjectId (ref: Property)
  text:       String (required, max 2000)
  read:       Boolean (default: false)
  createdAt:  Date (auto)
}
```

### Backend (Person A)

| Task | Endpoint | Logic |
|---|---|---|
| Send message | `POST /api/messages` | Body: `listingId, text`. Determine `receiverId` from listing's `hostId`. Save. Return message. |
| Get conversation | `GET /api/messages/:listingId` | Return messages between current user and the other party for this listing, sorted asc. Mark unread messages as read. |
| Get inbox | `GET /api/messages/inbox` | Return list of unique conversations for current user (group by listing + other user), with last message preview + unread count. |

### Frontend (Person B)

| Feature | Implementation |
|---|---|
| Message button | On `ListingDetail.tsx`, "Message Host" button (before booking). Opens chat dialog/page. |
| Chat view | MUI `<Paper>` with message bubbles (left=other, right=me), `<TextField>` input, send `<Button>`. Auto-scroll to bottom. |
| Inbox | `/inbox` page — list of conversations with last message preview, unread badge. |

**Depends on:** Feature 1 (auth), Feature 2 (listing exists)

---

## Feature 11: Profile Photos (Nice-to-have #14)

**Goal:** Users can upload a profile photo.

### Changes

**Backend (Person A):**
- Add `profilePhoto: String` to User model
- `POST /api/users/profile-photo` — upload via Multer, save URL, update user
- `GET /api/users/:id` — return user profile with photo

**Frontend (Person B):**
- Profile edit section in navbar dropdown (MUI `<Menu>`)
- Upload photo with preview
- Display avatar on listing detail, reviews, navbar

**Depends on:** Feature 1 (user exists)

---

## Feature 12: Admin Moderation (Nice-to-have #15)

**Goal:** Admin can view all listings and delete violating ones.

### Backend (Person A)

| Task | Endpoint | Logic |
|---|---|---|
| List all listings (admin) | `GET /api/admin/listings` | Auth + admin role check. Return all listings (including deleted flag). Paginated. |
| Delete any listing (admin) | `DELETE /api/admin/listings/:id` | Admin role check. Delete regardless of ownership. Skip active booking check (force delete). |
| Admin middleware | `server/src/middleware/adminOnly.ts` | Check `req.user.role === "admin"`. |

**Frontend (Person B):**
- `/admin/listings` page — MUI `<DataGrid>` with all listings, search/filter
- Delete button in each row with MUI `<Dialog>` confirmation
- Navbar link visible only for admin users

**Depends on:** Feature 1 (auth + role), Feature 2 (listings data)

---

## Feature Dependency Graph

```
Feature 0 (Scaffolding) ─┬─ Feature 1 (Auth) ─┬─ Feature 2 (Listings CRUD) ─┬─ Feature 3 (Search)
                           │                     │                              │
                           │                     │                              └─ Feature 8 (Amenity Filters)
                           │                     │
                           │                     ├─ Feature 4 (Booking Flow) ─┬─ Feature 5 (Payment)
                           │                     │                             │
                           │                     │                             └─ Feature 9 (Availability Calendar)
                           │                     │
                           │                     └─ Feature 7 (Reviews)
                           │
                           ├─ Feature 10 (Messaging)
                           │
                           ├─ Feature 11 (Profile Photos)
                           │
                           └─ Feature 12 (Admin)

Feature 6 (Polish) ───── Applies to everything above
```

## Suggested Sprint Plan

| Sprint | Backend (Person A) | Frontend (Person B) |
|---|---|---|
| **Sprint 1** | F0: Scaffolding + F1: Auth API + User model | F0: Scaffolding + F1: Auth UI (login/signup/context) |
| **Sprint 2** | F2: Listings CRUD + photo upload API | F2: Listings pages (create/detail/edit) + F3: Search UI |
| **Sprint 3** | F4: Booking API (overlap check, accept/decline) + F5: Payment API | F4: Booking form + MyBookings + HostDashboard + F5: Payment UI |
| **Sprint 4** | F6: Error handling, validation, rate limiting | F6: Polish (404, loading, toasts, responsive) |
| **Sprint 5+** | Nice-to-haves: F7 (reviews), F8 (amenities), F9 (calendar) | Nice-to-haves: corresponding UI for each |

---

## Backend-First API Contract Process

To keep Person A and Person B working in parallel:

1. **Person A** defines the endpoint signature (method, path, request body, response body, error codes) in a shared doc BEFORE implementing
2. **Person B** uses those contracts to build the frontend with Axios calls, even before the backend is ready
3. **Person B** can mock API responses during development using a simple JSON file or MSW (Mock Service Worker) for zero-wait integration

**Recommended: Use an `api/contracts.ts` shared file** that both reference, or keep a simple markdown table for each feature.

Example contract format:
```md
## POST /api/bookings
- Auth: Required (guest role)
- Body: { propertyId: string, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
- Success (201): { booking: Booking }
- Errors: 400 (validation), 401 (unauth), 409 (overlap)
```
