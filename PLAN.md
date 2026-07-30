# CozyStay — Implementation Plan

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | **React 18** (Vite) + **React Router v6** |
| UI Library | **Material UI (MUI)** — complete component library |
| Backend | **Node.js** + **Express** |
| Database | **MongoDB** via **Mongoose** |
| Auth | **JWT** (jsonwebtoken + bcrypt) |
| File Upload | **Multer** (local `uploads/` folder) |
| Validation | **Zod** (shared) |
| HTTP Client | **Axios** (frontend → backend) |
| Testing | **Vitest** (unit) + **Playwright** (E2E) |

**Why this stack:** Decoupled React frontend and Express API gives clear separation of concerns. MongoDB's document model maps naturally to the property/booking domain. JWT auth is straightforward and self-contained. MUI provides production-ready components (Data Grid, Date Pickers, Cards, Dialogs, Steppers) out of the box, saving massive UI development time.

### MUI Setup Instructions

```bash
# Inside client/ directory:
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @mui/x-date-pickers dayjs    # Date picker components
npm install @mui/x-data-grid             # For host dashboard table (optional)
```

Wrap the app with theme provider in `main.tsx` or `App.tsx`:
```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
});

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
```

**No Tailwind needed** — MUI covers styling entirely via its `sx` prop, `styled` API, and built-in theme system.

---

## Project Structure

```
cozystay/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx             # Router setup + MUI ThemeProvider
│   │   ├── theme.ts            # MUI theme customization
│   │   ├── api/                # Axios instances & API calls
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── listings.ts
│   │   │   └── bookings.ts
│   │   ├── components/
│   │   │   ├── listings/       # ListingCard, ListingGrid, SearchFilters
│   │   │   ├── bookings/       # BookingForm, BookingList
│   │   │   └── host/           # DashboardWidget, BookingRequestCard
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── ListingDetail.tsx
│   │   │   ├── CreateListing.tsx
│   │   │   ├── EditListing.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   ├── HostDashboard.tsx
│   │   │   └── NotFound.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useListings.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   └── validations.ts  # Zod schemas (shared)
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── format.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── index.ts            # App entry, Express setup
│   │   ├── config/
│   │   │   └── db.ts           # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Property.ts
│   │   │   └── Booking.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── listings.ts
│   │   │   ├── bookings.ts
│   │   │   └── upload.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── hostOnly.ts     # Role check
│   │   │   └── upload.ts       # Multer config
│   │   ├── lib/
│   │   │   └── validations.ts  # Zod schemas (shared)
│   │   └── types/
│   │       └── index.ts
│   ├── uploads/                # Uploaded images
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                     # Shared code (optional)
│   └── validations.ts          # Zod schemas used by both
├── .gitignore
└── README.md
```

---

## Milestones

### Milestone 1: Foundation

**Tasks:**
1. Initialize client with Vite + React + TypeScript + install MUI packages
2. Initialize server with Express + TypeScript + Mongoose
3. Set up MongoDB connection (Mongoose)
4. Create `User` Mongoose model (name, email, passwordHash, role, createdAt)
5. Implement signup endpoint (`POST /api/auth/signup`) — hash password with bcrypt
6. Implement login endpoint (`POST /api/auth/login`) — return JWT
7. Auth middleware (`verifyToken`) for protected routes
8. Client: AuthContext + localStorage JWT persistence
9. Client: Login page, Signup page, redirect on auth
10. Client: MUI `<AppBar>` navbar with login/logout, protected route wrapper

**Verification:**
- Can sign up, log in, receive JWT; protected pages redirect to login; log out clears token

---

### Milestone 2: Listings CRUD

**Tasks:**
1. Create `Property` Mongoose model (hostId, title, description, pricePerNight, location, photos[], createdAt)
2. `POST /api/listings` — create listing (auth required, host role)
3. `GET /api/listings/:id` — get single listing with host name
4. `PUT /api/listings/:id` — edit listing (owner only)
5. `DELETE /api/listings/:id` — delete listing (owner only, warn if active bookings)
6. Multer upload route (`POST /api/upload`) — save to `server/uploads/`
7. Client: CreateListing page (MUI `<TextField>`, `<Button>`, `<Grid>`, photo upload with `<Dropzone>` or basic `<input>`)
8. Client: ListingDetail page — MUI `<Card>`, `<ImageList>`, `<Chip>` for price, host name
9. Client: EditListing page (pre-filled MUI form, only owner can access)
10. Client: Delete button with MUI `<Dialog>` confirmation modal

**Verification:**
- Host creates listing with photos; detail page shows it; only owner can edit/delete; delete warns on active bookings

---

### Milestone 3: Browse & Search

**Tasks:**
1. `GET /api/listings` — list all listings with optional query params (`location`, `minPrice`, `maxPrice`)
2. Client: Home page renders MUI `<Grid>` of `<Card>` components (photo, title, price, location)
3. MUI `<TextField>` + `<InputAdornment>` search bar filters by location (sends query to API)
4. Price range filter — MUI `<Slider>` or two `<TextField>` inputs
5. Empty state: MUI `<Alert>` or `<Typography>` "No listings found" message
6. Each card is a link to `/listings/:id`

**Verification:**
- All listings load on home; filters query the API; empty state shows when no matches; cards link to detail

---

### Milestone 4: Booking Flow

**Tasks:**
1. Create `Booking` Mongoose model (propertyId, guestId, startDate, endDate, status, createdAt)
2. `POST /api/bookings` — create booking request (auth required)
   - Validate: endDate > startDate, no overlap with confirmed bookings
   - Save status "pending"
3. `GET /api/bookings/my` — guest's bookings
4. `GET /api/host/requests` — host sees pending requests for their listings
5. `PUT /api/bookings/:id/accept` — host accepts → status "confirmed"
6. `PUT /api/bookings/:id/decline` — host declines → status "declined"
7. Client: "Request to Book" `<Button>` + MUI `<DatePicker>` (from `@mui/x-date-pickers`) on listing detail
8. Client: HostDashboard page — MUI `<DataGrid>` or `<List>` with accept `<Button>` (green) / decline `<Button>` (red)
9. Client: MyBookings page listing all guest bookings with MUI `<Chip>` status badges (pending/confirmed/declined)
10. Overlap check: query `Booking.find({ propertyId, status: "confirmed", startDate: { $lt: inputEnd }, endDate: { $gt: inputStart } })`

**Verification:**
- Guest requests booking; overlap is rejected; host sees and accepts/declines; dates blocked; history page works

---

### Milestone 5: Polish & Edge Cases

**Tasks:**
1. 404 page for missing listing IDs (MUI `<Typography>` + illustration)
2. Error handling: backend returns consistent `{ error: message }` shape
3. Client: MUI `<CircularProgress>` or `<Skeleton>` during API calls
4. Form validation feedback — MUI `<TextField error>` + `<FormHelperText>` with Zod errors
5. MUI `<Grid>` with `xs sm md lg` breakpoints (mobile-friendly by default)
6. MUI `<Snackbar>` + `<Alert>` for success/error toast notifications

**Verification:**
- No crashes on bad data; mobile layout works; all edge cases handled gracefully

---

### Milestone 6: Nice-to-Have Features

| Feature | Tasks |
|---|---|
| **Reviews & Ratings** | Review model, `POST /api/reviews` (only after endDate passed + status confirmed), avg rating on listing |
| **Amenity Filters** | Add `amenities: string[]` to Property, search with `?amenities=wifi,parking` |
| **Availability Calendar** | UnavailableDate model/array on Property, host marks dates, booking excludes them |
| **In-App Messaging** | Message model, `GET /api/messages/:conversationId`, `POST /api/messages` |
| **Profile Photos** | Upload endpoint, display on profile and listing detail |
| **Admin Moderation** | Admin role middleware, admin-only route to list/delete any listing |

---

## Data Model (Mongoose Schemas)

### User
```
{
  name:         String (required)
  email:        String (required, unique)
  passwordHash: String (required)
  role:         String (enum: "guest" | "host" | "admin", default: "guest")
  createdAt:    Date (auto)
}
```

### Property
```
{
  hostId:        ObjectId (ref: User, required)
  title:         String (required)
  description:   String (required)
  pricePerNight: Number (required)
  location:      String (required)
  photos:        [String] (at least 1)
  createdAt:     Date (auto)
}
```

### Booking
```
{
  propertyId:      ObjectId (ref: Property, required)
  guestId:         ObjectId (ref: User, required)
  startDate:       Date (required)
  endDate:         Date (required)
  status:          String (enum: "pending" | "confirmed" | "declined" | "paid", default: "pending")
  paymentStatus:   String (enum: "unpaid" | "paid" | "refunded", default: "unpaid")
  transactionId:   String (optional, mock payment reference)
  totalAmount:     Number (computed: pricePerNight × nights)
  createdAt:       Date (auto)
}
```

**Booking overlap query (MongoDB):**
```js
const overlapping = await Booking.findOne({
  propertyId,
  status: "confirmed",
  startDate: { $lt: new Date(endDate) },
  endDate: { $gt: new Date(startDate) }
});
if (overlapping) throw new Error("Dates already booked");
```

---

## API Routes Summary

| Method | Route | Auth | Body/Params | Response |
|---|---|---|---|---|
| POST | /api/auth/signup | No | name, email, password | { token, user } |
| POST | /api/auth/login | No | email, password | { token, user } |
| GET | /api/auth/me | JWT | — | { user } |
| GET | /api/listings | No | ?location, ?minPrice, ?maxPrice | Property[] |
| GET | /api/listings/:id | No | — | Property |
| POST | /api/listings | Host | Form fields + photos | Property |
| PUT | /api/listings/:id | Owner | Form fields | Property |
| DELETE | /api/listings/:id | Owner | — | { message } |
| POST | /api/upload | Auth | multipart/form-data | { url } |
| POST | /api/bookings | Guest | propertyId, startDate, endDate | Booking |
| GET | /api/bookings/my | Guest | — | Booking[] |
| GET | /api/host/requests | Host | — | Booking[] (populated) |
| PUT | /api/bookings/:id/accept | Host | — | Booking |
| PUT | /api/bookings/:id/decline | Host | — | Booking |
| POST | /api/payments/create-payment-intent | Guest | amount | { clientSecret } |
| POST | /api/payments/confirm | Guest | bookingId, paymentIntentId | Booking (status: "paid") |
| POST | /api/mock-payment | Guest | cardNumber, amount | { success, transactionId } |

---

## Client Route Map

```
/                    → Home (search + listing grid)
/login               → Login page
/signup              → Signup page
/listings/:id        → Listing detail
/listings/new        → Create listing (host only)
/listings/:id/edit   → Edit listing (owner only)
/bookings            → My Bookings (guest only)
/host/dashboard      → Host dashboard (host only)
*                    → 404 page
```

---

## MUI Component Mapping (Quick Reference)

| Screen | Key MUI Components |
|---|---|
| Login / Signup | `<TextField>`, `<Button>`, `<Paper>`, `<Typography>`, `<Alert>` (errors) |
| Home / Search | `<Grid>`, `<Card>`, `<CardMedia>`, `<CardContent>`, `<TextField>` (search), `<Slider>` (price) |
| Listing Detail | `<Card>`, `<ImageList>`, `<ImageListItem>`, `<Chip>` (price), `<Avatar>` (host), `<Button>` (book) |
| Create / Edit Listing | `<TextField>`, `<Button>`, `<Grid>`, `<IconButton>` (photo remove), `<Dialog>` (confirm) |
| My Bookings | `<Table>` or `<List>`, `<Chip>` (status), `<Link>` |
| Host Dashboard | `<DataGrid>` (requests table), `<Button>` (accept/decline), `<Tabs>` (pending/confirmed) |
| Notifications | `<Snackbar>` + `<Alert>` |
| Navbar | `<AppBar>`, `<Toolbar>`, `<Typography>`, `<Button>`, `<Avatar>` (logged-in user) |

---

## Key Architectural Decisions

1. **JWT stored in localStorage** — Simple, works with Bearer token in Axios interceptor. For production, consider httpOnly cookies.

2. **MUI theme in `theme.ts`** — Customize palette (primary/secondary colors), typography, and component defaults in one file. Import and wrap in `App.tsx`.

3. **Axios interceptor** — Automatically attaches `Authorization: Bearer <token>` to every request and handles 401 redirects.

4. **Protected routes client-side** — `<ProtectedRoute>` wrapper component checks auth context; server also verifies JWT on every protected endpoint.

5. **MongoDB overlap check** — Uses `$lt` / `$gt` date comparison on confirmed bookings to prevent double-booking.

6. **Photo uploads via Multer** — Saved to `server/uploads/`, served statically via Express. For production, swap to cloud storage (S3, Cloudinary).

7. **No payment processing** — Bookings are requests only; no money changes hands (per README non-goals).

---

## Concerns & Decisions

### 1. Should payment service be included?

**Verdict: Yes — for a realistic POC, add a mock payment step.**

The README lists payments as a non-goal ("no money changes hands"), but a booking platform feels incomplete without it. For the POC, bookings will remain "requests," but we add a **simulated payment step** in the booking flow where the guest enters mock card details and the system validates them against a test gateway. No real money is involved, but the UX of selecting dates → paying → confirmation is preserved.

**How it fits:** After host accepts a booking (status → "confirmed"), the guest sees a "Make Payment" step. Entering Stripe test card `4242 4242 4242 4242` succeeds. This keeps the core flow intact without requiring real merchant accounts.

---

### 2. Credibility & trust mechanisms

| Mechanism | Implementation | MVP / Nice-to-have |
|---|---|---|
| **Email verification** | Send confirmation link on signup; unverified users get a badge | Nice-to-have |
| **Review & rating system** | 1–5 stars + text, only after completed stay | Nice-to-have (item 10) |
| **Profile photos** | Avatar on listings and booking requests | Nice-to-have (item 14) |
| **Verification badge** | "Email verified" / "ID verified" flag on User model, displayed on profile | Nice-to-have |
| **Listing history** | Show host's total listings, member since date, response rate | MVP (data already exists) |
| **Host phone/ID verification** | Optional upload of government ID during host registration; admin reviews | Nice-to-have |
| **Booking deposit hold** | Mock a pre-authorization hold via Stripe at booking time — refunded if host declines | Nice-to-have |
| **Reporting / flagging** | Guest can flag a listing; admin reviews and removes if needed | Nice-to-have (item 15) |

**MVP recommendation:** Focus on profile photos + review system first. These give the highest trust-per-effort ratio.

---

### 3. Open-source tools to mock payment mechanisms

| Tool | Type | Cost | How it works |
|---|---|---|---|
| **Stripe Test Mode** | Sandbox (proprietary, free) | Free | Uses test API keys + test card numbers (`4242...`). No real money. Full charge/refund/dispute simulation. Create account at Stripe.com, get test keys in 2 minutes. |
| **PayPal Sandbox** | Sandbox (proprietary, free) | Free | Similar to Stripe — test buyer/seller accounts, mock payments. Requires PayPal developer account. |
| **Braintree Sandbox** | Sandbox (proprietary, free) | Free | PayPal-owned. Test credit cards, PayPal payments. |
| **Build your own** | Custom Express endpoint | Free | Simplest option: `POST /api/mock-payment` that always returns `{ success: true }` after a 1-second delay. No external dependency. |

**Recommendation for this POC:** Use **Stripe Test Mode** — it takes 5 minutes to set up, has the best developer experience, and the test card `4242 4242 4242 4242` is universally recognized. The Node.js library (`stripe`) is well-documented.

```bash
npm install stripe
```

```ts
// server/src/routes/payments.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // test key

app.post('/api/payments/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

**Alternative (simplest):** Build a mock endpoint that returns success — zero dependencies, zero setup:

```ts
app.post('/api/mock-payment', (req, res) => {
  const { cardNumber } = req.body;
  if (cardNumber === '4242424242424242') {
    res.json({ success: true, transactionId: `mock_${Date.now()}` });
  } else {
    res.status(400).json({ error: 'Card declined' });
  }
});
```

---

### 4. Navigation & free POC hosting

**Navigation** — Already built into the plan via **React Router v6**:

```tsx
// client/src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/listings/:id" element={<ListingDetail />} />
    <Route path="/listings/new" element={<ProtectedRoute role="host"><CreateListing /></ProtectedRoute>} />
    <Route path="/listings/:id/edit" element={<ProtectedRoute role="host"><EditListing /></ProtectedRoute>} />
    <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
    <Route path="/host/dashboard" element={<ProtectedRoute role="host"><HostDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

React Router is free, client-side, and requires no server configuration. No paid service needed.

**Free hosting for POC:**

| Service | Free Tier | What to host |
|---|---|---|
| **Render** | Node.js web service (free sleeps after inactivity), static sites | Backend (Express) |
| **Railway** | $5 credit/month, enough for small POC | Backend + can serve frontend |
| **Fly.io** | Free allowance of 3 shared VMs | Backend |
| **Cyclic.sh** | Free tier for Node.js apps (cold starts) | Backend |
| **Vercel** | Free for static + serverless functions | Frontend (React) |
| **Netlify** | Free static hosting | Frontend (React) |
| **MongoDB Atlas** | Free 512MB shared cluster | Database |

**Recommended free stack for POC:**

```
Frontend (React)   →  Vercel or Netlify (free)
Backend (Express)  →  Render (free, spins down after inactivity)
Database (MongoDB) →  MongoDB Atlas (free 512MB cluster)
```

**Total cost: $0.** The backend on Render will cold-start (~5–10 seconds) after inactivity, but this is acceptable for a POC.

---

## Testing Strategy

- **Unit (Vitest):** Validation logic, booking overlap detection, utility functions
- **Integration:** Mongoose model tests with in-memory MongoDB (`mongodb-memory-server`)
- **E2E (Playwright):** Critical flows: signup → create listing → search → book → accept

---

## Definition of Done

All 9 MVP user stories must be implemented and verifiable:
1. Signup/login/logout with JWT persistence
2. Host creates listing with photos
3. Guest browses and searches listings
4. Guest views listing detail
5. Guest requests booking with date validation
6. Host accepts/declines booking requests
7. Host edits/deletes own listing
8. Guest sees booking history
9. All protected routes redirect when unauthenticated
