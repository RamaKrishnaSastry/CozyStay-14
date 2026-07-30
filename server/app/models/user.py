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
