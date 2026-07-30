# CozyStay — Peer-to-Peer Property Rental Platform

## 1. Vision

CozyStay is a web app that lets everyday property owners list their spare rooms, apartments, or houses for short-term rental, and lets travelers search, view, and request to book those stays directly online. It's for hosts who want a simple way to earn money from unused space, and guests who want an easier, more personal alternative to hotels or slow, informal arrangements like Facebook groups and word-of-mouth.

**This is a success if a user can list a property in under 5 minutes and receive a booking request from a guest.**

## 2. Users

- **Maria, the Host** — Owns a spare apartment she wants to rent out on weekends she's away. Wants an easy way to list it with photos and price, and to see who wants to book without a lot of back-and-forth.
- **Jake, the Guest** — Traveling for a friend's wedding, wants to quickly compare a few properties by price and location and book one that fits his dates.
- **Admin** — Needs to review flagged listings and remove ones that violate rules (fake, offensive, duplicate).

## 3. User Stories


### Must-have (MVP)

1. As a **guest**, I want to sign up and log in, so that I can save my bookings and identity.
   **Done when:**
   - Email + password signup works
   - Login persists a session
   - Invalid credentials show an error
   - Passwords are stored hashed, not plaintext

2. As a **host**, I want to create a listing with title, description, price, location, and photos, so that guests can find and evaluate my property.
   **Done when:**
   - Form requires title, price, location, and at least 1 photo
   - Listing saves to the database
   - Listing appears immediately in search results
   - Host can view their own listing after creating it

3. As a **guest**, I want to browse/search all available listings, so that I can find a place that fits my needs.
   **Done when:**
   - Listings page loads all active properties
   - Search filters by location and/or price
   - Empty results show a friendly message
   - Results show photo, title, price per night

4. As a **guest**, I want to view a listing's full details, so that I can decide whether to book it.
   **Done when:**
   - Detail page shows all photos, description, price, location, and host name
   - A broken/missing listing shows a 404, not a crash

5. As a **guest**, I want to request to book a property for specific dates, so that I can reserve my stay.
   **Done when:**
   - Booking form requires start and end date
   - End date must be after start date
   - Booking is rejected if it overlaps an existing confirmed booking for that property
   - Booking is saved with status "pending"

6. As a **host**, I want to see booking requests for my properties, so that I can accept or decline them.
   **Done when:**
   - Host dashboard lists all pending requests
   - Host can accept or decline
   - Accepting marks the booking "confirmed" and blocks those dates for other guests
   - Declining marks it "declined"

7. As a **host**, I want to edit or delete my own listing, so that I can keep my information accurate.
   **Done when:**
   - Only the listing's owner can edit/delete it
   - Edits save and reflect immediately
   - Delete removes it from search results
   - A listing with active bookings warns before deletion

8. As a **guest**, I want to see my own booking history, so that I know what I've requested or booked.
   **Done when:**
   - "My Bookings" page lists all bookings with status (pending/confirmed/declined)
   - Clicking one shows the property details

9. As a **user**, I want to log out, so that I can secure my account on shared devices.
   **Done when:**
   - Logout clears the session
   - User is redirected to the home/login page
   - Protected pages are no longer accessible without logging back in

### Nice-to-have

10. As a **guest**, I want to leave a review and rating after a completed stay, so that I can help other guests choose.
    **Done when:**
    - Review only allowed after booking end date has passed
    - Review requires a rating (1-5) and optional text
    - Average rating displays on the listing

11. As a **guest**, I want to filter search results by amenities (wifi, parking, pets allowed), so that I can narrow down my choices.
    **Done when:**
    - Listings have amenity tags
    - Filter checkboxes update results
    - Multiple filters combine with AND logic

12. As a **host**, I want to set a calendar of blocked/unavailable dates manually, so that I can reserve dates for personal use.
    **Done when:**
    - Host can mark specific dates unavailable
    - Those dates are excluded from guest booking options

13. As a **guest**, I want to message a host with questions before booking, so that I can clarify details.
    **Done when:**
    - Guest can send a message tied to a listing
    - Host sees it in an inbox
    - Messages are timestamped and ordered

14. As a **user**, I want to upload a profile photo, so that my identity feels more personal and trustworthy.
    **Done when:**
    - Photo uploads and displays on profile and listings
    - Oversized files are rejected with an error

15. As an **admin**, I want to remove a listing that violates policy, so that the platform stays trustworthy.
    **Done when:**
    - Admin-only view lists all listings
    - Admin can delete any listing
    - Deleted listings disappear from search immediately

## 4. Scope

**Must-have (MVP):**
Signup/login, create/edit/delete listing, browse & search listings, view listing detail, request booking (with date-overlap prevention), host accept/decline booking, view booking history, logout.

**Nice-to-have:**
Reviews & ratings, amenity filters, host-managed availability calendar, in-app messaging, profile photos, admin moderation.

**Non-goals (explicitly not building):**
- Real payment processing (no Stripe/PayPal — bookings are "requests," no money changes hands)
- Identity verification / background checks
- Native mobile app (web only)
- Multi-language / multi-currency support
- Real-time chat (any messaging is store-and-refresh, not WebSocket live chat)
- Map-based visual search (list/grid view only)

## 5. Key Screens / Mockups

[Login/Signup] → [Search/Home] → [Listing Detail] → [Booking Request Form] → [My Bookings]
↓
[Host Dashboard] → [Create/Edit Listing]
↓
[Booking Requests (host view)]


- **Home/Search** — grid of listing cards (photo, title, price, location) + search/filter bar
- **Listing Detail** — photo gallery, description, price, "Request to Book" button
- **Booking Request Form** — date pickers, confirm button
- **My Bookings** (guest) — list of past/pending/confirmed bookings
- **Host Dashboard** — host's own listings + incoming booking requests with accept/decline buttons
- **Create/Edit Listing** — form for title, description, price, location, photo URL entry

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Flask (Python 3) |
| Database | MySQL 8+ (local) |
| ORM | SQLAlchemy + PyMySQL |
| Auth | JWT (Flask-JWT-Extended) + Google OAuth |
| Migration | Flask-Migrate (Alembic) |

## Project Structure

```
CozyStay-14/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Navbar, PropertyCard, ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # 11 page components
│   │   ├── styles/          # Plain CSS
│   │   └── types/           # TypeScript interfaces
│   └── .env                 # VITE_GOOGLE_CLIENT_ID
├── server/                  # Flask backend
│   ├── app/
│   │   ├── models/          # SQLAlchemy models (User, Property, Booking, Review)
│   │   └── routes/          # auth, properties, bookings, users, admin
│   ├── .env                 # DATABASE_URL, JWT secret, GOOGLE_CLIENT_ID
│   ├── schema.sql           # MySQL CREATE TABLE statements
│   └── seed.py              # Test data script
├── TODO.md
├── SETUP.md                 # Local development setup guide
└── HISTORY.md               # Project changelog
```

## 6. Data & Rules

### Entities

**User**
- id
- name
- email
- password_hash
- role (host/guest)
- created_at

**Property**
- id
- host_id (FK → User)
- title
- description
- price_per_night
- location
- photos (array/urls)
- created_at

**Booking**
- id
- property_id (FK → Property)
- guest_id (FK → User)
- start_date
- end_date
- status (pending/confirmed/declined)
- created_at

**Review** *(nice-to-have)*
- id
- booking_id
- rating (1-5)
- text
- created_at

### Rules

- A booking's `start_date` must be before `end_date`.
- A property cannot have two *confirmed* bookings with overlapping date ranges.
- Only the host who owns a listing can edit or delete it.
- A guest can only leave a review for a booking they completed (end_date has passed, status confirmed).
- Email must be unique per user.
- A listing requires at least title, price, location, and one photo to be published.

---
