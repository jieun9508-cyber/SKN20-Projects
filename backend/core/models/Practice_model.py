# 수정일: 2026-01-20
# 수정내용: 팀원 C (Order 담당) - 주문 관련 모델 정의

from django.db import models
from .base_model import BaseModel

class Practice(models.Model):
    """
    팀원 C 담당: practice 모델
    """
    practice_number = models.CharField(max_length=50, unique=True)
    

    def __str__(self):
        return self.order_number
