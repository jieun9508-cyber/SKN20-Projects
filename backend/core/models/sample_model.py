# 수정일: 2026-01-20
# 수정내용: 충돌 방지를 위해 모델 파일을 분리하여 작성하는 예시 (Sample 모델)

from django.db import models

class Sample(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
