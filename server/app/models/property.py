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
    blocked_dates = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    bookings = db.relationship('Booking', backref='property', lazy='dynamic')

    def to_dict(self):
        reviews = [r for r in self.host.reviews if r.property_id == self.id] if hasattr(self, 'host') and self.host else []
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else None
        review_count = len(reviews)
        return {
            'id': self.id,
            'host_id': self.host_id,
            'host_name': self.host.name if self.host else None,
            'host_photo': self.host.profile_photo if self.host else None,
            'title': self.title,
            'description': self.description,
            'price_per_night': float(self.price_per_night),
            'location': self.location,
            'photos': self.photos,
            'amenities': self.amenities or [],
            'blocked_dates': self.blocked_dates or [],
            'is_active': self.is_active,
            'avg_rating': avg_rating,
            'review_count': review_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
