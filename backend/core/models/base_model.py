# 수정일: 2026-01-22
# 수정내용: Antigravity - 공통 필드 관리를 위한 추상 베이스 모델 정의

from django.db import models

class BaseModel(models.Model):
    """
    모든 모델에서 공통으로 사용하는 필드들을 정의하는 추상 베이스 모델
    """
    create_id = models.CharField(max_length=50, null=True, blank=True)
    update_id = models.CharField(max_length=50, null=True, blank=True)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    use_yn = models.CharField(max_length=1, default='Y')

    class Meta:
        abstract = True
