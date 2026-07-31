from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def _ensure_schema(app):
    try:
        from sqlalchemy import inspect
        with app.app_context():
            insp = inspect(db.engine)
            if 'messages' in insp.get_table_names():
                cols = {c['name'] for c in insp.get_columns('messages')}
                if 'deleted' not in cols:
                    with db.engine.begin() as conn:
                        conn.execute(db.text('ALTER TABLE messages ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT 0'))
    except Exception:
        app.logger.debug('Schema check skipped (database unavailable)', exc_info=True)

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from app.models import User, Property, Booking, Review, ContactRequest, Message, Notification

    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.bookings import bookings_bp
    from app.routes.contact_requests import contact_requests_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    from app.routes.reviews import reviews_bp
    from app.routes.users import users_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(contact_requests_bp, url_prefix='/api/contact-requests')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    from app.socketio import socketio as socketio_instance
    socketio_instance.init_app(app)

    _ensure_schema(app)

    return app
