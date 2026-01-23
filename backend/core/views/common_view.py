from rest_framework import viewsets, serializers
from core.models import Common

class CommonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Common
        fields = '__all__'

class CommonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    공통 코드 조회 API
    Query Parameter:
    - top_code: 그룹 코드로 필터링 (예: /api/core/commons/?top_code=JOB_ROLE)
    """
    queryset = Common.objects.all()
    serializer_class = CommonSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        top_code = self.request.query_params.get('top_code')
        if top_code:
            queryset = queryset.filter(top_code=top_code)
        return queryset
