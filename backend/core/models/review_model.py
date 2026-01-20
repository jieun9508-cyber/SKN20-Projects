# 수정일: 2026-01-20
# 수정내용: 팀원 E (Review 담당) - 리뷰 및 평점 모델 정의

from django.db import models

class Review(models.Model):
    """
    팀원 E 담당: 상품 리뷰 모델
    """
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    # Product와 User FK 연결 필요
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating: {self.rating}"
