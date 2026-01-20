# 수정일: 2026-01-21
# 수정내용: Django Admin 페이지에 프로젝트 모델(Common, User, Product 등) 등록 및 관리 화면 구성

from django.contrib import admin
from core.models import Common, UserProfile, UserDetail, Product, Order, Post, Review, DashboardLog

# 1. Common (공통 코드) Admin
@admin.register(Common)
class CommonAdmin(admin.ModelAdmin):
    list_display = ('common_id', 'top_code', 'code_id', 'code_name', 'order_number', 'use_yn')
    search_fields = ('top_code', 'code_name', 'code_id')
    list_filter = ('top_code', 'use_yn')
    list_editable = ('order_number', 'use_yn') # 목록에서 바로 수정 가능

# 2. UserProfile (회원) Admin
class UserDetailInline(admin.StackedInline):
    model = UserDetail
    can_delete = False
    verbose_name_plural = 'User Detail'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_id', 'email', 'create_date')
    search_fields = ('user_name', 'user_id', 'email')
    inlines = (UserDetailInline,)

# 3. Product (상품) Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'created_at')
    search_fields = ('name',)

# 4. Order (주문) Admin
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)

# 5. Post (게시판) Admin
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('board_title', 'open_date', 'create_date', 'use_yn')
    search_fields = ('board_title', 'board_contents')

# 6. Review (리뷰) Admin
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('rating', 'created_at')
    list_filter = ('rating',)

# 7. Dashboard (통계) Admin
@admin.register(DashboardLog)
class DashboardLogAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'event_count', 'recorded_date')
