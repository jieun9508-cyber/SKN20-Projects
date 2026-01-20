# 수정일: 2026-01-20
# 수정내용: 팀원 F (Dashboard 담당) - 관리자/통계 모델 정의

from django.db import models

class DashboardLog(models.Model):
    """
    팀원 F 담당: 대시보드 통계/로그 모델
    """
    event_name = models.CharField(max_length=100)
    event_count = models.IntegerField(default=0)
    recorded_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_name} - {self.event_count}"
