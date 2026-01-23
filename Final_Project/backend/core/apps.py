# 수정일: 2026-01-20
# 수정내용: core 앱 설정 파일 생성

from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
