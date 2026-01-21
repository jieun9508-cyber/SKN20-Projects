# 수정일: 2026-01-22
# 수정내용: Antigravity - BaseModel 상속 적용 및 중복 필드 제거

from django.db import models
from .base_model import BaseModel

class Post(BaseModel):
    """
    팀원 D 담당: 공통 모델
    """
    class Meta:
        db_table = 'gym_post'  # 원하는 테이블 이름

    # 2026-01-20 수정: 각 컬럼에 대한 설명 주석 추가
    board_id = models.AutoField(primary_key=True)  # 게시판 ID
    board_title = models.CharField(max_length=200)  # 제목
    board_contents = models.TextField()  # 내용
    open_date = models.DateTimeField(null=True, blank=True)  # 게시 시작일
    close_date = models.DateTimeField(null=True, blank=True)  # 게시 종료일

    def __str__(self):
        return self.board_title
