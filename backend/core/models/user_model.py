# 수정일: 2026-01-20
# 수정내용: 팀원 A (User 담당) - 회원 관련 모델 정의

from django.db import models

class UserProfile(models.Model):
    """
    팀원 A 담당: 사용자 프로필 모델
    """
    user_name = models.CharField(max_length=50)  # 사용자 이름
    user_id = models.CharField(max_length=50, unique=True)  # 로그인 아이디
    email = models.EmailField(unique=True)  # 이메일
    birth_date = models.DateField(null=True, blank=True)  # 생년월일
    password = models.CharField(max_length=128)  # 비밀번호
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user_name
