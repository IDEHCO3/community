"""
Django settings for geo1 project.

Generated by 'django-admin startproject' using Django 1.8.2.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static_root/')
if not os.path.exists(STATIC_ROOT):
    os.makedirs(STATIC_ROOT)


MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media_root/')
if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)


TEMPORARY_STORAGE = os.path.join(PROJECT_ROOT, 'tmp/')
if not os.path.exists(TEMPORARY_STORAGE):
    os.makedirs(TEMPORARY_STORAGE)

STATICFILES_DIRS = [
    os.path.join(PROJECT_ROOT, "static"),
]

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'mwn6)v29l3r!@&4-8ohnx03v^h0-*x&2=qz!1w#@qj9d4=4sm9'

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'username@gmail.com'
EMAIL_HOST_PASSWORD = 'password'
EMAIL_USE_TLS = True
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition
AUTH_USER_MODEL = 'auth.User'
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'corsheaders',
    'rest_framework',
    'rest_framework_jwt',
    'rest_framework_gis',
    'authentication',
    'community',
    'community_api',
    'community_layer_api',
    'users',
    'discussion_list',
    'community_files_api',
)

CORS_ORIGIN_ALLOW_ALL = True

JWT_AUTH = {
    'JWT_VERIFY': True,
    'JWT_EXPIRATION_DELTA': datetime.timedelta(seconds=60*60),
    'JWT_ALLOW_REFRESH': True,
    'JWT_REFRESH_EXPIRATION_DELTA': datetime.timedelta(days=7),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
}

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'geo1.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'geo1.wsgi.application'


if not 'IP_SGBD' in os.environ:
    os.environ['IP_SGBD'] = 'localhost'

if not 'DATABASE_NAME' in os.environ:
    os.environ['DATABASE_NAME'] = 'idehco3'

if not 'USER_NAME_DATABASE' in os.environ:
    os.environ['USER_NAME_DATABASE'] = 'idehco3'

if not 'PASSWORD_DATABASE' in os.environ:
    os.environ['PASSWORD_DATABASE'] = 'idehco3'

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases
ip_sgbd = os.environ['IP_SGBD']
database_name = os.environ['DATABASE_NAME']
user_name_database = os.environ['USER_NAME_DATABASE']
password_database = os.environ['PASSWORD_DATABASE']

DATABASES = {
    'default': {
         'ENGINE': 'django.contrib.gis.db.backends.postgis',
         'HOST': ip_sgbd,
         'NAME': database_name,
         'USER': user_name_database,
         'PASSWORD': password_database
     }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

MEDIA_URL = '/media/'

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR,  'templates'),
)
