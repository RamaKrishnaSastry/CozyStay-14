from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.contact_request import ContactRequest
from app.models.notification import Notification

contact_requests_bp = Blueprint('contact_requests', __name__)

@contact_requests_bp.route('/', methods=['POST'])
@jwt_required()
def create():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('property_id'):
        return jsonify({'error': 'property_id is required'}), 400

    from app.models.property import Property
    prop = db.session.get(Property, data['property_id'])
    if not prop:
        return jsonify({'error': 'Property not found'}), 404
    if prop.host_id == user_id:
        return jsonify({'error': 'You cannot request contact with your own property'}), 400

    existing = ContactRequest.query.filter_by(
        property_id=data['property_id'], guest_id=user_id,
        status='pending'
    ).first()
    if existing:
        return jsonify({'error': 'You already have a pending request for this property'}), 409

    cr = ContactRequest(
        property_id=data['property_id'],
        guest_id=user_id,
        host_id=prop.host_id,
        message=data.get('message', ''),
    )
    db.session.add(cr)
    db.session.flush()

    notif = Notification(
        user_id=prop.host_id,
        type='contact_request',
        reference_id=cr.id,
        title='New Contact Request',
        message=f"A guest wants to connect about your listing \"{prop.title}\"",
        action_url='/messages',
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify(cr.to_dict()), 201

@contact_requests_bp.route('/', methods=['GET'])
@jwt_required()
def list_requests():
    user_id = int(get_jwt_identity())
    user_role = request.args.get('role', '')
    if user_role == 'host':
            requests = ContactRequest.query.filter_by(host_id=user_id).order_by(ContactRequest.created_at.desc()).all()
    else:
            requests = ContactRequest.query.filter_by(guest_id=user_id).order_by(ContactRequest.created_at.desc()).all()
    return jsonify([r.to_dict() for r in requests])

@contact_requests_bp.route('/<int:cr_id>', methods=['GET'])
@jwt_required()
def get_one(cr_id):
    cr = db.session.get(ContactRequest, cr_id)
    if not cr:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(cr.to_dict())

@contact_requests_bp.route('/<int:cr_id>/respond', methods=['PUT'])
@jwt_required()
def respond(cr_id):
    user_id = int(get_jwt_identity())
    cr = db.session.get(ContactRequest, cr_id)
    if not cr:
        return jsonify({'error': 'Not found'}), 404
    if cr.host_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    action = data.get('action', '')
    if action not in ('approved', 'declined'):
        return jsonify({'error': 'Action must be "approved" or "declined"'}), 400

    cr.status = action
    cr.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    from app.models.property import Property
    prop = db.session.get(Property, cr.property_id)

    guest_notif = Notification(
        user_id=cr.guest_id,
        type='contact_request',
        reference_id=cr.id,
        title='Contact Request Update',
        message=f"Your request to connect about \"{prop.title}\" was {action} by the host.",
        action_url='/messages',
    )
    db.session.add(guest_notif)
    db.session.commit()

    return jsonify(cr.to_dict())

@contact_requests_bp.route('/<int:cr_id>', methods=['DELETE'])
@jwt_required()
def delete(cr_id):
    user_id = int(get_jwt_identity())
    cr = db.session.get(ContactRequest, cr_id)
    if not cr:
        return jsonify({'error': 'Not found'}), 404
    if cr.guest_id != user_id and cr.host_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(cr)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
