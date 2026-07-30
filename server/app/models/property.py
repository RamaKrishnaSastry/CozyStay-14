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
