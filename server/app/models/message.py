from app import db

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    contact_request_id = db.Column(db.Integer, db.ForeignKey('contact_requests.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    read_at = db.Column(db.DateTime)

    contact_request = db.relationship('ContactRequest', backref='messages')
    sender = db.relationship('User', backref='sent_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'contact_request_id': self.contact_request_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.name if self.sender else None,
            'text': self.text,
            'deleted': self.deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
        }
