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
        prop = self.property if hasattr(self, 'property') else None
        guest = self.guest if hasattr(self, 'guest') else None
        return {
            'id': self.id,
            'property_id': self.property_id,
            'property_title': prop.title if prop else None,
            'property_photo': (prop.photos or [None])[0] if prop else None,
            'guest_id': self.guest_id,
            'guest_name': guest.name if guest else None,
            'host_id': prop.host_id if prop else None,
            'host_name': prop.host.name if prop and prop.host else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
