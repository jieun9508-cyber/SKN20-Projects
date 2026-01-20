# 수정일: 2026-01-20
# 수정내용: 팀원 A (User 담당) - 회원 관련 뷰 정의

from rest_framework import viewsets, serializers
from core.models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    팀원 A 담당: 회원가입, 프로필 조회 API
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
