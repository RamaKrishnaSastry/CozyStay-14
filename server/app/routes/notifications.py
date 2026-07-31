from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.notification import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(50).all()
    return jsonify([n.to_dict() for n in notifs])

@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=user_id, read=False).count()
    return jsonify({'count': count})

@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = db.session.get(Notification, notif_id)
    if not notif or notif.user_id != user_id:
        return jsonify({'error': 'Not found'}), 404
    notif.read = True
    db.session.commit()
    return jsonify(notif.to_dict())

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, read=False).update({'read': True})
    db.session.commit()
    return jsonify({'message': 'All marked as read'})

@notifications_bp.route('/<int:notif_id>', methods=['DELETE'])
@jwt_required()
def delete(notif_id):
    user_id = int(get_jwt_identity())
    notif = db.session.get(Notification, notif_id)
    if not notif or notif.user_id != user_id:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(notif)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'})
