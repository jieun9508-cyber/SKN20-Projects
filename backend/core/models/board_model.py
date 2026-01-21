# 수정일: 2026-01-22
# 수정내용: Antigravity - board_id를 Django 표준인 id로 변경

from django.db import models
from .base_model import BaseModel

class Post(BaseModel):
    """
    팀원 D 담당: 공통 모델
    """
    class Meta:
        db_table = 'gym_post'  # 원하는 테이블 이름

    # 2026-01-22 수정: board_id -> id 변경
    id = models.AutoField(primary_key=True)  # 게시판 ID (PK)
    board_title = models.CharField(max_length=200)  # 제목
    board_contents = models.TextField()  # 내용
    open_date = models.DateTimeField(null=True, blank=True)  # 게시 시작일
    close_date = models.DateTimeField(null=True, blank=True)  # 게시 종료일

    def __str__(self):
        return self.board_title
