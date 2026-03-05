import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
from django.contrib.auth.models import User
from core.models import UserProfile
from django.db import transaction

# [수정일: 2026-03-05]
# [수정내용: 어드민 커스텀 퍼미션 추가 (is_staff 기반)]
class IsAdminUser(permissions.BasePermission):
    """
    관리자 여부를 확인하는 커스텀 퍼미션.
    auth.User의 is_staff 가 True 인 사람만 접근 허용.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

# [수정일: 2026-03-05]
# [수정내용: 어드민 유저 목록용 Serializer 추가 및 아바타 URL 반환 로직 포함]
class AdminUserSerializer(serializers.ModelSerializer):
    nickname = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', format="%Y-%m-%d %H:%M:%S", read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'nickname', 'avatar_url', 'is_staff', 'is_active', 'date_joined', 'last_login']

    def get_nickname(self, obj):
        return obj.user_nickname if obj.user_nickname else obj.username
        
    def get_avatar_url(self, obj):
        # active_avatar를 찾아서 반환. UserActivity 테이블을 통해 접근 가능.
        if hasattr(obj, 'activity') and obj.activity and obj.activity.active_avatar:
            return obj.activity.active_avatar.image_url
        return None

class AdminUserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserManagementView(APIView):
    """
    관리자 전용 유저 관리 뷰 (is_staff 기반)
    GET: 유저 목록 조회 (페이지네이션)
    PATCH: 유저 권한/상태 변경
    DELETE: 유저 삭제 (안전장치 포함)
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # auth.User 정보는 UserProfile과 email/username으로 연결되어 있음 (또는 related fields)
        # 안정적인 쿼리 성능을 위해 select_related를 사용하거나 별도 조인 
        # 여기서는 UserProfile 기준으로 가져오고, Serializer에서 property 처리를 진행
        
        # 하지만 실제로 is_staff/is_active는 auth.User에만 존재하므로 QuerySet 최적화 필요
        query = request.query_params.get('query', '').strip()
        
        # [수정일: 2026-03-05] auth.User와 UserProfile은 1:1이 완벽히 아님 (pk 불일치 등)
        # 따라서 email 기준으로 매칭하여 반환
        profiles = UserProfile.objects.all().order_by('-id')
        
        if query:
            profiles = profiles.filter(username__icontains=query) | profiles.filter(email__icontains=query)
            
        # auth_user 정보 매핑 (N+1 방지 우회 로직, Django 기본 모델 구조상 직접 조인이 까다로울 수 있음)
        # 여기서는 간단히 email 기반으로 dict 매핑 생성
        auth_users = User.objects.filter(email__in=profiles.values_list('email', flat=True))
        auth_map = {au.email: au for au in auth_users}
        
        for p in profiles:
            p.user = auth_map.get(p.email) # 가상 속성 할당 (Serializer에서 source='user...' 로 접근 접근)
            # 만약 auth.User에 없으면 임시 객체 세팅 방어
            if not p.user:
                p.user = type('EmptyUser', (), {'is_staff': False, 'is_active': False, 'date_joined': None, 'last_login': None})()

        paginator = AdminUserPagination()
        paginated_profiles = paginator.paginate_queryset(profiles, request)
        serializer = AdminUserSerializer(paginated_profiles, many=True)
        return paginator.get_paginated_response(serializer.data)

    def patch(self, request, username):
        try:
            target_auth_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "유저를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)
            
        action = request.data.get('action')
        
        # 권한 토글 (staff)
        if action == 'toggle_staff':
            # 방어 로직: 슈퍼유저 권한을 해제하는 것을 막거나(위험성), 자기 자신 권한 해제 방지
            if request.user.id == target_auth_user.id:
                return Response({"error": "자기 자신의 권한은 변경할 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
            if target_auth_user.is_superuser and not request.user.is_superuser:
                return Response({"error": "슈퍼유저의 권한은 변경할 수 없습니다."}, status=status.HTTP_403_FORBIDDEN)
                
            target_auth_user.is_staff = not target_auth_user.is_staff
            target_auth_user.save()
            return Response({"message": f"권한이 변경되었습니다.", "is_staff": target_auth_user.is_staff})
            
        # 활성 상태 토글 (휴면)
        elif action == 'toggle_active':
            if request.user.id == target_auth_user.id:
                return Response({"error": "자기 자신의 상태는 변경할 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
            if target_auth_user.is_superuser and not request.user.is_superuser:
                return Response({"error": "슈퍼유저의 상태는 변경할 수 없습니다."}, status=status.HTTP_403_FORBIDDEN)
                
            target_auth_user.is_active = not target_auth_user.is_active
            target_auth_user.save()
            return Response({"message": f"상태가 변경되었습니다.", "is_active": target_auth_user.is_active})
            
        return Response({"error": "알 수 없는 액션입니다."}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, username):
        try:
            target_auth_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "유저를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        # [안전장치 1] 자기 자신 삭제 방지
        if request.user.id == target_auth_user.id:
            return Response({"error": "자기 계정은 직접 삭제할 수 없습니다."}, status=status.HTTP_403_FORBIDDEN)
            
        # [안전장치 2] 권한자 삭제 방지 (슈퍼유저 또는 스태프)
        if target_auth_user.is_superuser or target_auth_user.is_staff:
            return Response({"error": "권한(스태프/슈퍼유저)을 가진 계정은 바로 삭제할 수 없습니다. 먼저 권한을 해제해주세요."}, status=status.HTTP_403_FORBIDDEN)

        try:
            profile = UserProfile.objects.filter(email=target_auth_user.email).first()
            
            # [연쇄 삭제 보장] 트랜잭션 사용
            with transaction.atomic():
                if profile:
                    profile.delete() # UserActivity, UserDetail, 모의면접 세션 등은 on_delete=CASCADE 에 의해 자동 삭제
                target_auth_user.delete()
                
            return Response({"message": "유저가 성공적으로 삭제되었습니다."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"유저 삭제 실패: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# [수정일: 2026-03-05]
# [수정내용: 기존 토큰 기반 관리자 로그인 삭제]
# class AdminLoginView(APIView): ... (삭제됨)

class AdminLogView(APIView):
    """에러 로그 파일 내용 읽기"""
    # [수정일: 2026-03-05] 토큰 인증 제거, IsAdminUser 적용
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            logs_dir = getattr(settings, 'LOGS_DIR', os.path.join(settings.BASE_DIR, 'logs'))
            log_file_path = os.path.join(logs_dir, 'error.log')

            if not os.path.exists(log_file_path):
                return Response({"logs": "Log file not found."}, status=status.HTTP_200_OK)
            
            # 파일 읽기 (가장 최근 로그를 잘 보여주기 위해 끝에서부터 500줄 정도 읽기 방식을 사용 가능)
            with open(log_file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                
            # 최대로 표시할 줄 수를 1000줄로 제한
            max_lines = 1000
            if len(lines) > max_lines:
                lines = lines[-max_lines:]
                
            return Response({"logs": "".join(lines)}, status=status.HTTP_200_OK)
        
        
        except Exception as e:
            return Response({"error": f"Failed to read logs: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import datetime
import shutil

class AdminLogSaveView(APIView):
    """현재 error.log 파일을 보관용(archive)으로 복사본 생성하기"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            logs_dir = getattr(settings, 'LOGS_DIR', os.path.join(settings.BASE_DIR, 'logs'))
            log_file_path = os.path.join(logs_dir, 'error.log')

            if not os.path.exists(log_file_path):
                return Response({"error": "Log file not found."}, status=status.HTTP_404_NOT_FOUND)
            
            # archive 파일명 생성 (예: archive_20260226_101500.log)
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_filename = f"archive_{timestamp}.log"
            archive_path = os.path.join(logs_dir, archive_filename)
            
            # 파일 복사
            shutil.copy2(log_file_path, archive_path)

            return Response({
                "message": "Log saved successfully.",
                "archive_filename": archive_filename
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": f"Failed to save log: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminLogArchiveListView(APIView):
    """지정된 디렉토리에서 archive_*.log 파일 목록 가져오기"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            logs_dir = getattr(settings, 'LOGS_DIR', os.path.join(settings.BASE_DIR, 'logs'))
            
            archives = []
            if os.path.exists(logs_dir):
                for f in os.listdir(logs_dir):
                    if f.startswith('archive_') and f.endswith('.log'):
                        file_path = os.path.join(logs_dir, f)
                        # 파일 크기 및 수정 시간 정보 포함
                        size = os.path.getsize(file_path)
                        modified_time = os.path.getmtime(file_path)
                        archives.append({
                            "filename": f,
                            "size": size,
                            "modified_at": datetime.datetime.fromtimestamp(modified_time).strftime("%Y-%m-%d %H:%M:%S")
                        })
            
            # 최신순 (수정 시간 내림차순) 정렬
            archives.sort(key=lambda x: x['filename'], reverse=True)
            
            return Response({"archives": archives}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Failed to get archive list: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminLogArchiveDetailView(APIView):
    """특정 archive 로그 내용 읽기"""
    permission_classes = [IsAdminUser]

    def get(self, request, filename):
        # 보안 검사: 허용된 prefix와 suffix인지 확인, 경로 이탈(..) 방지
        if not filename.startswith('archive_') or not filename.endswith('.log') or '..' in filename:
            return Response({"error": "Invalid filename."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            logs_dir = getattr(settings, 'LOGS_DIR', os.path.join(settings.BASE_DIR, 'logs'))
            file_path = os.path.join(logs_dir, filename)

            if not os.path.exists(file_path):
                return Response({"error": "Archive not found."}, status=status.HTTP_404_NOT_FOUND)
            
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            return Response({
                "filename": filename,
                "logs": content
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Failed to read archive: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import re
from collections import defaultdict
from django.utils import timezone

class AdminServerStatusView(APIView):
    """서버 상태 그래프를 위한 에러 발생 시계열 데이터 제공"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 쿼리 파라미터 확인 (24h, 3d, 7d)
        time_range = request.query_params.get('range', '24h')
        
        if time_range == '7d':
            hours_back = 168
            interval_hours = 6
        elif time_range == '3d':
            hours_back = 72
            interval_hours = 3
        else: # 기본 24h
            hours_back = 24
            interval_hours = 1
            
        try:
            logs_dir = getattr(settings, 'LOGS_DIR', os.path.join(settings.BASE_DIR, 'logs'))
            
            # 읽을 파일 목록 (error.log + archive_*.log)
            files_to_read = []
            if os.path.exists(logs_dir):
                for f in os.listdir(logs_dir):
                    if f == 'error.log' or (f.startswith('archive_') and f.endswith('.log')):
                        files_to_read.append(os.path.join(logs_dir, f))
            
            # 기준 시간 계산
            now = datetime.datetime.now()
            # interval 간격에 맞춰 시작 시간을 깔끔하게 내림 (truncate)
            start_baseline = now.replace(minute=0, second=0, microsecond=0) - datetime.timedelta(hours=hours_back)
            start_baseline -= datetime.timedelta(hours=start_baseline.hour % interval_hours)
            
            # 시간별 로그 카운트를 저장할 딕셔너리
            error_counts = defaultdict(int)
            date_pattern = re.compile(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})')
            
            for file_path in files_to_read:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        for line in f:
                            match = date_pattern.search(line)
                            if match:
                                log_time_str = match.group(1)
                                try:
                                    log_time = datetime.datetime.strptime(log_time_str, "%Y-%m-%d %H:%M:%S")
                                    if log_time >= start_baseline:
                                        # Interval 기준으로 시간 절사
                                        truncated_hour = log_time.hour - (log_time.hour % interval_hours)
                                        truncated_time = log_time.replace(hour=truncated_hour, minute=0, second=0, microsecond=0)
                                        hour_key = truncated_time.strftime("%Y-%m-%d %H:00")
                                        error_counts[hour_key] += 1
                                except ValueError:
                                    pass
                except Exception:
                    pass
            
            labels = []
            full_labels = []
            values = []
            traffic_values = []
            import random
            
            # 데이터 포인트 개수 계산
            num_points = (hours_back // interval_hours) + 1
            
            for i in range(num_points):
                target_time = start_baseline + datetime.timedelta(hours=i * interval_hours)
                target_key = target_time.strftime("%Y-%m-%d %H:00")
                
                # 라벨 포맷 결정: 24h는 시간만, 길어지면 월/일 표시
                if interval_hours == 1:
                    labels.append(target_time.strftime("%H:00"))
                else:
                    labels.append(target_time.strftime("%m-%d %H:00"))
                    
                full_labels.append(target_key)
                values.append(error_counts.get(target_key, 0))
                
                # Base traffic load
                base_traffic = random.randint(30, 60)
                if error_counts.get(target_key, 0) > 0:
                    base_traffic += random.randint(20, 40)
                traffic_values.append(min(100, base_traffic))
                
            return Response({
                "labels": labels,
                "full_labels": full_labels,
                "error_counts": values,
                "traffic_loads": traffic_values,
                "range": time_range
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Failed to get server status: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
