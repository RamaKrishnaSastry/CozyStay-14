from app import db

class ContactRequest(db.Model):
    __tablename__ = 'contact_requests'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    guest_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum('pending', 'approved', 'declined'), nullable=False, default='pending')
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())

    property = db.relationship('Property', backref='contact_requests')
    guest = db.relationship('User', foreign_keys=[guest_id], backref='sent_requests')
    host = db.relationship('User', foreign_keys=[host_id], backref='received_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'property_title': self.property.title if self.property else None,
            'guest_id': self.guest_id,
            'guest_name': self.guest.name if self.guest else None,
            'host_id': self.host_id,
            'host_name': self.host.name if self.host else None,
            'status': self.status,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
