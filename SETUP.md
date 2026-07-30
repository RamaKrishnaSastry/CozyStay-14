# CozyStay — Local Setup Guide

## Prerequisites

1. Python 3.10+
2. MySQL 8.0+ (local)
3. Node.js + npm
4. Git

## Setup Steps

### 1. Clone the repo
```bash
git clone <repo-url>
cd CozyStay-14
```

### 2. Set up local MySQL
```bash
# Log into MySQL
mysql -u root -p

# Create the database
CREATE DATABASE cozystay;

# Create a user (optional, or use root)
CREATE USER 'cozystay_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON cozystay.* TO 'cozystay_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### 3. Configure the backend
Copy `.env.example` to `.env` and update the `DATABASE_URL`:
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/cozystay
```

### 4. Install backend dependencies
```bash
cd server
pip install -r requirements.txt
```

### 5. Run migrations (create tables)
```bash
cd server
flask db init        # Only first time
flask db migrate -m "Initial migration"
flask db upgrade
```

### 6. Start the Flask backend
```bash
cd server
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --port 5000
```
Or simply:
```bash
cd server
python app.py
```

### 7. Set up the frontend
```bash
cd client
npm install
npm run dev
```

### 8. Verify
- Backend health: `http://127.0.0.1:5000/api/health` → `{"status": "ok"}`
- Frontend: `http://localhost:3001` (or next available port)

## Database Schema Notes
The Flask backend uses Flask-SQLAlchemy with these models:
- `User` — name, email, password_hash, role (guest/host/admin)
- `Property` — host_id, title, description, price_per_night, location, photos, amenities, unavailable_dates, is_active
- `Booking` — property_id, guest_id, start_date, end_date, status (pending/confirmed/declined)
- `Review` — booking_id, rating, text

API routes are prefixed with `/api/`:
- `/api/auth/*` — register, login, get-me
- `/api/properties/*` — CRUD + search
- `/api/bookings/*` — create, my bookings, host requests, accept/decline
- `/api/users/*` — admin CRUD on users
- `/api/admin/*` — admin stats, list all, delete
