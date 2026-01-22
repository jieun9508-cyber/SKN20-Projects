# 수정일: 2026-01-22
# 수정내용: Antigravity - Post에서 Notice로 명칭 변경 반영

from rest_framework import viewsets, serializers
from core.models import Notice
from .mixins import AuditLogMixin

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'

class NoticeViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    팀원 D 담당: 공지사항 API (Post -> Notice 리팩토링)
    """
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
