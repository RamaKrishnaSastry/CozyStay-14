from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.message import Message
from app.models.contact_request import ContactRequest
from app.models.notification import Notification

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/', methods=['POST'])
@jwt_required()
def send():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('contact_request_id'):
        return jsonify({'error': 'contact_request_id is required'}), 400

    text = (data.get('text') or '').strip()
    if not text:
        return jsonify({'error': 'text is required'}), 400

    cr = db.session.get(ContactRequest, data['contact_request_id'])
    if not cr:
        return jsonify({'error': 'Contact request not found'}), 404
    if cr.status != 'approved':
        return jsonify({'error': 'Contact request is not approved'}), 403
    if cr.guest_id != user_id and cr.host_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    msg = Message(
        contact_request_id=data['contact_request_id'],
        sender_id=user_id,
        text=text,
    )
    db.session.add(msg)
    db.session.flush()

    from app.models.user import User
    sender = db.session.get(User, user_id)
    other_id = cr.host_id if cr.guest_id == user_id else cr.guest_id
    notif = Notification(
        user_id=other_id,
        type='message',
        reference_id=msg.id,
        title=f'New message from {sender.name if sender else "User"}',
        message=text[:100],
        action_url='/messages',
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify(msg.to_dict()), 201

@messages_bp.route('/by-request/<int:cr_id>', methods=['GET'])
@jwt_required()
def list_by_request(cr_id):
    user_id = int(get_jwt_identity())
    cr = db.session.get(ContactRequest, cr_id)
    if not cr:
        return jsonify({'error': 'Not found'}), 404
    if cr.guest_id != user_id and cr.host_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        limit = min(int(request.args.get('limit', 100)), 200)
    except ValueError:
        limit = 100
    try:
        offset = max(int(request.args.get('offset', 0)), 0)
    except ValueError:
        offset = 0

    msgs = (
        Message.query.filter_by(contact_request_id=cr_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return jsonify([m.to_dict() for m in msgs])

@messages_bp.route('/by-request/<int:cr_id>/read', methods=['PUT'])
@jwt_required()
def mark_conversation_read(cr_id):
    user_id = int(get_jwt_identity())
    cr = db.session.get(ContactRequest, cr_id)
    if not cr:
        return jsonify({'error': 'Not found'}), 404
    if cr.guest_id != user_id and cr.host_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    updated = (
        Message.query.filter(
            Message.contact_request_id == cr_id,
            Message.sender_id != user_id,
            Message.read_at.is_(None),
        )
        .update({'read_at': datetime.now(timezone.utc).replace(tzinfo=None)})
    )
    db.session.commit()

    unread = Message.query.filter_by(contact_request_id=cr_id, read_at=None).filter(
        Message.sender_id != user_id
    ).count()

    return jsonify({'updated': updated, 'unread': unread})

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def conversations():
    user_id = int(get_jwt_identity())
    approved = ContactRequest.query.filter(
        (ContactRequest.guest_id == user_id) | (ContactRequest.host_id == user_id),
        ContactRequest.status == 'approved'
    ).all()

    from app.models.user import User
    from app.models.property import Property

    result = []
    for cr in approved:
        last_msg = (
            Message.query.filter_by(contact_request_id=cr.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        unread = Message.query.filter_by(contact_request_id=cr.id, read_at=None).filter(
            Message.sender_id != user_id
        ).count()
        other_id = cr.host_id if cr.guest_id == user_id else cr.guest_id
        other = db.session.get(User, other_id)
        prop = db.session.get(Property, cr.property_id)
        result.append({
            'id': f'conv-{cr.id}',
            'contact_request_id': cr.id,
            'with_user_id': other_id,
            'with_user_name': other.name if other else 'Unknown',
            'with_user_photo': other.profile_photo if other else '',
            'property_title': prop.title if prop else 'Unknown',
            'property_id': cr.property_id,
            'last_message': last_msg.text if last_msg and not last_msg.deleted else None,
            'last_message_deleted': bool(last_msg and last_msg.deleted),
            'last_message_at': last_msg.created_at.isoformat() if last_msg and last_msg.created_at else None,
            'unread': unread,
        })
    return jsonify(result)

@messages_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    user_id = int(get_jwt_identity())
    msg = db.session.get(Message, message_id)
    if not msg:
        return jsonify({'error': 'Message not found'}), 404
    if msg.sender_id != user_id:
        return jsonify({'error': 'You can only delete your own messages'}), 403

    msg.deleted = True
    db.session.commit()
    return jsonify(msg.to_dict())
