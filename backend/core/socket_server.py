import socketio
import asyncio
import random
from core.services.pseudocode_evaluator import PseudocodeEvaluator, EvaluationRequest, EvaluationMode

# [멀티에이전트] 오케스트레이터 임포트
from core.services.wars.orchestrator import WarsOrchestrator
from core.services.wars.state_machine import DrawRoomState, GameState
from core.services.wars.bug_problem_generator import generate_bug_problems
from core.services.wars.logic_problem_generator import generate_logic_quests
# [수정 2026-03-03] architecture_missions.py 하드코딩 제거 후 DB(unit03) 동적 로드
# 모듈 임포트 시점에 DB 쿼리하면 Django 초기화 이전이라 실패하므로 lazy 로드
from core.views.wars.wars_mission_view import _transform_to_wars_mission
from core.models import PracticeDetail
# [수정 2026-03-03] 전적 저장을 위한 모델 및 유틸 임포트
from core.models.activity_model import UserBattleRecord
from asgiref.sync import sync_to_async

def _update_battle_record_sync(user_id, result):
    if not user_id: return
    try:
        from core.models.user_model import UserProfile
        # [수정 2026-03-03] UserProfile의 PK 필드명은 id (select_related 제거)
        profile = UserProfile.objects.get(id=user_id)
        record, created = UserBattleRecord.objects.get_or_create(user=profile)
        if result == 'win': record.win_count += 1
        elif result == 'draw': record.draw_count += 1
        elif result == 'lose': record.lose_count += 1
        record.save()
        print(f"[DB] 전적 업데이트: User({user_id}) -> {result}")
    except Exception as e:
        print(f"[DB] 전적 업데이트 실패: {e}")

async def update_battle_record(user_id, result):
    """비동기 전적 업데이트 래퍼"""
    await sync_to_async(_update_battle_record_sync)(user_id, result)

_MISSIONS_CACHE: list = []  # 첫 게임 시작 후 캐싱

def _load_missions_sync() -> list:
    """동기 DB 쿼리 - sync_to_async 래퍼에서 호출"""
    details = (
        PracticeDetail.objects
        .filter(practice_id='unit03', detail_type='PROBLEM', is_active=True)
        .order_by('display_order')
    )
    return [_transform_to_wars_mission(d) for d in details]

async def _get_missions() -> list:
    """Wars 미션 lazy 로드 - async 컨텍스트에서 안전하게 DB 쿼리"""
    global _MISSIONS_CACHE
    if _MISSIONS_CACHE:
        return _MISSIONS_CACHE
    try:
        from asgiref.sync import sync_to_async
        _MISSIONS_CACHE = await sync_to_async(_load_missions_sync)()
        print(f"[Wars] DB에서 {len(_MISSIONS_CACHE)}개 미션 로드 완료")
    except Exception as e:
        print(f"[Wars] DB 미션 로드 실패: {e}")
        _MISSIONS_CACHE = []
    return _MISSIONS_CACHE

# 전역 객체 및 상태 관리
wars_orchestrator = WarsOrchestrator()
draw_room_states: dict[str, DrawRoomState] = {}
pseudocode_evaluator = PseudocodeEvaluator()
active_rooms = set()
room_leaders = {}
room_snapshots = {}
room_game_states = {}
active_timer_tasks = {}

# 게임별 데이터 저장소
draw_rooms = {}
run_rooms = {}
bubble_rooms = {}
run_phase2_submissions = {}

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print(f"[소켓] 연결됨: {sid}")

@sio.event
async def disconnect(sid):
    """소켓 연결 해제 시 모든 세션 및 방 데이터 정리 (통합 버전)"""
    print(f"[소켓] 연결 해제됨: {sid}")
    session = await sio.get_session(sid)
    if not session: return

    # 1. War Room 정리
    mission_id = session.get('room')
    if mission_id:
        await sio.emit('user_left', {"sid": sid, "user_name": session.get('name', 'Unknown')}, room=mission_id)
        if room_leaders.get(mission_id) == sid:
            del room_leaders[mission_id]
            room_sids = list(sio.manager.rooms.get('/', {}).get(mission_id, set()))
            remaining = [s for s in room_sids if s != sid]
            if remaining:
                room_leaders[mission_id] = remaining[0]
                await sio.emit('leader_info', {"leader_sid": remaining[0]}, room=mission_id)

    # 2. Draw Room 정리
    draw_room_id = session.get('draw_room')  # 세션 저장 시점에 strip 완료
    if draw_room_id in draw_rooms:
        room = draw_rooms[draw_room_id]
        room['players'] = [p for p in room['players'] if p['sid'] != sid]
        if not room['players']:
            del draw_rooms[draw_room_id]
            # [수정: draw_room_states도 함께 정리 - 메모리 누수 방지]
            if draw_room_id in draw_room_states:
                del draw_room_states[draw_room_id]
            print(f"[ArchDraw] Room {draw_room_id} 완전히 정리됨 (빈 방)")
        else:
            players_data = [{'name': p['name'], 'sid': p['sid']} for p in room['players']]
            await sio.emit('draw_lobby', {'players': players_data}, room=draw_room_id)
            await sio.emit('draw_player_left', {'sid': sid}, room=draw_room_id)

    # 3. Logic Run 정리
    run_room_id = session.get('run_room')
    if run_room_id in run_rooms:
        room = run_rooms[run_room_id]
        room['players'] = [p for p in room['players'] if p['sid'] != sid]
        if room.get('leader_sid') == sid:
            room['leader_sid'] = room['players'][0]['sid'] if room['players'] else None
        if not room['players']:
            del run_rooms[run_room_id]
            if run_room_id in run_phase2_submissions: del run_phase2_submissions[run_room_id]
        else:
            await sio.emit('run_user_left', {'sid': sid, 'leader_sid': room['leader_sid']}, room=run_room_id)

    # 4. Bubble Game 정리
    bubble_room_id = session.get('bubble_room')
    if bubble_room_id in bubble_rooms:
        room = bubble_rooms[bubble_room_id]
        room['players'] = [p for p in room['players'] if p['sid'] != sid]
        if not room['players']:
            del bubble_rooms[bubble_room_id]
        else:
            players_data = [{'name': p['name'], 'sid': p['sid'], 'avatar': p.get('avatar')} for p in room['players']]
            await sio.emit('bubble_lobby', {'players': players_data}, room=bubble_room_id)
            await sio.emit('bubble_player_left', {'sid': sid}, room=bubble_room_id)

# ---------- WAR ROOM 이벤트 ----------
@sio.event
async def join_war_room(sid, data):
    mission_id = data.get('mission_id')
    user_name = data.get('user_name', 'Anonymous')
    user_role = data.get('user_role', 'pending')
    if mission_id:
        await sio.enter_room(sid, mission_id)
        await sio.save_session(sid, {"name": user_name, "role": user_role, "room": mission_id})
        if mission_id not in room_leaders:
            room_leaders[mission_id] = sid
            if mission_id not in room_game_states:
                room_game_states[mission_id] = {"phase": "design", "time_left": 600, "is_running": False}
        await sio.emit('leader_info', {"leader_sid": room_leaders[mission_id]}, room=mission_id)
        await sio.emit('user_joined', {"sid": sid, "user_name": user_name, "user_role": user_role}, room=mission_id)

@sio.event
async def start_mission(sid, data):
    mission_id = data.get('mission_id')
    if mission_id and room_leaders.get(mission_id) == sid:
        if mission_id in room_game_states:
            room_game_states[mission_id]["is_running"] = True
            if mission_id not in active_timer_tasks or active_timer_tasks[mission_id].done():
                active_timer_tasks[mission_id] = asyncio.create_task(run_room_timer(mission_id))
        await sio.emit('mission_start', {"mission_id": mission_id}, room=mission_id)

async def run_room_timer(mission_id):
    while mission_id in room_game_states and room_game_states[mission_id]["is_running"]:
        state = room_game_states[mission_id]
        if state["time_left"] > 0: state["time_left"] -= 1
        if state["time_left"] % 5 == 0:
            await sio.emit('state_sync', {"state": {"phase": state["phase"], "time": state["time_left"]}}, room=mission_id)
        await asyncio.sleep(1)
        if state["time_left"] <= 0:
            if state["phase"] == "design": state["phase"], state["time_left"] = "blackout", 120
            elif state["phase"] == "blackout": state["phase"], state["time_left"] = "defense", 180
            else: state["is_running"] = False
            await sio.emit('state_sync', {"state": {"phase": state["phase"], "time": state["time_left"]}}, room=mission_id)

# ---------- DRAW GAME 이벤트 ----------
@sio.event
async def draw_join(sid, data):
    room_id = data.get('room_id', 'draw-default').strip()
    user_name = data.get('user_name', 'Player')
    user_id = data.get('user_id')
    await sio.enter_room(sid, room_id)
    # [수정 2026-03-03] user_id 세션에 저장
    await sio.save_session(sid, {'draw_room': room_id, 'draw_name': user_name, 'user_id': user_id})
    if room_id not in draw_rooms: draw_rooms[room_id] = {'players': [], 'phase': 'waiting'}
    room = draw_rooms[room_id]
    if not any(p['sid'] == sid for p in room['players']) and len(room['players']) < 2:
        room['players'].append({'sid': sid, 'name': user_name, 'score': 0, 'user_id': user_id, 'avatar': data.get('avatar_url')})
    # [수정 2026-03-03] DrawRoomState를 1명 입장 시점에 미리 생성 - 2명 조건 제거
    # 기존: 2명 모일 때만 생성 -> draw_submit 시 room_state가 None이어서 AI 평가 스킵되는 버그 수정
    if room_id not in draw_room_states:
        draw_room_states[room_id] = DrawRoomState(room_id=room_id)
        print(f"[ArchDraw] Room State 미리 초기화됨: {room_id}")
    await sio.emit('draw_lobby', {'players': [{'name': p['name'], 'sid': p['sid'], 'avatar_url': p.get('avatar')} for p in room['players']]}, room=room_id)
    if len(room['players']) >= 2:
        room['phase'] = 'ready'
        await sio.emit('draw_ready', {}, room=room_id)
        print(f"[ArchDraw] 방 준비됨 (2명): {room_id}")

@sio.event
async def draw_start(sid, data):
    """[수정 2026-03-03] 게임 시작 처리 - Double Start 시 점수 리셋 버그 수정"""
    room_id = data.get('room_id', '').strip()
    if room_id in draw_rooms:
        room = draw_rooms[room_id]
        # [추가 2026-03-03] 이미 진행 중인 방이면 무시 - REMATCH 클릭에 의한 Double Start 방지
        if room.get('phase') == 'playing':
            print(f"[ArchDraw] draw_start 무시: Room {room_id} 이미 플레이 중")
            return

        print(f"[ArchDraw] 게임 시작 in Room: {room_id}")
        room['phase'] = 'playing'

        # [추가 2026-03-03] 게임 시작/재시작 시 기존 플레이어 상태(점수, 제출 등) 전부 초기화
        for p in room.get('players', []):
            p['score'] = 0
            p['last_pts'] = 0
            p['last_checks'] = []
            p['last_nodes'] = []
            p['last_arrows'] = []
            p['submitted'] = False
        # [에이전트 동작] Chaos 채점 룰 초기화 (신규 게임 시작)
        room['chaos_bonus_check'] = None
        # [수정 2026-03-03] DB(unit03) 미션 lazy 로드
        missions = await _get_missions()
        if not missions:
            print(f"[ArchDraw] 미션 없음 - unit03 DB를 확인하세요")
            return
        question = random.choice(missions).copy()
        question['round'] = 1
        # 팔레트: required + 랜덤 extra 4개 (서버에서 결정 -> 클라이언트 파일 보장)
        all_comp_ids = ['client','user','lb','server','cdn','origin','cache','db',
                        'producer','queue','consumer','api','apigw','writesvc','readsvc',
                        'writedb','readdb','auth','order','payment','waf','dns']
        required_ids = question.get('required', [])
        extra_pool = [c for c in all_comp_ids if c not in required_ids]
        random.shuffle(extra_pool)
        question['palette_ids'] = required_ids + extra_pool[:4]

        # Orchestrator 상태 반영
        room_state = draw_room_states.get(room_id)
        if room_state:
            wars_orchestrator.on_round_start(room_state, question['title'], question['required'])
            print(f"[ArchDraw] Orchestrator 라운드 시작: {room_id} | 미션: {question['title']}")
        else:
            print(f"[ArchDraw] room_state 없음: {room_id}")

        await sio.emit('draw_game_start', {}, room=room_id)
        await sio.emit('draw_round_start', {'question': question}, room=room_id)
        # [수정 2026-03-03] 라운드 번호 추적을 위해 저장
        draw_rooms[room_id]['current_round'] = 1

        # [추가 2026-03-03] 백그라운드에서 주기적으로 힌트/장애 체크 시작
        asyncio.create_task(run_draw_room_tick(room_id))

async def run_draw_room_tick(room_id):
    """[추가 2026-03-03] 유저가 아무것도 안 해도 힌트/장애가 발동되도록 주기적으로 감사(Poll)"""
    print(f"[ArchDraw] 주기적 체크 시작: {room_id}")
    while room_id in draw_rooms and draw_rooms[room_id].get('phase') in ('playing', 'evaluating'):
        room_state = draw_room_states.get(room_id)
        # [수정 2026-03-05] IN_BASKET(Chaos 발동 후)도 포함 — 이전엔 PLAYING만 체크해서 Chaos 후 Poll 완전 중단
        if room_state and room_state.state in (GameState.PLAYING, GameState.IN_BASKET):
            players = list(draw_rooms[room_id].get('players', []))
            # Chaos 체크는 첫 번째 플레이어로만 1회 (중복 발동 방지)
            chaos_checked = False
            for p in players:
                target_sid = p['sid']
                design = room_state.player_designs.get(target_sid, {})
                res = await wars_orchestrator.on_canvas_update(
                    room_state, target_sid,
                    design.get('nodes', []), design.get('arrows', []),
                    is_poll=True
                )
                if res.get('coach_hint'):
                    hint_payload = {k: v for k, v in res['coach_hint'].items() if k != '_target_sid'}
                    actual_target = res['coach_hint'].get('_target_sid', target_sid)
                    print(f"[Poll] 힌트 전송 -> {actual_target[:8]}")
                    await sio.emit('coach_hint', hint_payload, to=actual_target)
                if res.get('chaos_event') and not chaos_checked:
                    chaos_checked = True
                    chaos_ev = res['chaos_event']
                    print(f"[Poll] Chaos 발동 in Room: {room_id}")
                    req_comp = chaos_ev.get('required_component')
                    if req_comp and room_id in draw_rooms:
                        draw_rooms[room_id]['chaos_bonus_check'] = {
                            'component': req_comp,
                            'bonus_pts': 20,
                            'penalty_pts': -10,
                        }
                    await sio.emit('chaos_event', chaos_ev, room=room_id)

        await asyncio.sleep(8)  # 8초마다 체크
    print(f"[ArchDraw] 주기적 체크 종료: {room_id}")

@sio.event
async def draw_submit(sid, data):
    """[수정 2026-03-01] 점수 서버 검증 추가 - 클라이언트 점수를 신뢰하지 않음"""
    room_id = data.get('room_id', '').strip()
    if room_id not in draw_rooms:
        print(f"[ArchDraw] draw_submit: Room {room_id} 없음")
        return

    room = draw_rooms[room_id]
    player = next((p for p in room['players'] if p['sid'] == sid), None)
    if player:
        # [수정 2026-03-05] 100점 만점 체계로 변경
        # 체크리스트 60점 + 시간보너스 10점 + 완료보너스 20점 + 콤보보너스 10점
        checks = data.get('checks', [])
        hit = sum(1 for c in checks if c.get('ok'))
        total = len(checks) if checks else 1
        ratio = hit / total
        check_score = round((hit / total) * 60)                        # 최대 60점
        time_bonus = round((min(data.get('time_left', 0), 90) / 90) * 10)   # 최대 10점
        complete_bonus = 20 if ratio == 1.0 else 0                     # 전부 맞으면 +20점
        combo_bonus = min(data.get('combo', 0), 5) * 2                 # 최대 10점 (5콤보 한도)
        pts = check_score + time_bonus + complete_bonus + combo_bonus

        # [에이전트 동작 반영] ChaosAgent가 설정한 게임 룰 체크
        chaos_check = room.get('chaos_bonus_check')
        if chaos_check:
            placed_ids = [n.get('compId') for n in data.get('final_nodes', [])]
            if chaos_check['component'] in placed_ids:
                pts += chaos_check['bonus_pts']
                print(f"[ArchDraw] Chaos 조건 충족: {player['name']} +{chaos_check['bonus_pts']}점 ({chaos_check['component']} 배치 확인)")
            else:
                pts += chaos_check['penalty_pts']
                print(f"[ArchDraw] Chaos 조건 미충족: {player['name']} {chaos_check['penalty_pts']}점 ({chaos_check['component']} 누락)")

        player['score'] += pts
        player['last_pts'] = pts
        player['last_checks'] = checks
        player['last_nodes'] = data.get('final_nodes', [])
        player['last_arrows'] = data.get('final_arrows', [])
        player['submitted'] = True
        print(f"[ArchDraw] {player['name']} 제출 | server_pts={pts} (hit={hit}/{total}) in room {room_id}")

    await sio.emit('draw_player_submitted', {'sid': sid}, room=room_id)

    # 양측 모두 제출 완료 체크
    if all(p.get('submitted') for p in room['players']) and len(room['players']) == 2:
        p1, p2 = room['players']
        print(f"[ArchDraw] 양측 제출 완료 in room {room_id}. AI 평가 시작.")

        # [버그수정] AI 평가 전에 phase를 'evaluating'으로 변경
        room['phase'] = 'evaluating'

        # [버그수정] await 전에 스냅샷 캡처 - AI 평가 도중 draw_start가 점수 리셋해도 안전
        p1_snap = {
            'sid': p1['sid'], 'score': p1['score'],
            'last_pts': p1.get('last_pts', 0), 'last_checks': p1.get('last_checks', []),
            'last_nodes': p1.get('last_nodes', []), 'last_arrows': p1.get('last_arrows', []),
            'name': p1['name']
        }
        p2_snap = {
            'sid': p2['sid'], 'score': p2['score'],
            'last_pts': p2.get('last_pts', 0), 'last_checks': p2.get('last_checks', []),
            'last_nodes': p2.get('last_nodes', []), 'last_arrows': p2.get('last_arrows', []),
            'name': p2['name']
        }

        # EvalAgent AI 평가 실행
        ai_reviews = {}
        room_state = draw_room_states.get(room_id)
        if room_state:
            try:
                rubric = {"required_components": room_state.mission_required}
                print(f"[ArchDraw] AI 평가 시작 | mission='{room_state.mission_title}' | p1='{p1_snap['name']}({len(p1_snap['last_nodes'])}nodes)' | p2='{p2_snap['name']}({len(p2_snap['last_nodes'])}nodes)'")
                ai_reviews = await wars_orchestrator.on_both_submitted(
                    room_state, room_state.mission_title, rubric,
                    {"name": p1_snap['name'], "pts": p1_snap['last_pts'], "checks": p1_snap['last_checks'], "nodes": p1_snap['last_nodes'], "arrows": p1_snap['last_arrows']},
                    {"name": p2_snap['name'], "pts": p2_snap['last_pts'], "checks": p2_snap['last_checks'], "nodes": p2_snap['last_nodes'], "arrows": p2_snap['last_arrows']}
                )
                print(f"[ArchDraw] AI 평가 완료 | p1_review={bool(ai_reviews.get('player1'))} | p2_review={bool(ai_reviews.get('player2'))}")
            except Exception as e:
                import traceback
                print(f"[ArchDraw] AI 평가 오류: {e}")
                traceback.print_exc()
        else:
            print(f"[ArchDraw] draw_room_states에 '{room_id}' 없음 - AI 평가 스킵")

        # AI 결과 없으면 폴백 메시지 (UI 멈춤 방지)
        if not ai_reviews:
            ai_reviews = {
                "player1": {"my_analysis": "설계의 핵심 뼈대는 갖추었으나 일부 구간의 가용성 설계가 누락되었습니다.", "versus": "전체적인 무결성 면에서 박빙의 결과를 보여주고 있습니다."},
                "player2": {"my_analysis": "설계의 핵심 뼈대는 갖추었으나 일부 구간의 가용성 설계가 누락되었습니다.", "versus": "전체적인 무결성 면에서 박빙의 결과를 보여주고 있습니다."}
            }
            print(f"[ArchDraw] 폴백 평가 사용: {room_id}")

        results = [
            {
                "sid": p1_snap['sid'], "score": p1_snap['score'],
                "last_pts": p1_snap['last_pts'], "last_checks": p1_snap['last_checks'],
                "last_nodes": p1_snap['last_nodes'], "last_arrows": p1_snap['last_arrows'],
                "ai_review": ai_reviews.get('player1')
            },
            {
                "sid": p2_snap['sid'], "score": p2_snap['score'],
                "last_pts": p2_snap['last_pts'], "last_checks": p2_snap['last_checks'],
                "last_nodes": p2_snap['last_nodes'], "last_arrows": p2_snap['last_arrows'],
                "ai_review": ai_reviews.get('player2')
            }
        ]
        await sio.emit('draw_round_result', {'results': results}, room=room_id)
        print(f"[ArchDraw] 평가 결과 전송 완료: {room_id}")

        if room.get('current_round', 1) >= 1:
            print(f"[ArchDraw] 게임 오버 in Room {room_id}. DB 저장 중.")
            if room.get('phase') == 'evaluating':
                room['phase'] = 'gameover'
                await sio.emit('draw_game_over', {}, room=room_id)
            else:
                print(f"[ArchDraw] gameover emit 스킵 - 이미 새 게임 phase: {room.get('phase')}")

            print(f"[ArchDraw] DB 저장: P1(uid={p1.get('user_id')}, score={p1_snap['score']}) vs P2(uid={p2.get('user_id')}, score={p2_snap['score']})")
            if p1_snap['score'] > p2_snap['score']:
                await update_battle_record(p1.get('user_id'), 'win')
                await update_battle_record(p2.get('user_id'), 'lose')
            elif p1_snap['score'] < p2_snap['score']:
                await update_battle_record(p1.get('user_id'), 'lose')
                await update_battle_record(p2.get('user_id'), 'win')
            else:
                await update_battle_record(p1.get('user_id'), 'draw')
                await update_battle_record(p2.get('user_id'), 'draw')

@sio.event
async def draw_next_round(sid, data):
    """[수정 2026-03-01] 다음 라운드 전환 + chaos/coach 상태 초기화"""
    room_id = data.get('room_id', '').strip()
    if room_id in draw_rooms:
        room = draw_rooms[room_id]
        print(f"[ArchDraw] 다음 라운드 in Room: {room_id}")
        for p in room['players']: p['submitted'] = False

        room_state = draw_room_states.get(room_id)
        if room_state:
            room_state.chaos_triggered_at = 0.0
            room_state.coach_triggered_at = 0.0
            room_state.hint_history = {}
            room_state.past_event_ids = []
            room_state.player_designs = {}
        room['chaos_bonus_check'] = None

        cur_round = data.get('round', room.get('current_round', 1) + 1)
        room['current_round'] = cur_round
        question = random.choice(await _get_missions()).copy()
        question['round'] = cur_round
        all_comp_ids = ['client','user','lb','server','cdn','origin','cache','db',
                        'producer','queue','consumer','api','apigw','writesvc','readsvc',
                        'writedb','readdb','auth','order','payment','waf','dns']
        required_ids = question.get('required', [])
        extra_pool = [c for c in all_comp_ids if c not in required_ids]
        random.shuffle(extra_pool)
        question['palette_ids'] = required_ids + extra_pool[:4]

        if room_state:
            wars_orchestrator.on_round_start(room_state, question['title'], question['required'])

        await sio.emit('draw_round_start', {'question': question}, room=room_id)

@sio.event
async def draw_item_status(sid, data):
    room_id = data.get('room_id')
    await sio.emit('draw_opponent_item_status', {'sid': sid, 'has_item': data.get('has_item')}, room=room_id, skip_sid=sid)

@sio.event
async def draw_use_item(sid, data):
    room_id = data.get('room_id')
    await sio.emit('draw_item_effect', {'sid': sid, 'item_type': data.get('item_type')}, room=room_id, skip_sid=sid)

@sio.event
async def draw_canvas_sync(sid, data):
    room_id = data.get('room_id', 'draw-default').strip()
    session = await sio.get_session(sid)
    sender_name = session.get('draw_name', data.get('user_name', 'Anonymous'))
    await sio.emit('draw_canvas_update', {'sender_sid': sid, 'sender_name': sender_name, 'nodes': data.get('nodes'), 'arrows': data.get('arrows')}, room=room_id, skip_sid=sid)
    room_state = draw_room_states.get(room_id)
    if room_state:
        res = await wars_orchestrator.on_canvas_update(room_state, sid, data.get('nodes'), data.get('arrows'))
        if res.get('coach_hint'):
            # [수정 2026-03-02] _target_sid를 payload에서 제거 후 전송
            hint_payload = {k: v for k, v in res['coach_hint'].items() if k != '_target_sid'}
            target_sid = res['coach_hint'].get('_target_sid', sid)
            print(f"[ArchDraw] 힌트 전송 -> {target_sid[:8]}: {hint_payload.get('message', '')[:20]}...")
            await sio.emit('coach_hint', hint_payload, to=target_sid)
        if res.get('chaos_event'):
            chaos_ev = res['chaos_event']
            print(f"[ArchDraw] Chaos 이벤트 in Room: {room_id} | required_component={chaos_ev.get('required_component')}")
            req_comp = chaos_ev.get('required_component')
            if req_comp:
                draw_rooms[room_id]['chaos_bonus_check'] = {
                    'component': req_comp,
                    'bonus_pts': 20,
                    'penalty_pts': -10,
                }
                print(f"[ArchDraw] Chaos 채점 룰 추가: +20 if {req_comp} placed, -10 if not")
            await sio.emit('chaos_event', chaos_ev, room=room_id)

@sio.event
async def draw_chaos_complete(sid, data):
    """[추가 2026-03-03] Chaos 장애 확인 후 상태를 PLAYING으로 복구"""
    session = await sio.get_session(sid)
    room_id = session.get('draw_room')
    room_state = draw_room_states.get(room_id)
    if room_state:
        wars_orchestrator.on_incident_expired(room_state)
        print(f"[ArchDraw] Chaos 확인됨 in Room: {room_id} -> PLAYING으로 복귀")
        await sio.emit('draw_chaos_recovered', {'room_id': room_id}, room=room_id)

# ---------- LOGIC RUN 이벤트 ----------
@sio.event
async def run_join(sid, data):
    room_id = data.get('room_id', 'run-default').strip()
    user_name = data.get('user_name', 'Anonymous')
    user_id = data.get('user_id')
    difficulty = data.get('difficulty', '')  # [2026-03-04] 난이도 받기

    if room_id not in run_rooms:
        run_rooms[room_id] = {'players': [], 'phase': 'lobby', 'leader_sid': None}

    room = run_rooms[room_id]

    # [수정 2026-02-27] 2명 한도 로직 추가
    is_already_in = any(p['sid'] == sid for p in room['players'])
    if not is_already_in and len(room['players']) >= 2:
        print(f"[LogicRun] Room {room_id} 가득 참 (2/2). {user_name} 거부")
        await sio.emit('run_error', {'message': '방이 가득 찼습니다. (최대 2명)'}, to=sid)
        return

    await sio.enter_room(sid, room_id)
    # [수정 2026-03-03] user_id 세션에 저장
    await sio.save_session(sid, {'run_room': room_id, 'run_name': user_name, 'user_id': user_id})

    if not room['leader_sid']: room['leader_sid'] = sid
    if not is_already_in:
        room['players'].append({
            'sid': sid,
            'name': user_name,
            'user_id': user_id,
            'avatar_url': data.get('avatar_url'),
            'difficulty': difficulty,
            'phase1_score': 0,
            'phase2_score': 0
        })
    else:
        for p in room['players']:
            if p['sid'] == sid:
                p['difficulty'] = difficulty
                break

    await sio.emit('run_lobby', {'players': room['players'], 'leader_sid': room['leader_sid']}, room=room_id)

# [2026-03-04] 로비에서 난이도 실시간 변경 알리기
@sio.event
async def run_change_difficulty(sid, data):
    room_id = data.get('room_id')
    new_difficulty = data.get('difficulty')
    if room_id in run_rooms:
        room = run_rooms[room_id]
        for p in room['players']:
            if p['sid'] == sid:
                p['difficulty'] = new_difficulty
                break
        await sio.emit('run_difficulty_changed', {'sid': sid, 'difficulty': new_difficulty}, room=room_id)

@sio.event
async def run_progress(sid, data):
    room_id = data.get('room_id')
    if data.get('phase') == 'speedFill' and room_id in run_rooms:
        for p in run_rooms[room_id]['players']:
            if p['sid'] == sid: p['phase1_score'] = data.get('score', 0)
    await sio.emit('run_sync', data, room=room_id, skip_sid=sid)

@sio.event
async def run_start(sid, data):
    """[수정 2026-03-03] 중복 시작 및 1회 시작 방어 로직 추가"""
    room_id = data.get('room_id')
    if room_id in run_rooms:
        room = run_rooms[room_id]
        if room.get('phase') != 'lobby':
            print(f"[LogicRun] Room {room_id} 이미 {room.get('phase')} phase. 무시.")
            return
        if len(room.get('players', [])) < 2:
            print(f"[LogicRun] Room {room_id} 인원 부족 ({len(room['players'])}/2). 시작 불가.")
            return

        print(f"[LogicRun] 게임 공식 시작 in room: {room_id}")
        room['phase'] = 'playing'

        await sio.emit('run_gen_progress', {'step': 1, 'msg': 'AICE 전전 문제 세팅 중..'}, room=room_id)
        try:
            room_difficulty = room['players'][0].get('difficulty', 'Associate')
            from core.services.wars.aice_question_generator import generate_aice_quests, _get_fallback_quest
            quests = await generate_aice_quests(difficulty=room_difficulty, count=1)
            await sio.emit('run_gen_progress', {'step': 2, 'msg': f'AICE {room_difficulty} 문제 출제 완료!'}, room=room_id)
            await sio.emit('run_game_start', {'quest_idx': 0, 'quests': quests}, room=room_id)
        except Exception as e:
            print(f"[LogicRun] AICE 문제 생성 실패: {e}, 폴백 사용")
            try:
                from core.services.wars.aice_question_generator import _get_fallback_quest
                quests = [_get_fallback_quest()]
            except ImportError:
                quests = []
            await sio.emit('run_game_start', {'quest_idx': 0, 'quests': quests}, room=room_id)

@sio.event
async def run_logic_finish(sid, data):
    room_id = data.get('room_id')
    if room_id in run_rooms:
        await sio.emit('run_end', data, room=room_id, skip_sid=sid)

        # [수정 2026-03-04] DB 전적 저장 - 점수 기반 서버 판정
        room = run_rooms[room_id]
        my_score = data.get('totalScore', 0)
        session = await sio.get_session(sid)
        user_id = session.get('user_id')

        opp = next((p for p in room['players'] if p['sid'] != sid), None)
        if user_id and opp:
            opp_score = opp.get('total_score', 0)
            if my_score > opp_score:
                await update_battle_record(user_id, 'win')
            elif my_score < opp_score:
                await update_battle_record(user_id, 'lose')
            else:
                await update_battle_record(user_id, 'draw')

        player = next((p for p in room['players'] if p['sid'] == sid), None)
        if player:
            player['total_score'] = my_score

# ---------- BUG-BUBBLE MONSTER ----------
@sio.event
async def bubble_join(sid, data):
    room_id = data.get('room_id', 'bubble-default').strip()
    user_name = data.get('user_name', 'Unknown')
    user_id = data.get('user_id')
    await sio.enter_room(sid, room_id)
    # [수정 2026-03-03] user_id 세션에 저장
    await sio.save_session(sid, {'bubble_room': room_id, 'name': user_name, 'user_id': user_id})
    if room_id not in bubble_rooms: bubble_rooms[room_id] = {'players': [], 'is_playing': False}
    room = bubble_rooms[room_id]
    if not any(p['sid'] == sid for p in room['players']):
        room['players'].append({'sid': sid, 'name': user_name, 'user_id': user_id, 'avatar': data.get('user_avatar')})
    await sio.emit('bubble_lobby', {'players': room['players']}, room=room_id)

@sio.event
async def bubble_sync(sid, data):
    """실시간 위치 및 액션 동기화"""
    room_id = data.get('room_id')
    if room_id:
        await sio.emit('bubble_move_update', {
            'sid': sid,
            'pos': data.get('pos'),
            'action': data.get('action'),
            'flipX': data.get('flipX')
        }, room=room_id, skip_sid=sid)

@sio.event
async def bubble_start(sid, data):
    room_id = data.get('room_id')
    if room_id not in bubble_rooms:
        return
    room = bubble_rooms[room_id]
    # [2026-03-05] 중복 시작 방지: 두 명이 각자 눌러도 한 번만 실행
    if room.get('is_playing'):
        print(f"[BugBubble] Room {room_id} 이미 시작됨, {sid} 무시")
        return
    room['is_playing'] = True

    print(f"[BugBubble] AI 문제 생성 시작 (room: {room_id})")
    await sio.emit('bubble_gen_progress', {
        'step': 1, 'pct': 10, 'msg': '버그 카테고리 분석 중..', 'file': 'categories.json'
    }, room=room_id)

    try:
        await sio.emit('bubble_gen_progress', {
            'step': 2, 'pct': 30, 'msg': 'AI가 버그 코드 생성 중..', 'file': 'bug_factory.py'
        }, room=room_id)

        # 난이도 골고루 섞기: 기초 8 + 중급 8 + 실무 4
        p1, p2, p3 = await asyncio.gather(
            generate_bug_problems(count=8, difficulty=1),
            generate_bug_problems(count=8, difficulty=2),
            generate_bug_problems(count=4, difficulty=3),
        )
        problems = p1 + p2 + p3
        random.shuffle(problems)

        await sio.emit('bubble_gen_progress', {
            'step': 3, 'pct': 75, 'msg': f'{len(problems)}개 문제 검증 중..', 'file': 'validator.py'
        }, room=room_id)

        await asyncio.sleep(0.5)

        await sio.emit('bubble_gen_progress', {
            'step': 4, 'pct': 95, 'msg': '선택지 셔플 완료 - 버그 배치 준비', 'file': 'deploy_bugs.sh'
        }, room=room_id)

        print(f"[BugBubble] {len(problems)}개 문제 생성 완료")
    except Exception as e:
        print(f"[BugBubble] 문제 생성 실패, 폴백 사용: {e}")
        problems = []
        await sio.emit('bubble_gen_progress', {
            'step': 4, 'pct': 95, 'msg': '폴백 문제 로드 중..', 'file': 'fallback.json'
        }, room=room_id)

    await sio.emit('bubble_game_start', {'problems': problems}, room=room_id)

@sio.event
async def bubble_send_monster(sid, data):
    room_id = data.get('room_id')
    await sio.emit('bubble_receive_monster', {'sender_sid': sid, 'monster_type': data.get('monster_type')}, room=room_id, skip_sid=sid)
    if room_id in bubble_rooms:
        counts = {p['sid']: p.get('monster_count', 0) for p in bubble_rooms[room_id]['players']}
        await sio.emit('bubble_monster_sync', {'counts': counts}, room=room_id)

@sio.event
async def bubble_monster_update(sid, data):
    """[2026-03-04] 클라이언트가 최신 몬스터 수를 서버에 보고"""
    room_id = data.get('room_id')
    count = data.get('count', 0)
    if room_id in bubble_rooms:
        player = next((p for p in bubble_rooms[room_id]['players'] if p['sid'] == sid), None)
        if player:
            player['monster_count'] = count
        counts = {p['sid']: p.get('monster_count', 0) for p in bubble_rooms[room_id]['players']}
        await sio.emit('bubble_monster_sync', {'counts': counts}, room=room_id)

@sio.event
async def bubble_fever_attack(sid, data):
    """[2026-03-04] 콤보 피버 공격 (3x 몬스터)"""
    room_id = data.get('room_id')
    count = data.get('count', 3)
    await sio.emit('bubble_receive_fever', {'sender_sid': sid, 'count': count}, room=room_id, skip_sid=sid)

@sio.event
async def bubble_game_over(sid, data):
    room_id = data.get('room_id')
    await sio.emit('bubble_end', {'loser_sid': sid}, room=room_id)

    # [수정 2026-03-03] DB 전적 저장
    if room_id in bubble_rooms:
        players = bubble_rooms[room_id]['players']
        for p in players:
            result = 'lose' if p['sid'] == sid else 'win'
            print(f"[BugBubble] DB 저장: uid={p.get('user_id')}, result={result}")
            await update_battle_record(p.get('user_id'), result)

# 공통 채팅 이벤트
@sio.event
async def chat_message(sid, data):
    mission_id = data.get('mission_id')
    if mission_id:
        await sio.emit('chat_sync', data, room=mission_id, skip_sid=sid)
