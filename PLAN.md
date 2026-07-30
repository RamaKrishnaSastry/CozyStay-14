# CozyStay — Implementation Plan

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | **React 18** (Vite) + **React Router v6** |
| UI Library | **Material UI (MUI)** — complete component library |
| Backend | **Python 3.11+** + **Flask** |
| Database | **MySQL 8** via **SQLAlchemy** (ORM) + **Alembic** (migrations) |
| Auth | **JWT** (PyJWT + Werkzeug bcrypt) |
| File Upload | **Flask file handling** (local `uploads/` folder) |
| Validation | **Marshmallow** (schemas & deserialization) |
| HTTP Client | **Axios** (frontend → backend) |
| Testing | **Pytest** (unit) + **Playwright** (E2E) |
| WSGI | **Gunicorn** (production) |

**Why this stack:** Decoupled React frontend and Flask API gives clear separation of concerns. MySQL's relational model with foreign keys maps naturally to the property/booking domain with referential integrity. SQLAlchemy is the mature Python ORM for MySQL. JWT auth is straightforward and self-contained. MUI provides production-ready components out of the box, saving massive UI development time.

### Flask Setup Instructions

```bash
# Inside server/ directory:
python -m venv venv
venv\Scripts\activate      # Windows
pip install flask flask-cors flask-sqlalchemy flask-migrate flask-jwt-extended
pip install marshmallow marshmallow-sqlalchemy
pip install mysqlclient    # or pymysql
pip install python-dotenv
pip install gunicorn
pip install pytest
```

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
├── server/                     # Flask backend
│   ├── app/
│   │   ├── __init__.py         # App factory (create_app)
│   │   ├── config.py           # Config classes (MySQL URI, JWT secret)
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── property.py
│   │   │   ├── booking.py
│   │   │   └── review.py
│   │   ├── routes/             # Flask Blueprints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── properties.py
│   │   │   ├── bookings.py
│   │   │   ├── users.py
│   │   │   ├── admin.py
│   │   │   ├── reviews.py
│   │   │   ├── payments.py
│   │   │   └── upload.py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # JWT decorators
│   │   │   └── upload.py       # File upload helpers
│   │   ├── schemas/            # Marshmallow schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── property.py
│   │   │   └── booking.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── errors.py       # Error handlers
│   │       └── helpers.py      # Booking overlap, rating helpers
│   ├── migrations/             # Alembic migration files
│   ├── uploads/                # Uploaded images
│   ├── app.py                  # Entry point (run_app)
│   ├── requirements.txt
│   ├── .env
│   └── alembic.ini
│
├── .gitignore
└── README.md
```

---

## Milestones

### Milestone 1: Foundation

**Tasks:**
1. Initialize client with Vite + React + TypeScript + install MUI packages
2. Initialize Flask app with create_app factory pattern + config
3. Set up MySQL database with SQLAlchemy + Alembic migrations
4. Create `User` SQLAlchemy model (id, name, email, password_hash, role, profile_photo, created_at)
5. Implement signup endpoint (`POST /api/auth/register`) — hash password with Werkzeug
6. Implement login endpoint (`POST /api/auth/login`) — return JWT (flask-jwt-extended)
7. Auth middleware (@jwt_required decorator) for protected routes
8. Client: AuthContext + localStorage JWT persistence
9. Client: Login page, Signup page, redirect on auth
10. Client: MUI `<AppBar>` navbar with login/logout, protected route wrapper

**Verification:**
- Can sign up, log in, receive JWT; protected pages redirect to login; log out clears token

---

### Milestone 2: Listings CRUD

**Tasks:**
1. Create `Property` SQLAlchemy model (id, host_id FK, title, description, price_per_night, location, photos JSON, amenities JSON, is_active, created_at)
2. `POST /api/properties` — create listing (auth required, host role)
3. `GET /api/properties/:id` — get single listing with host name
4. `PUT /api/properties/:id` — edit listing (owner only)
5. `DELETE /api/properties/:id` — delete listing (owner only, warn if active bookings)
6. File upload route (`POST /api/upload`) — save to `server/uploads/`
7. Client: CreateListing page (MUI `<TextField>`, `<Button>`, `<Grid>`, photo upload with `<Dropzone>` or basic `<input>`)
8. Client: ListingDetail page — MUI `<Card>`, `<ImageList>`, `<Chip>` for price, host name
9. Client: EditListing page (pre-filled MUI form, only owner can access)
10. Client: Delete button with MUI `<Dialog>` confirmation modal

**Verification:**
- Host creates listing with photos; detail page shows it; only owner can edit/delete; delete warns on active bookings

---

### Milestone 3: Browse & Search

**Tasks:**
1. `GET /api/properties` — list all listings with optional query params (`location`, `min_price`, `max_price`)
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
1. Create `Booking` SQLAlchemy model (id, property_id FK, guest_id FK, start_date, end_date, status, created_at)
2. `POST /api/bookings` — create booking request (auth required)
   - Validate: end_date > start_date, no overlap with confirmed bookings
   - Save status "pending"
3. `GET /api/bookings/my` — guest's bookings
4. `GET /api/bookings/requests` — host sees pending requests for their listings
5. `PUT /api/bookings/:id/respond` — host accepts → status "confirmed"
6. `PUT /api/bookings/:id/decline` — host declines → status "declined"
7. Client: "Request to Book" `<Button>` + MUI `<DatePicker>` (from `@mui/x-date-pickers`) on listing detail
8. Client: HostDashboard page — MUI `<DataGrid>` or `<List>` with accept `<Button>` (green) / decline `<Button>` (red)
9. Client: MyBookings page listing all guest bookings with MUI `<Chip>` status badges (pending/confirmed/declined)
10. Overlap check: SQL `WHERE property_id = ? AND status = 'confirmed' AND start_date < ? AND end_date > ?`

**Verification:**
- Guest requests booking; overlap is rejected; host sees and accepts/declines; dates blocked; history page works

---

### Milestone 5: Polish & Edge Cases

**Tasks:**
1. 404 page for missing listing IDs (MUI `<Typography>` + illustration)
2. Error handling: backend returns consistent `{ error: message }` shape
3. Client: MUI `<CircularProgress>` or `<Skeleton>` during API calls
4. Form validation feedback — MUI `<TextField error>` + `<FormHelperText>` with Marshmallow/Zod errors
5. MUI `<Grid>` with `xs sm md lg` breakpoints (mobile-friendly by default)
6. MUI `<Snackbar>` + `<Alert>` for success/error toast notifications

**Verification:**
- No crashes on bad data; mobile layout works; all edge cases handled gracefully

---

### Milestone 6: Nice-to-Have Features

| Feature | Tasks |
|---|---|
| **Reviews & Ratings** | Review model, `POST /api/reviews` (only after end_date passed + status confirmed), avg rating on listing |
| **Amenity Filters** | Add `amenities` JSON to Property, search with `?amenities=wifi,parking` |
| **Availability Calendar** | Unavailable dates JSON on Property, host marks dates, booking excludes them |
| **In-App Messaging** | Message model, `GET /api/messages/:conversation_id`, `POST /api/messages` |
| **Profile Photos** | Upload endpoint, display on profile and listing detail |
| **Admin Moderation** | Admin role middleware, admin-only route to list/delete any listing |

---

## Data Model (MySQL / SQLAlchemy)

### Entity-Relationship Diagram (Text)

```
┌─────────────────┐       ┌───────────────────┐       ┌──────────────────┐
│      User       │       │     Property       │       │     Booking      │
├─────────────────┤       ├───────────────────┤       ├──────────────────┤
│ id (PK, INT AI) │─┐     │ id (PK, INT AI)   │───┐   │ id (PK, INT AI)  │
│ name (VARCHAR)  │ │     │ host_id (FK INT)  │┄─┼───│ property_id (FK) │
│ email (VARCHAR) │ │     │ title (VARCHAR)   │  │   │ guest_id (FK)    │
│ password (VARCHAR)│     │ description (TEXT)│  │   │ start_date (DATE)│
│ role (ENUM)     │ │     │ price_per_night   │  │   │ end_date (DATE)  │
│ profile_photo   │ │     │ location (VARCHAR)│  │   │ status (ENUM)    │
│ created_at      │ │     │ photos (JSON)     │  │   │ created_at       │
└─────────────────┘ │     │ amenities (JSON)  │  │   └──────────────────┘
                    │     │ is_active (BOOL)  │  │
                    │     │ created_at        │  │
                    │     └───────────────────┘  │
                    │                            │
                    │     ┌──────────────────┐   │
                    │     │     Review       │   │
                    │     ├──────────────────┤   │
                    └─────│ user_id (FK INT) │   │
                          │ property_id (FK) ├───┘
                          │ booking_id (FK)  │
                          │ rating (TINYINT) │
                          │ text (TEXT)      │
                          │ created_at       │
                          └──────────────────┘
```

### Detailed MySQL Schema (DDL)

```sql
-- ──────────────────────────────────────────────
-- Users
-- ──────────────────────────────────────────────
CREATE TABLE users (
    id            INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('guest', 'host', 'admin') NOT NULL DEFAULT 'guest',
    profile_photo VARCHAR(512)  DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────
-- Properties
-- ──────────────────────────────────────────────
CREATE TABLE properties (
    id              INT           AUTO_INCREMENT PRIMARY KEY,
    host_id         INT           NOT NULL,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT          NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    location        VARCHAR(255)  NOT NULL,
    photos          JSON          NOT NULL,
    amenities       JSON          DEFAULT NULL,
    is_active       TINYINT(1)    NOT NULL DEFAULT 1,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_properties_host FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_properties_host (host_id),
    INDEX idx_properties_location (location),
    INDEX idx_properties_price (price_per_night),
    INDEX idx_properties_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────
-- Bookings
-- ──────────────────────────────────────────────
CREATE TABLE bookings (
    id          INT       AUTO_INCREMENT PRIMARY KEY,
    property_id INT       NOT NULL,
    guest_id    INT       NOT NULL,
    start_date  DATE      NOT NULL,
    end_date    DATE      NOT NULL,
    status      ENUM('pending', 'confirmed', 'declined', 'paid') NOT NULL DEFAULT 'pending',
    created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookings_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_guest    FOREIGN KEY (guest_id)    REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bookings_property (property_id),
    INDEX idx_bookings_guest (guest_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_dates (property_id, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────
-- Reviews (nice-to-have)
-- ──────────────────────────────────────────────
CREATE TABLE reviews (
    id          INT       AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT       NOT NULL UNIQUE,
    user_id     INT       NOT NULL,
    property_id INT       NOT NULL,
    rating      TINYINT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text        TEXT      DEFAULT NULL,
    created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_reviews_property (property_id),
    INDEX idx_reviews_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### SQLAlchemy Models (Python)

```python
# app/models/user.py
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('guest', 'host', 'admin'), nullable=False, default='guest')
    profile_photo = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    properties = db.relationship('Property', backref='host', lazy='dynamic')
    bookings = db.relationship('Booking', backref='guest', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'profile_photo': self.profile_photo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
```

```python
# app/models/property.py
from app import db

class Property(db.Model):
    __tablename__ = 'properties'

    id = db.Column(db.Integer, primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_per_night = db.Column(db.Numeric(10, 2), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    photos = db.Column(db.JSON, nullable=False)
    amenities = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    bookings = db.relationship('Booking', backref='property', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'host_id': self.host_id,
            'host_name': self.host.name if self.host else None,
            'title': self.title,
            'description': self.description,
            'price_per_night': float(self.price_per_night),
            'location': self.location,
            'photos': self.photos,
            'amenities': self.amenities or [],
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
```

```python
# app/models/booking.py
from app import db

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    guest_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('pending', 'confirmed', 'declined', 'paid'), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'guest_id': self.guest_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
```

```python
# app/models/review.py
from app import db

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # CHECK 1-5 enforced in schema
    text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'property_id': self.property_id,
            'rating': self.rating,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
```

**Booking overlap query (SQLAlchemy):**
```python
from app.models.booking import Booking
from sqlalchemy import and_

overlapping = Booking.query.filter(
    Booking.property_id == property_id,
    Booking.status == 'confirmed',
    Booking.start_date < end_date,
    Booking.end_date > start_date
).first()
if overlapping:
    raise ValueError("Dates already booked")
```

---

## Flask App Factory Pattern

```python
# app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.bookings import bookings_bp
    from app.routes.users import users_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    return app
```

```python
# app/config.py
import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql://root:password@localhost:3306/cozystay'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'jwt-secret-change-me')
    JWT_ACCESS_TOKEN_EXPIRES = 604800  # 7 days
    UPLOAD_FOLDER = os.getenv('UPLOAD_DIR', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
```

```python
# app.py (entry point)
from app import create_app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## Environment Variables (.env)

```ini
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=mysql://root:password@localhost:3306/cozystay
JWT_SECRET=jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
```

---

## Requirements (requirements.txt)

```
Flask==3.0.0
Flask-Cors==4.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-JWT-Extended==4.6.0
Marshmallow==3.21.0
marshmallow-sqlalchemy==0.30.0
PyMySQL==1.1.0
python-dotenv==1.0.0
Werkzeug==3.0.1
PyJWT==2.8.0
gunicorn==22.0.0
pytest==8.0.0
```

---

## API Routes Summary

| Method | Route | Auth | Body/Params | Response |
|---|---|---|---|---|
| POST | /api/auth/register | No | name, email, password | { token, user } |
| POST | /api/auth/login | No | email, password | { token, user } |
| GET | /api/auth/me | JWT | — | { user } |
| GET | /api/properties | No | ?location, ?min_price, ?max_price | Property[] |
| GET | /api/properties/:id | No | — | Property |
| POST | /api/properties | Host | Form fields + photos | Property |
| PUT | /api/properties/:id | Owner | Form fields | Property |
| DELETE | /api/properties/:id | Owner | — | { message } |
| POST | /api/upload | Auth | multipart/form-data | { url } |
| POST | /api/bookings | Guest | property_id, start_date, end_date | Booking |
| GET | /api/bookings/my | Guest | — | Booking[] |
| GET | /api/bookings/requests | Host | — | Booking[] (populated) |
| PUT | /api/bookings/:id/respond | Host | action (confirmed/declined) | Booking |
| POST | /api/payments/pay | Guest | booking_id, card_number | { transaction_id } |
| PUT | /api/bookings/:id/respond | Host | action | Booking |

---

## Client Route Map

```
/                    → Home (search + listing grid)
/login               → Login page
/register            → Register page
/listings/:id        → Listing detail
/listings/new        → Create listing (host only)
/listings/:id/edit   → Edit listing (owner only)
/my-bookings         → My Bookings (guest only)
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

5. **MySQL overlap check** — Uses SQL `start_date < input_end AND end_date > input_start` on confirmed bookings to prevent double-booking.

6. **Photo uploads via Flask** — Saved to `server/uploads/`, served statically via Flask. For production, swap to cloud storage (S3, Cloudinary).

7. **No payment processing** — Bookings are requests only; no money changes hands (per README non-goals). Optional mock payment endpoint.

8. **SQLAlchemy + Alembic** — ORM provides model abstraction; Alembic handles schema versioning and migrations for MySQL.

---

## Concerns & Decisions

### 1. Should payment service be included?

**Verdict: Yes — for a realistic POC, add a mock payment step.**

The README lists payments as a non-goal ("no money changes hands"), but a booking platform feels incomplete without it. For the POC, bookings will remain "requests," but we add a **simulated payment step** in the booking flow where the guest enters mock card details and the system validates them against a test gateway. No real money is involved, but the UX of selecting dates → paying → confirmation is preserved.

**How it fits:** After host accepts a booking (status → "confirmed"), the guest sees a "Make Payment" step. Entering test card `4242 4242 4242 4242` succeeds. This keeps the core flow intact without requiring real merchant accounts.

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
| **Booking deposit hold** | Mock a pre-authorization hold at booking time — refunded if host declines | Nice-to-have |
| **Reporting / flagging** | Guest can flag a listing; admin reviews and removes if needed | Nice-to-have (item 15) |

**MVP recommendation:** Focus on profile photos + review system first. These give the highest trust-per-effort ratio.

---

### 3. Navigation & free POC hosting

**Navigation** — Already built into the plan via **React Router v6**:

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/listings/:id" element={<ListingDetail />} />
    <Route path="/listings/new" element={<ProtectedRoute role="host"><CreateListing /></ProtectedRoute>} />
    <Route path="/listings/:id/edit" element={<ProtectedRoute role="host"><EditListing /></ProtectedRoute>} />
    <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
    <Route path="/host/dashboard" element={<ProtectedRoute role="host"><HostDashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

React Router is free, client-side, and requires no server configuration. No paid service needed.

**Free hosting for POC:**

| Service | Free Tier | What to host |
|---|---|---|
| **Render** | Web service (free sleeps after inactivity) | Backend (Flask) |
| **Railway** | $5 credit/month, enough for small POC | Backend |
| **PythonAnywhere** | Free tier for Python WSGI apps | Backend (Flask) |
| **Vercel** | Free for static + serverless functions | Frontend (React) |
| **Netlify** | Free static hosting | Frontend (React) |
| **PlanetScale** | Free 1GB MySQL database | Database |
| **FreeMySQLHosting** | Free 100MB MySQL | Database |

**Recommended free stack for POC:**

```
Frontend (React)   →  Vercel or Netlify (free)
Backend (Flask)    →  Render (free, spins down after inactivity)
Database (MySQL)   →  PlanetScale (free 1GB)
```

**Total cost: $0.** The backend on Render will cold-start (~5–10 seconds) after inactivity, but this is acceptable for a POC.

---

## Testing Strategy

- **Unit (Pytest):** Validation logic, booking overlap detection, utility functions
- **Integration:** SQLAlchemy model tests with in-memory SQLite
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
