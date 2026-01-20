# 수정일: 2026-01-20
# 수정내용: 팀원 C (Order 담당) - 주문 관련 모델 정의

from django.db import models

class Order(models.Model):
    """
    팀원 C 담당: 주문 정보 모델
    """
    order_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    # 실제로는 User나 Product와 ForeignKey로 연결되어야 함
    status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.order_number
