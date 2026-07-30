from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import Booking, Property, User
from app import db
from sqlalchemy import and_

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data'}), 400

    property_id = data.get('property_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    if not property_id or not start_date or not end_date:
        return jsonify({'error': 'property_id, start_date, end_date are required'}), 400

    property = Property.query.get(property_id)
    if not property or not property.is_active:
        return jsonify({'error': 'Property not found or inactive'}), 404

    if start_date >= end_date:
        return jsonify({'error': 'End date must be after start date'}), 400

    overlapping = Booking.query.filter(
        Booking.property_id == property_id,
        Booking.status == 'confirmed',
        Booking.start_date < end_date,
        Booking.end_date > start_date
    ).first()

    if overlapping:
        return jsonify({'error': 'Dates overlap with an existing confirmed booking'}), 400

    booking = Booking(
        property_id=property_id,
        guest_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify(booking.to_dict()), 201

@bookings_bp.route('/my', methods=['GET'])
@jwt_required()
def my_bookings():
    user_id = int(get_jwt_identity())
    bookings = Booking.query.filter_by(guest_id=user_id).order_by(Booking.created_at.desc()).all()
    results = []
    for b in bookings:
        d = b.to_dict()
        prop = Property.query.get(b.property_id)
        d['property'] = prop.to_dict() if prop else None
        results.append(d)
    return jsonify(results)

@bookings_bp.route('/requests', methods=['GET'])
@jwt_required()
def host_requests():
    user_id = int(get_jwt_identity())
    property_ids = [p.id for p in Property.query.filter_by(host_id=user_id).all()]
    if not property_ids:
        return jsonify([])

    bookings = Booking.query.filter(Booking.property_id.in_(property_ids)).order_by(Booking.created_at.desc()).all()
    results = []
    for b in bookings:
        d = b.to_dict()
        prop = Property.query.get(b.property_id)
        d['property'] = {'id': prop.id, 'title': prop.title} if prop else None
        guest = User.query.get(b.guest_id)
        d['guest'] = {'id': guest.id, 'name': guest.name, 'email': guest.email} if guest else None
        results.append(d)
    return jsonify(results)

@bookings_bp.route('/<int:id>/respond', methods=['PUT'])
@jwt_required()
def respond_booking(id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    booking = Booking.query.get(id)

    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.status != 'pending':
        return jsonify({'error': 'Booking already responded to'}), 400

    property = Property.query.get(booking.property_id)
    if claims.get('role') != 'admin' and property.host_id != user_id:
        return jsonify({'error': 'Not your property'}), 403

    data = request.get_json()
    action = data.get('action') if data else None
    if action not in ('confirmed', 'declined'):
        return jsonify({'error': 'Action must be confirmed or declined'}), 400

    booking.status = action
    db.session.commit()
    return jsonify(booking.to_dict())
