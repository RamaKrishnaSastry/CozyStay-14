from app import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('contact_request', 'message', 'system'), nullable=False)
    reference_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    action_url = db.Column(db.String(512))
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'reference_id': self.reference_id,
            'title': self.title,
            'message': self.message,
            'action_url': self.action_url,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
