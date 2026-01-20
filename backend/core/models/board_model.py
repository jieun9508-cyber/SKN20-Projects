# 수정일: 2026-01-20
# 수정내용: 팀원 D (Board 담당) - 게시판 관련 모델 정의

from django.db import models

class Post(models.Model):
    """
    팀원 D 담당: 공지사항 모델
    """
    class Meta:
        db_table = 'gym_post'  # 원하는 테이블 이름

    # 2026-01-20 수정: 각 컬럼에 대한 설명 주석 추가
    board_id = models.AutoField(primary_key=True)  # 게시판 ID
    board_title = models.CharField(max_length=200)  # 제목
    board_contents = models.TextField()  # 내용
    open_date = models.DateTimeField(null=True, blank=True)  # 게시 시작일
    close_date = models.DateTimeField(null=True, blank=True)  # 게시 종료일
    create_id = models.CharField(max_length=50, null=True, blank=True)  # 생성자 ID
    create_date = models.DateTimeField(auto_now_add=True)  # 생성일시
    update_id = models.CharField(max_length=50, null=True, blank=True)  # 수정자 ID
    update_date = models.DateTimeField(auto_now=True)  # 수정일시
    use_yn = models.CharField(max_length=1, default='Y')  # 사용여부 (Y/N)

    def __str__(self):
        return self.board_title
