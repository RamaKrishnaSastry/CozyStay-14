from app import db

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref='reviews', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'property_id': self.property_id,
            'rating': self.rating,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
