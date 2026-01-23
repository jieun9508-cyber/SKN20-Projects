# 수정일: 2026-01-22
# 수정내용: Antigravity - Practice 모델 전용 뷰셋 추가

from rest_framework import viewsets, serializers
from core.models import Practice
from .mixins import AuditLogMixin

class PracticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Practice
        fields = '__all__'

class PracticeViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    연습용 모델(Practice) API
    """
    queryset = Practice.objects.all()
    serializer_class = PracticeSerializer
