# 수정일: 2026-01-20
# 수정내용: 팀원 A (User 담당) - 회원 관련 모델 정의

from django.db import models

class UserProfile(models.Model):
    """
    팀원 A 담당: 사용자 프로필 모델
    """
    # [수정일: 2026-01-21] 테이블명 변경 (gym_user)
    class Meta:
        db_table = 'gym_user'

    user_name = models.CharField(max_length=50)  # 사용자 이름
    user_nickname = models.CharField(max_length=50, null=True, blank=True)  # 사용자 닉네임 (Callsign)
    user_id = models.CharField(max_length=50, unique=True)  # 로그인 아이디
    email = models.EmailField(unique=True)  # 이메일
    birth_date = models.DateField(null=True, blank=True)  # 생년월일
    password = models.CharField(max_length=128)  # 비밀번호   
    # 추가 필드
    create_id = models.CharField(max_length=50, null=True, blank=True)  # 생성자 ID
    update_id = models.CharField(max_length=50, null=True, blank=True)  # 수정자 ID
    create_date = models.DateTimeField(auto_now_add=True)  # 생성일시
    update_date = models.DateTimeField(auto_now=True)  # 수정일시
    use_yn = models.CharField(max_length=1, default='Y')  # 사용여부 (Y/N)
    
    def __str__(self):
        return self.user_name

class UserDetail(models.Model):
    """
    팀원 A 담당: 사용자 상세 정보 모델 (UserProfile과 1:1)
    """
    # [수정일: 2026-01-21] 테이블명 변경 (gym_userdetail)
    class Meta:
        db_table = 'gym_userdetail'

    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='user_detail')
    is_developer = models.BooleanField(default=True)  # 개발자 여부
    job_role = models.CharField(max_length=255, null=True, blank=True)  # 직군
    # [수정일: 2026-01-21] IT INTERESTS (관심 분야) 추가
    interests = models.CharField(max_length=255, null=True, blank=True) 
    
    def __str__(self):
        return f"{self.user.user_name}'s Detail"
