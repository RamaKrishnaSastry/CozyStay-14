from app import create_app, db
from app.models import User, Property, Booking, Review
from datetime import date, timedelta
import random

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # ── Users ──
    users_data = [
        {'name': 'Alice Host',    'email': 'alice@example.com',    'password': 'password123', 'role': 'host'},
        {'name': 'Bob Host',      'email': 'bob@example.com',      'password': 'password123', 'role': 'host'},
        {'name': 'Charlie Guest', 'email': 'charlie@example.com',  'password': 'password123', 'role': 'guest'},
        {'name': 'Diana Guest',   'email': 'diana@example.com',    'password': 'password123', 'role': 'guest'},
        {'name': 'Admin User',    'email': 'admin@cozystay.com',   'password': 'admin123',    'role': 'admin'},
    ]
    users = {}
    for u in users_data:
        user = User(name=u['name'], email=u['email'], role=u['role'])
        user.set_password(u['password'])
        db.session.add(user)
        db.session.flush()
        users[u['name']] = user

    # ── Properties ──
    props_data = [
        {'host': 'Alice Host', 'title': 'Cozy Beach House',  'desc': 'Steps from the sand with ocean views from every room. Perfect for a relaxing getaway.', 'price': 150, 'loc': 'Miami, FL', 'photos': ['https://picsum.photos/seed/beach1/800/600', 'https://picsum.photos/seed/beach2/800/600'], 'amenities': ['WiFi', 'Pool', 'Kitchen']},
        {'host': 'Alice Host', 'title': 'Mountain Retreat',   'desc': 'Secluded cabin in the Rockies with a fireplace and hot tub.', 'price': 200, 'loc': 'Denver, CO', 'photos': ['https://picsum.photos/seed/mtn1/800/600'], 'amenities': ['WiFi', 'Fireplace', 'Parking']},
        {'host': 'Bob Host',   'title': 'City Loft',          'desc': 'Modern loft in downtown with skyline views and rooftop access.', 'price': 180, 'loc': 'New York, NY', 'photos': ['https://picsum.photos/seed/loft1/800/600', 'https://www.w3schools.com/html/mov_bbb.mp4'], 'amenities': ['WiFi', 'AC', 'Gym']},
        {'host': 'Bob Host',   'title': 'Lakefront Cabin',    'desc': 'Peaceful cabin on the lake with a dock, kayak, and fire pit.', 'price': 250, 'loc': 'Lake Tahoe, CA', 'photos': ['https://picsum.photos/seed/lake1/800/600'], 'amenities': ['Kitchen', 'Parking', 'Kayak']},
        {'host': 'Alice Host', 'title': 'Desert Oasis',       'desc': 'Stylish adobe home with a pool in the heart of the desert.', 'price': 120, 'loc': 'Scottsdale, AZ', 'photos': ['https://picsum.photos/seed/desert1/800/600'], 'amenities': ['Pool', 'WiFi', 'BBQ']},
    ]
    props = {}
    for p in props_data:
        prop = Property(
            host_id=users[p['host']].id,
            title=p['title'],
            description=p['desc'],
            price_per_night=p['price'],
            location=p['loc'],
            photos=p['photos'],
            amenities=p['amenities'],
        )
        db.session.add(prop)
        db.session.flush()
        props[p['title']] = prop

    # ── Bookings ──
    today = date.today()
    bookings_data = [
        {'guest': 'Charlie Guest', 'prop': 'Cozy Beach House',  'start': today - timedelta(days=14), 'end': today - timedelta(days=10), 'status': 'confirmed'},
        {'guest': 'Diana Guest',   'prop': 'Mountain Retreat',   'start': today - timedelta(days=7),  'end': today - timedelta(days=5),  'status': 'paid'},
        {'guest': 'Charlie Guest', 'prop': 'City Loft',          'start': today + timedelta(days=5),  'end': today + timedelta(days=8),  'status': 'pending'},
        {'guest': 'Diana Guest',   'prop': 'Lakefront Cabin',    'start': today + timedelta(days=10), 'end': today + timedelta(days=14), 'status': 'confirmed'},
        {'guest': 'Diana Guest',   'prop': 'Desert Oasis',       'start': today - timedelta(days=3),  'end': today + timedelta(days=2),  'status': 'pending'},
        {'guest': 'Charlie Guest', 'prop': 'City Loft',          'start': today - timedelta(days=20), 'end': today - timedelta(days=17), 'status': 'declined'},
        {'guest': 'Charlie Guest', 'prop': 'Desert Oasis',       'start': today + timedelta(days=20), 'end': today + timedelta(days=25), 'status': 'pending'},
    ]
    for b in bookings_data:
        booking = Booking(
            property_id=props[b['prop']].id,
            guest_id=users[b['guest']].id,
            start_date=b['start'],
            end_date=b['end'],
            status=b['status'],
        )
        db.session.add(booking)
        db.session.flush()

    # ── Reviews (on completed bookings) ──
    reviews_data = [
        {'guest': 'Charlie Guest', 'prop': 'Cozy Beach House', 'rating': 5, 'text': 'Amazing place! Right on the beach, clean, and the host was super responsive.'},
        {'guest': 'Diana Guest',   'prop': 'Mountain Retreat',  'rating': 4, 'text': 'Beautiful cabin with great views. The hot tub was a bonus. A bit hard to find at night.'},
    ]
    for r in reviews_data:
        booking = Booking.query.filter_by(
            guest_id=users[r['guest']].id,
            property_id=props[r['prop']].id,
        ).first()
        if booking:
            review = Review(
                booking_id=booking.id,
                user_id=users[r['guest']].id,
                property_id=props[r['prop']].id,
                rating=r['rating'],
                text=r['text'],
            )
            db.session.add(review)

    db.session.commit()

    # ── Summary ──
    print('=== SEED DATA CREATED ===')
    print(f'Users:     {User.query.count()}  (admin, 2 hosts, 2 guests)')
    print(f'Properties:{Property.query.count()}  (3 by Alice, 2 by Bob)')
    print(f'Bookings:  {Booking.query.count()}  (pending/confirmed/declined/paid)')
    print(f'Reviews:   {Review.query.count()}  (on Cozy Beach House & Mountain Retreat)')
    print()
    print('── Credentials ──')
    for u in users_data:
        print(f'  {u["name"]:20s} → {u["email"]:25s} / {u["password"]}')
