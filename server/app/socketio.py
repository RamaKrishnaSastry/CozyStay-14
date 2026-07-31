from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
from flask_jwt_extended import decode_token
from datetime import datetime, timezone
from app.models.message import Message
from app.models.contact_request import ContactRequest
from app import db

socketio = SocketIO(cors_allowed_origins='*', async_mode='gevent')

connected_users = {}

@socketio.on('connect')
def handle_connect():
    token = request.args.get('token')
    if token:
        try:
            decoded = decode_token(token)
            user_id = decoded['sub']
            connected_users[request.sid] = user_id
            join_room(f'user_{user_id}')
        except Exception:
            pass

@socketio.on('disconnect')
def handle_disconnect():
    connected_users.pop(request.sid, None)

@socketio.on('join_conversation')
def handle_join(data):
    cr_id = data.get('contact_request_id')
    user_id = connected_users.get(request.sid)
    if not user_id or not cr_id:
        return
    cr = db.session.get(ContactRequest, cr_id)
    if cr and (cr.guest_id == user_id or cr.host_id == user_id):
        join_room(f'conv_{cr_id}')

@socketio.on('leave_conversation')
def handle_leave(data):
    cr_id = data.get('contact_request_id')
    leave_room(f'conv_{cr_id}')

@socketio.on('send_message')
def handle_send_message(data):
    user_id = connected_users.get(request.sid)
    if not user_id:
        emit('error', {'message': 'Not authenticated'})
        return

    cr_id = data.get('contact_request_id')
    text = data.get('text', '').strip()
    if not cr_id or not text:
        return

    cr = db.session.get(ContactRequest, cr_id)
    if not cr or cr.status != 'approved':
        emit('error', {'message': 'Cannot send message'})
        return
    if cr.guest_id != user_id and cr.host_id != user_id:
        emit('error', {'message': 'Unauthorized'})
        return

    msg = Message(contact_request_id=cr_id, sender_id=user_id, text=text)
    db.session.add(msg)
    db.session.commit()

    msg_data = msg.to_dict()
    emit('new_message', msg_data, room=f'conv_{cr_id}')

    other_id = cr.host_id if cr.guest_id == user_id else cr.guest_id
    from app.models.notification import Notification
    from app.models.user import User
    sender = db.session.get(User, user_id)
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
    emit('notification', notif.to_dict(), room=f'user_{other_id}')

@socketio.on('mark_read')
def handle_mark_read(data):
    user_id = connected_users.get(request.sid)
    cr_id = data.get('contact_request_id')
    if not user_id or not cr_id:
        return
    cr = db.session.get(ContactRequest, cr_id)
    if not cr or (cr.guest_id != user_id and cr.host_id != user_id):
        return

    Message.query.filter(
        Message.contact_request_id == cr_id,
        Message.sender_id != user_id,
        Message.read_at.is_(None),
    ).update({'read_at': datetime.now(timezone.utc).replace(tzinfo=None)})
    db.session.commit()

    emit('messages_read', {'contact_request_id': cr_id, 'by_user_id': user_id}, room=f'conv_{cr_id}')

@socketio.on('delete_message')
def handle_delete_message(data):
    user_id = connected_users.get(request.sid)
    message_id = data.get('message_id')
    if not user_id or not message_id:
        return
    msg = db.session.get(Message, message_id)
    if not msg or msg.sender_id != user_id:
        emit('error', {'message': 'Unauthorized'})
        return
    msg.deleted = True
    db.session.commit()
    emit('message_deleted', {'message_id': msg.id}, room=f'conv_{msg.contact_request_id}')
