from .settings import *
import sys
import warnings

# Use SQLite for tests to avoid PostgreSQL conflicts
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable timezone warnings in tests
warnings.filterwarnings('ignore', category=RuntimeWarning, module='django.db.models.fields')

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

if 'test' in sys.argv:
    MIGRATION_MODULES = DisableMigrations()

# Use naive datetimes in tests
USE_TZ = False

# Simpler password validation for tests
AUTH_PASSWORD_VALIDATORS = []

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
