# 수정일: 2026-01-20
# 수정내용: 팀원 B (Product 담당) - 상품 관련 모델 정의

from django.db import models

class Product(models.Model):
    """
    팀원 B 담당: 상품 정보 모델
    """
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
