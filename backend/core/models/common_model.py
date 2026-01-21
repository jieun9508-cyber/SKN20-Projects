# 수정일: 2026-01-22
# 수정내용: Antigravity - BaseModel 상속 적용 및 중복 필드 제거

from django.db import models
from .base_model import BaseModel

class Common(BaseModel):
    """
    팀원 B 담당: 공통 모델
    """
    class Meta:
        db_table = 'gym_common'
        ordering = ['order_number', 'code_name']  # 정렬 기준 추가

    common_id = models.AutoField(primary_key=True)
    top_code = models.CharField(max_length=50, null=True, blank=True)  # 상위 코드 (그룹 코드)
    code_id = models.CharField(max_length=50, null=True, blank=True)   # 상세 코드 ID
    code_name = models.CharField(max_length=200)                       # 상세 코드 명 (기존 common_name 대체)
    order_number = models.IntegerField(default=10)                     # 정렬 순서

    # 수정일: 2026-01-20
    # 수정내용: __str__ 메서드 추가 - 모델 인스턴스를 문자열로 표현할 때 code_name과 code_id를 반환하여 식별을 용이하게 함
    def __str__(self):
        return f"{self.code_name} ({self.code_id})"
