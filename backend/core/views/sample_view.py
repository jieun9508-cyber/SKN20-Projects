# 수정일: 2026-01-20
# 수정내용: 충돌 방지를 위해 뷰를 파일별로 분리하여 작성 (SampleViewSet)

from rest_framework import viewsets, serializers
from core.models import Sample

# 시리얼라이저 정의 (실제 프로젝트에선 serializers.py로 분리 권장)
class SampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = '__all__'

class SampleViewSet(viewsets.ModelViewSet):
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer
    # 담당자별 API를 여기서 구현
