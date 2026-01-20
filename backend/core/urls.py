# 수정일: 2026-01-20
# 수정내용: core 앱 내부 라우팅 설정 - 각 담당자별 ViewSet 등록

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    SampleViewSet,
    UserProfileViewSet,
    ProductViewSet,
    OrderViewSet,
    PostViewSet,
    ReviewViewSet,
    DashboardLogViewSet
)

router = DefaultRouter()

# 공통 예시
router.register(r'samples', SampleViewSet)

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

urlpatterns = [
    path('', include(router.urls)),
]
