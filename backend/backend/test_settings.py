from .settings import *
import sys
import warnings

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

warnings.filterwarnings('ignore', category=RuntimeWarning, module='django.db.models.fields')

class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

if 'test' in sys.argv:
    MIGRATION_MODULES = DisableMigrations()

USE_TZ = False
AUTH_PASSWORD_VALIDATORS = []
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
