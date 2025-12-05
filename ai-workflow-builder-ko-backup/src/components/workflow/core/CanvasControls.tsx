'use client';

/**
 * Canvas 컨트롤 컴포넌트 (n8n 스타일)
 * 
 * 기능:
 * - 줌 인/아웃
 * - 핏 뷰
 * - 그리드 토글
 * - 미니맵 토글
 * - 정렬(Tidy Up)
 * - 키보드 단축키 표시
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { useReactFlow, Panel } from 'reactflow';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3, 
  Map, 
  AlignLeft,
  Keyboard,
  X,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// 타입 정의
// ============================================

interface CanvasControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showMinimap?: boolean;
  onToggleMinimap?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onTidyUp?: () => void;
}

// ============================================
// 키보드 단축키 정의
// ============================================

export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'C'], action: '선택 노드 복사' },
  { keys: ['Ctrl', 'V'], action: '붙여넣기' },
  { keys: ['Ctrl', 'X'], action: '잘라내기' },
  { keys: ['Ctrl', 'D'], action: '복제' },
  { keys: ['Ctrl', 'Z'], action: '실행 취소' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: '다시 실행' },
  { keys: ['Delete'], action: '선택 삭제' },
  { keys: ['Ctrl', 'A'], action: '전체 선택' },
  { keys: ['Ctrl', 'S'], action: '워크플로우 저장' },
  { keys: ['Ctrl', 'Enter'], action: '워크플로우 실행' },
  { keys: ['+'], action: '줌 인' },
  { keys: ['-'], action: '줌 아웃' },
  { keys: ['0'], action: '줌 리셋' },
  { keys: ['1'], action: '화면에 맞추기' },
  { keys: ['Space'], action: '캔버스 드래그 모드' },
  { keys: ['Tab'], action: '노드 추가 패널' },
  { keys: ['Escape'], action: '선택 해제 / 패널 닫기' },
];

// ============================================
// 메인 컴포넌트
// ============================================

function CanvasControls({
  position = 'bottom-left',
  showMinimap = false,
  onToggleMinimap,
  showGrid = true,
  onToggleGrid,
  onTidyUp,
}: CanvasControlsProps) {
  const { zoomIn, zoomOut, fitView, setViewport, getViewport } = useReactFlow();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);

  // 줌 레벨 업데이트
  useEffect(() => {
    const updateZoom = () => {
      const viewport = getViewport();
      setCurrentZoom(viewport.zoom);
    };

    // 초기 줌 레벨
    updateZoom();

    // 줌 변경 감지를 위한 인터벌 (더 나은 방법: onMove 이벤트 사용)
    const interval = setInterval(updateZoom, 500);
    return () => clearInterval(interval);
  }, [getViewport]);

  // 줌 핸들러
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  const handleResetZoom = useCallback(() => {
    const viewport = getViewport();
    setViewport({ x: viewport.x, y: viewport.y, zoom: 1 }, { duration: 200 });
  }, [getViewport, setViewport]);

  // 키보드 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // 줌 단축키
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === '1') {
        e.preventDefault();
        handleFitView();
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom, handleFitView]);

  // 포지션 클래스
  const positionClass = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }[position];

  return (
    <>
      {/* 컨트롤 패널 */}
      <Panel position={position as any} className="flex flex-col gap-2">
        {/* 줌 컨트롤 */}
        <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <ControlButton
            icon={<Plus size={16} />}
            onClick={handleZoomIn}
            tooltip="줌 인 (+)"
          />
          
          <div className="px-2 py-1 text-xs text-center text-gray-600 border-y border-gray-100 font-mono">
            {Math.round(currentZoom * 100)}%
          </div>
          
          <ControlButton
            icon={<Minus size={16} />}
            onClick={handleZoomOut}
            tooltip="줌 아웃 (-)"
          />
        </div>

        {/* 뷰 컨트롤 */}
        <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <ControlButton
            icon={<Maximize2 size={16} />}
            onClick={handleFitView}
            tooltip="화면에 맞추기 (1)"
          />
          
          <ControlButton
            icon={<RotateCcw size={16} />}
            onClick={handleResetZoom}
            tooltip="줌 리셋 (0)"
          />
        </div>

        {/* 토글 컨트롤 */}
        <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {onToggleGrid && (
            <ControlButton
              icon={<Grid3X3 size={16} />}
              onClick={onToggleGrid}
              tooltip="그리드 토글"
              active={showGrid}
            />
          )}
          
          {onToggleMinimap && (
            <ControlButton
              icon={<Map size={16} />}
              onClick={onToggleMinimap}
              tooltip="미니맵 토글"
              active={showMinimap}
            />
          )}
          
          {onTidyUp && (
            <ControlButton
              icon={<AlignLeft size={16} />}
              onClick={onTidyUp}
              tooltip="노드 정렬"
            />
          )}
        </div>

        {/* 단축키 도움말 버튼 */}
        <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <ControlButton
            icon={<Keyboard size={16} />}
            onClick={() => setShowShortcuts(true)}
            tooltip="키보드 단축키 (?)"
          />
        </div>
      </Panel>

      {/* 키보드 단축키 모달 */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">키보드 단축키</h2>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 단축키 목록 */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-2">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-600">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 푸터 */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <kbd className="px-1 bg-gray-200 rounded text-[10px]">?</kbd> 를 눌러 이 창을 토글할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// 컨트롤 버튼 컴포넌트
// ============================================

interface ControlButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
}

function ControlButton({ icon, onClick, tooltip, active, disabled }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'p-2 transition-colors relative group',
        'hover:bg-gray-100',
        active && 'bg-blue-50 text-blue-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
      
      {/* 툴팁 */}
      {tooltip && (
        <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded
                        opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltip}
        </div>
      )}
    </button>
  );
}

// ============================================
// 미니맵 컴포넌트
// ============================================

export function CanvasMinimap({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;

  return (
    <Panel position="bottom-right" className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="w-48 h-32 bg-gray-50">
        {/* 실제 미니맵은 ReactFlow의 MiniMap 컴포넌트 사용 */}
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
          미니맵
        </div>
      </div>
    </Panel>
  );
}

// ============================================
// useKeyboardShortcuts 훅
// ============================================

export function useKeyboardShortcuts(handlers: {
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onRun?: () => void;
  onEscape?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd 조합
      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            handlers.onCopy?.();
            break;
          case 'v':
            e.preventDefault();
            handlers.onPaste?.();
            break;
          case 'x':
            e.preventDefault();
            handlers.onCut?.();
            break;
          case 'd':
            e.preventDefault();
            handlers.onDuplicate?.();
            break;
          case 'a':
            e.preventDefault();
            handlers.onSelectAll?.();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handlers.onRedo?.();
            } else {
              handlers.onUndo?.();
            }
            break;
          case 's':
            e.preventDefault();
            handlers.onSave?.();
            break;
          case 'enter':
            e.preventDefault();
            handlers.onRun?.();
            break;
        }
      }

      // 단일 키
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (!isCtrlOrCmd) {
            e.preventDefault();
            handlers.onDelete?.();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handlers.onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

export default memo(CanvasControls);
export { CanvasControls };
