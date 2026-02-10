// Monaco Editor용 헬퍼 파일 (성능 최적화 & 무한루프 방지 버전)
import { ref, watch, onBeforeUnmount } from 'vue';

export function useMonacoEditor(currentMission, editorState) {
    // [최적화] Monaco 인스턴스는 Vue 반응형 시스템(ref)에 넣지 않는 것이 좋음 (성능 저하 및 루프 원인)
    let monacoEditorRaw = null;
    const decorationsCollection = ref(null);
    let debounceTimer = null;
    let resizeObserver = null;

    const monacoOptions = {
        automaticLayout: false, // [중요] 자동 레이아웃 비활성화 (무한 루프 방지)
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        renderLineHighlight: 'all',
        scrollbar: {
            vertical: 'visible',
            horizontal: 'visible'
        },
        dragAndDrop: false,
        dropIntoEditor: { enabled: false }
    };

    // 네모 박스 (TODO 하이라이트) 업데이트 함수 (디바운스 적용)
    const updateDecorations = () => {
        if (!monacoEditorRaw) return;

        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            const model = monacoEditorRaw.getModel();
            if (!model) return;

            const matches = model.findMatches('#\\s*TODO', false, true, false, null, true);

            const newDecorations = (matches || []).map(match => ({
                range: match.range,
                options: {
                    isWholeLine: true,
                    className: 'todo-highlight',
                    glyphMarginClassName: 'todo-glyph'
                }
            }));

            if (decorationsCollection.value) {
                decorationsCollection.value.clear();
            }
            decorationsCollection.value = monacoEditorRaw.createDecorationsCollection(newDecorations);
        }, 300);
    };

    // 코드 삽입 함수
    const insertCodeSnippet = (code) => {
        const currentCode = editorState.userCode;
        if (!currentCode) {
            editorState.userCode = code;
            return;
        }

        const todoLineRegex = /^(\s*)#\s*todo.*$/mi;
        const match = currentCode.match(todoLineRegex);

        if (match) {
            const fullMatch = match[0];
            const indent = match[1] || "";
            const indentedCode = code.split('\n').map(line => indent + line).join('\n');
            editorState.userCode = currentCode.replace(fullMatch, indentedCode);
        } else {
            editorState.userCode = currentCode + "\n" + code;
        }
    };

    // 에디터 마운트 시 설정
    const handleMonacoMount = (editor) => {
        monacoEditorRaw = editor;

        // [추가] 수동 레이아웃 설정을 위한 ResizeObserver 등록
        const container = editor.getDomNode()?.parentElement;
        if (container) {
            resizeObserver = new ResizeObserver(() => {
                editor.layout();
            });
            resizeObserver.observe(container);
        }

        // [중요] Native Drop 이벤트 리스너 등록 (옵션 비활성화 상태에서도 동작하도록)
        const domNode = editor.getDomNode();
        if (domNode) {
            domNode.addEventListener('dragover', (e) => {
                e.preventDefault(); // Drop 허용
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
            }, true);

            domNode.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const code = e.dataTransfer.getData('text/plain');
                if (code) {
                    insertCodeSnippet(code);
                }
            }, true);
        }

        if ((!editorState.userCode || editorState.userCode.length < 5) && currentMission.value?.implementation?.codeFrame?.template) {
            editorState.userCode = currentMission.value.implementation.codeFrame.template;
        }

        editor.onDidChangeModelContent(() => {
            // [CRITICAL FIX] Manual two-way binding: Editor -> State
            // v-model might be failing, so we force update state from editor content.
            editorState.userCode = editor.getValue();
            updateDecorations();
        });

        updateDecorations();
    };

    // 언마운트 시 옵저버 해제
    onBeforeUnmount(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    });

    // 스테이지 변경 시 템플릿 리로드
    watch(() => currentMission.value?.id, (newId) => {
        if (newId && currentMission.value?.implementation?.codeFrame?.template) {
            editorState.userCode = currentMission.value.implementation.codeFrame.template;
            setTimeout(updateDecorations, 500);
        }
    });

    // [CRITICAL FIX] 상태 변화를 에디터에 강제 동기화 (v-model이 반응하지 않을 때를 대비)
    watch(() => editorState.userCode, (newCode) => {
        if (monacoEditorRaw && newCode !== monacoEditorRaw.getValue()) {
            monacoEditorRaw.setValue(newCode);
            // 커서를 맨 앞으로 이동시키거나 상태 유지 (선택사항)
        }
    });

    return {
        monacoOptions,
        handleMonacoMount,
        insertCodeSnippet
    };
}

