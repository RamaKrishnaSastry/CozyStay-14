import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl': {
                'ca': os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ca.pem'),
            }
        }
    }
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 604800
    UPLOAD_FOLDER = os.getenv('UPLOAD_DIR', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
