import socketio
import asyncio
import random
from core.services.pseudocode_evaluator import PseudocodeEvaluator, EvaluationRequest, EvaluationMode

# [Multi-Agent] 임포트
from core.services.wars.orchestrator import WarsOrchestrator
from core.services.wars.state_machine import DrawRoomState, GameState
from core.utils.architecture_missions import MISSIONS # [추가 2026-02-27] 미션 데이터셋

# 전역 객체 및 상태 관리
wars_orchestrator = WarsOrchestrator()
draw_room_states: dict[str, DrawRoomState] = {}
pseudocode_evaluator = PseudocodeEvaluator()
active_rooms = set()
room_leaders = {}  
room_snapshots = {}
room_game_states = {}
active_timer_tasks = {} 

# 게임별 방 데이터 저장소
draw_rooms = {}  
run_rooms = {}  
bubble_rooms = {}
run_phase2_submissions = {}

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print(f"✅ Socket Connected: {sid}")

@sio.event
async def disconnect(sid):
    """소켓 연결 해제 시 모든 세션 및 방 데이터 정리 (통합 버전)"""
    print(f"❌ Socket Disconnected: {sid}")
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
    draw_room_id = session.get('draw_room')  # 세션 저장 시 이미 strip된 값
    if draw_room_id in draw_rooms:
        room = draw_rooms[draw_room_id]
        room['players'] = [p for p in room['players'] if p['sid'] != sid]
        if not room['players']:
            del draw_rooms[draw_room_id]
            # [수정: draw_room_states 도 함께 정리 — 메모리 누수 방지]
            if draw_room_id in draw_room_states:
                del draw_room_states[draw_room_id]
            print(f"🗑️ [ArchDraw] Room {draw_room_id} fully cleaned up (empty)")
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

# ---------- WAR ROOM EVENTS ----------
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

# ---------- DRAW GAME EVENTS ----------
@sio.event
async def draw_join(sid, data):
    room_id = data.get('room_id', 'draw-default').strip()
    user_name = data.get('user_name', 'Player')
    await sio.enter_room(sid, room_id)
    await sio.save_session(sid, {'draw_room': room_id, 'draw_name': user_name})
    if room_id not in draw_rooms: draw_rooms[room_id] = {'players': [], 'phase': 'waiting'}
    room = draw_rooms[room_id]
    if not any(p['sid'] == sid for p in room['players']) and len(room['players']) < 2:
        room['players'].append({'sid': sid, 'name': user_name, 'score': 0})
    await sio.emit('draw_lobby', {'players': [{'name': p['name'], 'sid': p['sid']} for p in room['players']]}, room=room_id)
    if len(room['players']) >= 2:
        room['phase'] = 'ready'
        await sio.emit('draw_ready', {}, room=room_id)
        # [수정일: 2026-02-27] DrawRoomState 초기화 (Orchestrator 연동용)
        stripped_id = room_id.strip()
        if stripped_id not in draw_room_states:
            draw_room_states[stripped_id] = DrawRoomState(room_id=stripped_id)
        print(f"🏠 [ArchDraw] Room State Initialized: {stripped_id}")

@sio.event
async def draw_start(sid, data):
    """[수정일: 2026-02-27] 캐치마인드 게임 시작 처리"""
    room_id = data.get('room_id', '').strip()
    if room_id in draw_rooms:
        print(f"🚀 [ArchDraw] Game Start in Room: {room_id}")
        draw_rooms[room_id]['phase'] = 'playing'
        
        # [수정일: 2026-03-01] 미션 데이터셋에서 무작위 선택 + 팔레트 서버 생성
        question = random.choice(MISSIONS).copy()
        question['round'] = 1
        # 팔레트: required 컴포넌트 + 랜덤 extra 4개 (서버에서 결정 → 양측 동일 보장)
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
            print(f"✅ [ArchDraw] Orchestrator Round Started: {room_id} | Mission: {question['title']}")
        else:
            print(f"⚠️ [ArchDraw] room_state NOT FOUND for room: {room_id}")
        
        await sio.emit('draw_game_start', {}, room=room_id)
        await sio.emit('draw_round_start', {'question': question}, room=room_id)

@sio.event
async def draw_submit(sid, data):
    """[수정일: 2026-03-01] 점수 서버 검증 추가 — 클라이언트 점수를 신뢰하지 않음"""
    room_id = data.get('room_id', '').strip()
    if room_id not in draw_rooms: 
        print(f"⚠️ [ArchDraw] draw_submit: Room {room_id} not found in draw_rooms")
        return
    
    room = draw_rooms[room_id]
    player = next((p for p in room['players'] if p['sid'] == sid), None)
    if player:
        # [수정: 클라이언트 점수 검증] 체크리스트 기반으로 서버가 직접 점수 계산
        checks = data.get('checks', [])
        hit = sum(1 for c in checks if c.get('ok'))
        total = len(checks) if checks else 1
        ratio = hit / total
        # 점수 공식: 체크 40점 + 달성보너스 100점 + (남은시간 × 2) + (콤보 × 20)
        # 단, 클라이언트가 보낸 timeLeft·combo 는 참고값 — 최대치 클램핑으로 어뷰징 방지
        time_bonus = min(data.get('time_left', 0), 90) * 2  # 최대 180점 (90초 기준)
        combo_bonus = min(data.get('combo', 0), 10) * 20    # 최대 200점 (콤보 10x 상한)
        pts = hit * 40 + (100 if ratio >= 0.8 else 0) + time_bonus + combo_bonus
        
        player['score'] += pts
        player['last_pts'] = pts
        player['last_checks'] = checks
        player['last_nodes'] = data.get('final_nodes', [])
        player['last_arrows'] = data.get('final_arrows', [])
        player['submitted'] = True
        print(f"📥 [ArchDraw] Player {player['name']} submitted | server_pts={pts} (hit={hit}/{total}) in room {room_id}")

    await sio.emit('draw_player_submitted', {'sid': sid}, room=room_id)

    # 양측 모두 제출 완료 체크
    if all(p.get('submitted') for p in room['players']) and len(room['players']) == 2:
        p1, p2 = room['players']
        print(f"📊 [ArchDraw] Both submitted in room {room_id}. Triggering AI Evaluation.")
        
        # EvalAgent를 통한 AI 평가 실행
        ai_reviews = {}
        room_state = draw_room_states.get(room_id)
        if room_state:
            try:
                # rubric 데이터는 일단 빈 값으로 (나중에 DB 등에서 확장 가능)
                rubric = {"required_components": room_state.mission_required}
                ai_reviews = await wars_orchestrator.on_both_submitted(
                    room_state, room_state.mission_title, rubric,
                    {"name": p1['name'], "pts": p1['last_pts'], "checks": p1['last_checks'], "nodes": p1['last_nodes'], "arrows": p1['last_arrows']},
                    {"name": p2['name'], "pts": p2['last_pts'], "checks": p2['last_checks'], "nodes": p2['last_nodes'], "arrows": p2['last_arrows']}
                )
            except Exception as e:
                print(f"❌ [ArchDraw] AI Evaluation Error: {e}")

        # AI 결과가 없거나 실패한 경우 폴백 메시지 생성 (UI 멈춤 방지)
        if not ai_reviews:
            ai_reviews = {
                "player1": {"my_analysis": "설계의 핵심 뼈대는 갖추었으나 특정 구간의 가용성 설계가 누락되었습니다.", "versus": "전체적인 무결성 면에서 박빙의 결과를 보여주고 있습니다."},
                "player2": {"my_analysis": "설계의 핵심 뼈대는 갖추었으나 특정 구간의 가용성 설계가 누락되었습니다.", "versus": "전체적인 무결성 면에서 박빙의 결과를 보여주고 있습니다."}
            }
            print(f"⚠️ [ArchDraw] Using fallback evaluation for room {room_id}")

        # 결과 전송 - 프론트엔드 .find() 호환 및 데이터 무결성을 위해 리스트 형식으로 변경
        results = [
            {
                "sid": p1['sid'], 
                "score": p1['score'], 
                "last_pts": p1.get('last_pts', 0), 
                "last_checks": p1.get('last_checks', []), 
                "last_nodes": p1.get('last_nodes', []),
                "last_arrows": p1.get('last_arrows', []),
                "ai_review": ai_reviews.get('player1')
            },
            {
                "sid": p2['sid'], 
                "score": p2['score'], 
                "last_pts": p2.get('last_pts', 0), 
                "last_checks": p2.get('last_checks', []), 
                "last_nodes": p2.get('last_nodes', []),
                "last_arrows": p2.get('last_arrows', []),
                "ai_review": ai_reviews.get('player2')
            }
        ]
        await sio.emit('draw_round_result', {'results': results}, room=room_id)
        print(f"✅ [ArchDraw] Evaluation Results Sent to room: {room_id}")

@sio.event
async def draw_next_round(sid, data):
    """[수정일: 2026-03-01] 다음 라운드 전환 + chaos/coach 상태 초기화"""
    room_id = data.get('room_id', '').strip()
    if room_id in draw_rooms:
        room = draw_rooms[room_id]
        print(f"⏭️ [ArchDraw] Next Round in Room: {room_id}")
        # 제출 상태 초기화
        for p in room['players']: p['submitted'] = False
        
        # [수정: chaos/coach 이력 초기화 — 라운드가 바뀌면 새로 발동 가능해야 함]
        room_state = draw_room_states.get(room_id)
        if room_state:
            room_state.chaos_triggered_at = 0.0
            room_state.coach_triggered_at = 0.0
            room_state.hint_history = {}
            room_state.past_event_ids = []
            room_state.player_designs = {}
        
        # 새로운 무작위 문제 선택 + 팔레트 서버 생성
        question = random.choice(MISSIONS).copy()
        question['round'] = data.get('round', 2)
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
    """[수정일: 2026-02-27] 소지 아이템 상태 동기화"""
    room_id = data.get('room_id')
    await sio.emit('draw_opponent_item_status', {'sid': sid, 'has_item': data.get('has_item')}, room=room_id, skip_sid=sid)

@sio.event
async def draw_use_item(sid, data):
    """[수정일: 2026-02-27] 아이템 사용 효과 전파"""
    room_id = data.get('room_id')
    await sio.emit('draw_item_effect', {'sid': sid, 'item_type': data.get('item_type')}, room=room_id, skip_sid=sid)

@sio.event
async def draw_canvas_sync(sid, data):
    room_id = data.get('room_id', 'draw-default').strip()
    await sio.emit('draw_canvas_update', {'sender_sid': sid, 'nodes': data.get('nodes'), 'arrows': data.get('arrows')}, room=room_id, skip_sid=sid)
    room_state = draw_room_states.get(room_id)
    if room_state:
        # on_canvas_update는 내부적으로 asyncio.to_thread를 사용하므로
        # 직접 await — 이벤트 루프 블로킹 없음
        res = await wars_orchestrator.on_canvas_update(room_state, sid, data.get('nodes'), data.get('arrows'))
        if res.get('coach_hint'):
            # [수정일: 2026-03-02] _target_sid를 payload에서 제거 후 전송 (프론트 노출 방지)
            hint_payload = {k: v for k, v in res['coach_hint'].items() if k != '_target_sid'}
            target_sid = res['coach_hint'].get('_target_sid', sid)
            print(f"💡 [ArchDraw] Hint Sent to {target_sid[:8]}: {hint_payload.get('message', '')[:20]}...")
            await sio.emit('coach_hint', hint_payload, to=target_sid)  # [수정일: 2026-03-03] room= → to= (개인 전송)
        if res.get('chaos_event'): 
            print(f"🔥 [ArchDraw] Chaos Event in Room: {room_id}")
            await sio.emit('chaos_event', res['chaos_event'], room=room_id)
# ---------- LOGIC RUN EVENTS ----------
@sio.event
async def run_join(sid, data):
    room_id = data.get('room_id', 'run-default').strip()
    user_name = data.get('user_name', 'Anonymous')
    
    if room_id not in run_rooms: 
        run_rooms[room_id] = {'players': [], 'phase': 'lobby', 'leader_sid': None}
    
    room = run_rooms[room_id]
    
    # [수정일: 2026-02-27] 2인 제한 로직 추가
    is_already_in = any(p['sid'] == sid for p in room['players'])
    if not is_already_in and len(room['players']) >= 2:
        print(f"⚠️ [LogicRun] Room {room_id} is full (2/2). Rejecting {user_name}")
        await sio.emit('run_error', {'message': '방이 가득 찼습니다. (최대 2인)'}, to=sid)
        return

    await sio.enter_room(sid, room_id)
    await sio.save_session(sid, {'run_room': room_id, 'run_name': user_name})
    
    if not room['leader_sid']: room['leader_sid'] = sid
    if not is_already_in:
        room['players'].append({
            'sid': sid, 
            'name': user_name, 
            'avatar_url': data.get('avatar_url'), 
            'phase1_score': 0, 
            'phase2_score': 0
        })
    
    await sio.emit('run_lobby', {'players': room['players'], 'leader_sid': room['leader_sid']}, room=room_id)

@sio.event
async def run_progress(sid, data):
    room_id = data.get('room_id')
    if data.get('phase') == 'speedFill' and room_id in run_rooms:
        for p in run_rooms[room_id]['players']:
            if p['sid'] == sid: p['phase1_score'] = data.get('score', 0)
    await sio.emit('run_sync', data, room=room_id, skip_sid=sid)

# [수정일: 2026-02-27] 추가: LogicRun 프론트엔드에서 'START GAME' 클릭 시 전송하는 run_start 이벤트 핸들러 추가 (게임 시작 불가 해결)
@sio.event
async def run_start(sid, data):
    room_id = data.get('room_id')
    if room_id in run_rooms:
        run_rooms[room_id]['phase'] = 'playing'
        quest_idx = random.randint(0, 100)
        await sio.emit('run_game_start', {'quest_idx': quest_idx}, room=room_id)

# [수정일: 2026-02-27] 추가: LogicRun 게임 종료 시 점수 및 결과 동기화를 위한 이벤트 핸들러 추가
@sio.event
async def run_logic_finish(sid, data):
    room_id = data.get('room_id')
    if room_id in run_rooms:
        await sio.emit('run_end', data, room=room_id, skip_sid=sid)

# ---------- BUG-BUBBLE MONSTER (핵심 수정 포함) ----------
@sio.event
async def bubble_join(sid, data):
    room_id = data.get('room_id', 'bubble-default').strip()
    user_name = data.get('user_name', 'Unknown')
    await sio.enter_room(sid, room_id)
    await sio.save_session(sid, {'bubble_room': room_id, 'name': user_name})
    if room_id not in bubble_rooms: bubble_rooms[room_id] = {'players': [], 'is_playing': False}
    room = bubble_rooms[room_id]
    if not any(p['sid'] == sid for p in room['players']):
        room['players'].append({'sid': sid, 'name': user_name, 'avatar': data.get('user_avatar')})
    await sio.emit('bubble_lobby', {'players': room['players']}, room=room_id)

@sio.event
async def bubble_sync(sid, data):
    """실시간 위치 및 액션 동기화 (전송 로그가 뜨는데 동기화 안되는 문제 해결)"""
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
    if room_id in bubble_rooms:
        bubble_rooms[room_id]['is_playing'] = True
        await sio.emit('bubble_game_start', {}, room=room_id)

@sio.event
async def bubble_send_monster(sid, data):
    await sio.emit('bubble_receive_monster', {'sender_sid': sid, 'monster_type': data.get('monster_type')}, room=data.get('room_id'), skip_sid=sid)

@sio.event
async def bubble_game_over(sid, data):
    await sio.emit('bubble_end', {'loser_sid': sid}, room=data.get('room_id'))

# 공통 채팅 및 기타 이벤트 유지 (chat_message, update_role 등 기존 코드와 동일)
@sio.event
async def chat_message(sid, data):
    mission_id = data.get('mission_id')
    if mission_id:
        await sio.emit('chat_sync', data, room=mission_id, skip_sid=sid)
