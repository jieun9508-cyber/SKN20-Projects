import openai
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import environ
import os

env = environ.Env()

@method_decorator(csrf_exempt, name='dispatch')
class AIChatView(APIView):
    """
    AI 학습 도우미 챗봇 뷰
    """
    authentication_classes = [] # CSRF 체크 방지를 위해 인증 클래스 비우기
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message')
        quest_context = request.data.get('quest_context', '')
        
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # settings에서 API 키 로드
            api_key = settings.OPENAI_API_KEY
            if not api_key:
                return Response({"error": "API Key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            client = openai.OpenAI(api_key=api_key)
            
            # 시스템 프롬프트 설정 (JRPG 튜터 컨셉)
            system_prompt = f"""
            당신은 'Super Code Adventure' 게임의 AI 튜터 '코드 위저드'입니다.
            현재 사용자는 다음 퀘스트를 수행 중입니다: {quest_context}
            
            평가 및 대화 규칙:
            1. 친절한 JRPG 게임 캐릭터 말투를 사용하세요 (~하오, ~하게나, 혹은 신비로운 마법사 톤).
            2. 사용자가 코드를 제출했을 때(실행결과가 포함된 경우):
               - 실행결과가 '성공'이라면, 논리적 완성도를 칭찬하고 실력이 'A-Rank' 급이라고 치켜세워주세요.
               - 실행결과가 '실패'라면, 안타까워하며 어떤 마법 공식(코드)이 꼬였는지 비유적으로 설명하세요.
               - 제공된 '체크포인트'를 기준으로 사용자의 코드가 해당 기준을 충족하는지 넌지시 언급하세요.
            3. 정답 코드를 바로 알려주지 말고, 스스로 답을 찾을 수 있는 힌트를 단계적으로 제공하세요.
            4. 답변은 한국어로 하며, 텍스트가 너무 길어지지 않게 핵심만 전달하세요.
            """

            response = client.chat.completions.create(
                model="gpt-3.5-turbo", # 또는 gpt-4
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )

            ai_message = response.choices[0].message.content
            return Response({"message": ai_message}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AIEvaluationView(APIView):
    """
    [수정일: 2026-01-27]
    LLM 기반 동적 평가 및 페르소나 분석 뷰
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        quest_data = data.get('quest', {}) # 문제 전체 데이터
        quest_title = quest_data.get('title', 'Unknown Quest')
        quest_desc = quest_data.get('desc', '')
        performance = data.get('performance', {})
        
        try:
            api_key = settings.OPENAI_API_KEY
            client = openai.OpenAI(api_key=api_key)
            
            system_prompt = """
            당신은 소프트웨어 아키텍처 교육 플랫폼의 '인공지능 마스터 평가관'입니다.
            사용자가 방금 푼 문제의 정보(의도, 내용)와 사용자 풀이 데이터를 분석하여 전문적이고 교육적인 피드백을 내려주세요.
            
            반드시 아래 JSON 형식으로만 답변하세요:
            {
              "logicScore": 0-100 정수,
              "codingScore": 0-100 정수,
              "designScore": 0-100 정수,
              "personaTitle": "플레이 스타일에 따른 재미있는 별명",
              "feedbackMessage": "전체 총평, 문제의 학습 가치, 사용자 맞춤 제언을 포함하여 3~4개의 문단으로 구성하세요. 각 문단은 반드시 두 번의 줄바꿈(\\n\\n)으로 구분하여 프론트엔드에서 분리되어 렌더링될 수 있도록 하세요.",
              "totalScore": 0-100 정수
            }
            
            피드백 가이드라인:
            - 단순한 칭찬이 아니라, 문제의 '핵심 로직'이나 '비즈니스 규칙'을 언급하며 전문적으로 설명하세요.
            - 예를 들어 '배달비 자동 계산' 문제라면 '조건부 로직을 통한 비용 최적화'의 중요성을 언급하세요.
            - 사용자의 오답 횟수나 소요 시간에 따라 학습 태도에 대한 코칭도 덧붙여주세요.
            """
            
            user_input = f"""
            [문제 정보]
            - 제목: {quest_title}
            - 설명: {quest_desc}
            
            [사용자 풀이 지표]
            - 총 소요 시간: {performance.get('timeSpent')}초
            - 오답 횟수: {performance.get('penaltyCount')}회
            - 힌트 사용: {performance.get('hintsUsed')}개
            - 2단계 원샷 성공: {performance.get('perkFlags', {}).get('oneShotCoding')}
            - 3단계 설계 성공: {performance.get('perkFlags', {}).get('perfectDesign')}
            
            위 정보를 바탕으로 해당 문제의 교육적 목표 달성 여부를 평가하고, 사용자가 무엇을 배웠는지 설명하는 딥-피드백을 생성해줘.
            """

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                response_format={ "type": "json_object" }
            )

            import json
            try:
                analysis = json.loads(response.choices[0].message.content)
                # 최종 점수가 없을 경우 계산
                if 'totalScore' not in analysis or not analysis['totalScore']:
                    analysis['totalScore'] = int(analysis.get('logicScore', 0) * 0.3 + analysis.get('codingScore', 0) * 0.3 + analysis.get('designScore', 0) * 0.4)
                return Response(analysis, status=status.HTTP_200_OK)
            except Exception as json_err:
                print(f"JSON Parsing Error: {json_err}")
                return Response({"error": "AI response was not valid JSON"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(f"AI Evaluation Exception: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
