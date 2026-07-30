from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models import User, Property, Booking
from app import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.count()
    properties = Property.query.filter_by(is_active=True).count()
    bookings = Booking.query.count()

    return jsonify({
        'total_users': users,
        'total_active_listings': properties,
        'total_bookings': bookings,
    })

@admin_bp.route('/listings', methods=['GET'])
@jwt_required()
def all_listings():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    properties = Property.query.order_by(Property.created_at.desc()).all()
    return jsonify([p.to_dict() for p in properties])

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
def all_bookings():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    results = []
    for b in bookings:
        d = b.to_dict()
        prop = Property.query.get(b.property_id)
        d['property'] = prop.to_dict() if prop else None
        guest = User.query.get(b.guest_id)
        d['guest'] = {'id': guest.id, 'name': guest.name, 'email': guest.email} if guest else None
        results.append(d)
    return jsonify(results)

@admin_bp.route('/listings/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_listing(id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    property = Property.query.get(id)
    if not property:
        return jsonify({'error': 'Listing not found'}), 404
    property.is_active = False
    db.session.commit()
    return jsonify({'message': 'Listing deactivated by admin'})

@admin_bp.route('/bookings/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_booking(id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'message': 'Booking deleted'})
