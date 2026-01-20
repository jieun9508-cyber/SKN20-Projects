"""
Django settings for config project.
수정일: 2026-01-20
수정내용: 프로젝트 기본 설정 및 PostgreSQL 연결 설정, 협업을 위한 앱 분리 구조 준비
"""

import os
from pathlib import Path
import environ

# env 객체 초기화
env = environ.Env(
    DEBUG=(bool, False)
)

BASE_DIR = Path(__file__).resolve().parent.parent

# .env 파일이 있으면 읽어옴
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY', default='django-insecure-default-key-for-dev')

DEBUG = env('DEBUG', default=True)

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    
    # Local apps (담당자별 앱 분리 가능)
    'core', 
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # CORS 설정
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'config.wsgi.application'

# Database 설정 (PostgreSQL)
DATABASES = {
    'default': env.db('DATABASE_URL', default=f"postgres://{os.getenv('DB_USER', 'myuser')}:{os.getenv('DB_PASSWORD', 'mypassword')}@{os.getenv('DB_HOST', 'db')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'mygym')}")
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ko-kr' # 한국어 설정
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# DRF & Swagger 설정
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS 설정 (프론트엔드 연동용)
CORS_ALLOW_ALL_ORIGINS = True 
CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000'] 
