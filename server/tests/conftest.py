import pytest
from app import create_app, db


@pytest.fixture()
def app(tmp_path):
    db_path = tmp_path / 'test.db'
    application = create_app()
    application.config['TESTING'] = True
    application.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    application.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    application.config['GOOGLE_CLIENT_ID'] = ''
    with application.app_context():
        db.drop_all()
        db.create_all()
    yield application
    with application.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()
