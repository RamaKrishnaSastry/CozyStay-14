from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import User, Property, Booking
from app import db

properties_bp = Blueprint('properties', __name__)

@properties_bp.route('/', methods=['GET'])
def list_properties():
    query = Property.query.filter_by(is_active=True)
    location = request.args.get('location')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    amenities = request.args.get('amenities')

    if location:
        query = query.filter(Property.location.ilike(f'%{location}%'))
    if min_price:
        query = query.filter(Property.price_per_night >= float(min_price))
    if max_price:
        query = query.filter(Property.price_per_night <= float(max_price))
    if amenities:
        tags = [a.strip() for a in amenities.split(',')]
        for tag in tags:
            query = query.filter(Property.amenities.contains(tag))

    properties = query.order_by(Property.created_at.desc()).all()
    return jsonify([p.to_dict() for p in properties])

@properties_bp.route('/<int:id>', methods=['GET'])
def get_property(id):
    property = Property.query.get(id)
    if not property:
        return jsonify({'error': 'Property not found'}), 404
    return jsonify(property.to_dict())

@properties_bp.route('/', methods=['POST'])
@jwt_required()
def create_property():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') not in ('host', 'admin'):
        return jsonify({'error': 'Only hosts can create listings'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data'}), 400

    required = ['title', 'description', 'price_per_night', 'location', 'photos']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    property = Property(
        host_id=user_id,
        title=data['title'],
        description=data['description'],
        price_per_night=data['price_per_night'],
        location=data['location'],
        photos=data['photos'],
        amenities=data.get('amenities', []),
    )
    db.session.add(property)
    db.session.commit()

    return jsonify(property.to_dict()), 201

@properties_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_property(id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    property = Property.query.get(id)

    if not property:
        return jsonify({'error': 'Property not found'}), 404
    if property.host_id != user_id and claims.get('role') != 'admin':
        return jsonify({'error': 'Not authorized to edit this listing'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data'}), 400

    for field in ['title', 'description', 'price_per_night', 'location', 'photos', 'amenities']:
        if field in data:
            setattr(property, field, data[field])

    db.session.commit()
    return jsonify(property.to_dict())

@properties_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_property(id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    property = Property.query.get(id)

    if not property:
        return jsonify({'error': 'Property not found'}), 404
    if property.host_id != user_id and claims.get('role') != 'admin':
        return jsonify({'error': 'Not authorized to delete this listing'}), 403

    active_bookings = Booking.query.filter(
        Booking.property_id == id,
        Booking.status.in_(['pending', 'confirmed']),
        Booking.end_date >= db.func.current_date()
    ).count()

    if active_bookings > 0:
        return jsonify({'error': f'Cannot delete: {active_bookings} active booking(s) exist'}), 400

    property.is_active = False
    db.session.commit()
    return jsonify({'message': 'Listing deactivated'})
