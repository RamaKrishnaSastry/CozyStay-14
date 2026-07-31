from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.review import Review
from app.models.booking import Booking

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/property/<int:property_id>', methods=['GET'])
def get_by_property(property_id):
    reviews = Review.query.filter_by(property_id=property_id).order_by(Review.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews])

@reviews_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_by_user(user_id):
    reviews = Review.query.filter_by(user_id=user_id).order_by(Review.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews])

@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or not data.get('booking_id') or not data.get('rating'):
        return jsonify({'error': 'booking_id and rating are required'}), 400

    booking = db.session.get(Booking, data['booking_id'])
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    if booking.guest_id != user_id:
        return jsonify({'error': 'You can only review your own bookings'}), 403
    if booking.status != 'confirmed' and booking.status != 'paid':
        return jsonify({'error': 'Can only review confirmed or paid bookings'}), 400

    existing = Review.query.filter_by(booking_id=data['booking_id']).first()
    if existing:
        return jsonify({'error': 'You already reviewed this booking'}), 409

    rating = int(data['rating'])
    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    review = Review(
        booking_id=data['booking_id'],
        user_id=user_id,
        property_id=booking.property_id,
        rating=rating,
        text=data.get('text', ''),
    )
    db.session.add(review)
    db.session.commit()

    return jsonify(review.to_dict()), 201
