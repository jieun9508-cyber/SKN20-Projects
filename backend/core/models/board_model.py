# 수정일: 2026-01-20
# 수정내용: 팀원 D (Board 담당) - 게시판 관련 모델 정의

from django.db import models

class Post(models.Model):
    """
    팀원 D 담당: 공지사항 및 게시글 모델
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
