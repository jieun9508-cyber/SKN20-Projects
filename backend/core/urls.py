# 수정일: 2026-01-20
# 수정내용: core 앱 내부 라우팅 설정 - 각 담당자별 ViewSet 등록

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (

    UserProfileViewSet,
    ProductViewSet,
    OrderViewSet,
    PostViewSet,
    ReviewViewSet,
    DashboardLogViewSet,
    DashboardLogViewSet,
    CommonViewSet
)
# [2026-01-21] 인증 관련 View Import
from core.views.auth_view import LoginView, LogoutView, SessionCheckView

router = DefaultRouter()

# 공통 예시


# 담당자 A (User)
router.register(r'users', UserProfileViewSet)

# 담당자 B (Product)
router.register(r'products', ProductViewSet)

# 담당자 C (Order)
router.register(r'orders', OrderViewSet)

# 담당자 D (Board)
router.register(r'posts', PostViewSet)

# 담당자 E (Review)
router.register(r'reviews', ReviewViewSet)

# 담당자 F (Dashboard)
router.register(r'dashboard', DashboardLogViewSet)

# 공통 코드
router.register(r'commons', CommonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # [2026-01-21] 인증 API
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', SessionCheckView.as_view(), name='session_check'),
]
