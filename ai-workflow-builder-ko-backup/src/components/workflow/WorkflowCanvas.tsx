'use client';

/**
 * 워크플로우 캔버스 컴포넌트 (리팩토링 완료)
 * 
 * n8n/Activepieces 패턴 적용:
 * - 통합 노드 렌더링 (UnifiedNode) - 32개 노드를 1개로 통합
 * - 키보드 단축키 통합
 * - 통합 컨트롤 패널
 * - 그리드/미니맵 토글
 * 
 * @refactored 2024-12 - 레거시 노드 제거, UnifiedNode로 완전 전환
 */

import { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  Node as ReactFlowNode,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { CanvasControls, useKeyboardShortcuts, UnifiedNode, NODE_CATEGORIES } from './core';
import type { NodeCategory } from './core/UnifiedNode';
import CustomEdge from './CustomEdge';

// ============================================
// 노드 타입 정의 (UnifiedNode 기반 통합)
// ============================================

// 지원하는 모든 노드 타입 목록
const ALL_NODE_TYPES = [
  'input', 'llm', 'transform', 'output', 'condition', 'loop',
  'api', 'delay', 'webhook', 'random', 'slice', 'datetime',
  'filesave', 'taskbreakdown', 'state', 'airouter', 'approval',
  'note', 'code', 'parallel', 'template', 'htmlclean', 'math',
  'formula', 'multifilter', 'stockalert', 'multiagent',
  'compareinput', 'tableoutput', 'chart', 'intentparser', 'smartanalysis'
] as const;

// UnifiedNode를 사용하는 통합 노드 타입 맵
const nodeTypes = ALL_NODE_TYPES.reduce((acc, type) => {
  acc[type] = UnifiedNode;
  return acc;
}, {} as Record<string, typeof UnifiedNode>);

// 엣지 타입 정의
const edgeTypes = {
  default: CustomEdge,
};

// ============================================
// 미니맵 색상 (카테고리 기반)
// ============================================

const CATEGORY_COLORS: Record<NodeCategory, string> = {
  ai: '#8b5cf6',       // 보라 (AI)
  external: '#64748b', // 슬레이트 (외부연동)
  control: '#f97316',  // 오렌지 (제어)
  data: '#06b6d4',     // 시안 (데이터)
  finance: '#10b981',  // 에메랄드 (금융)
  io: '#3b82f6',       // 파랑 (입출력)
  other: '#6b7280',    // 회색 (기타)
};

const getMinimapColor = (nodeType: string): string => {
  const category = NODE_CATEGORIES[nodeType as keyof typeof NODE_CATEGORIES] || 'other';
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
};

// ============================================
// 메인 캔버스 컴포넌트
// ============================================

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  
  // UI 상태
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // 스토어
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    selectedNodeId,
    deleteNode,
  } = useWorkflowStore();

  // 노드/엣지 타입 메모이제이션
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  // 초기화
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  // 드래그 앤 드롭
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');

      if (!data || !reactFlowBounds || !reactFlowInstance.current) {
        return;
      }

      const { type, data: nodeData } = JSON.parse(data);

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 노드 타입 정규화 (Node 접미사 제거)
      const nodeType = type.replace('Node', '').toLowerCase();

      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          ...nodeData,
          type: nodeType,
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  // 클릭 핸들러
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // 노드 정렬 (Tidy Up) - 토폴로지 기반 레이아웃
  const handleTidyUp = useCallback(() => {
    if (!reactFlowInstance.current || nodes.length === 0) return;

    // 엣지 맵 생성
    const outgoingEdges = new Map<string, string[]>();
    const incomingCount = new Map<string, number>();
    
    nodes.forEach(n => {
      outgoingEdges.set(n.id, []);
      incomingCount.set(n.id, 0);
    });
    
    edges.forEach(edge => {
      outgoingEdges.get(edge.source)?.push(edge.target);
      incomingCount.set(edge.target, (incomingCount.get(edge.target) || 0) + 1);
    });

    // 위상 정렬로 레벨 결정
    const levels: string[][] = [];
    const visited = new Set<string>();
    
    // 시작 노드 (incoming이 0인 노드)
    let currentLevel = nodes
      .filter(n => (incomingCount.get(n.id) || 0) === 0)
      .map(n => n.id);
    
    while (currentLevel.length > 0) {
      levels.push(currentLevel);
      currentLevel.forEach(id => visited.add(id));
      
      const nextLevel: string[] = [];
      currentLevel.forEach(nodeId => {
        const targets = outgoingEdges.get(nodeId) || [];
        targets.forEach(targetId => {
          if (!visited.has(targetId) && !nextLevel.includes(targetId)) {
            // 모든 부모가 처리되었는지 확인
            const incoming = edges.filter(e => e.target === targetId);
            const allParentsVisited = incoming.every(e => visited.has(e.source));
            if (allParentsVisited) {
              nextLevel.push(targetId);
            }
          }
        });
      });
      currentLevel = nextLevel;
    }

    // 방문하지 않은 노드 추가 (순환 또는 고립된 노드)
    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        if (levels.length === 0) levels.push([]);
        levels[levels.length - 1].push(n.id);
      }
    });

    // 위치 계산
    const HORIZONTAL_GAP = 280;
    const VERTICAL_GAP = 120;
    const START_X = 80;
    const START_Y = 80;

    const newNodes = nodes.map(node => {
      const levelIndex = levels.findIndex(level => level.includes(node.id));
      const indexInLevel = levels[levelIndex]?.indexOf(node.id) ?? 0;
      const levelHeight = (levels[levelIndex]?.length || 1) * VERTICAL_GAP;
      const centerOffset = (levelHeight - VERTICAL_GAP) / 2;
      
      return {
        ...node,
        position: {
          x: START_X + levelIndex * HORIZONTAL_GAP,
          y: START_Y + indexInLevel * VERTICAL_GAP - centerOffset + (levels[levelIndex]?.length > 1 ? centerOffset : 0),
        },
      };
    });

    // 노드 위치 업데이트
    onNodesChange(
      newNodes.map(node => ({
        type: 'position' as const,
        id: node.id,
        position: node.position,
      }))
    );

    // 뷰 맞추기
    setTimeout(() => {
      reactFlowInstance.current?.fitView({ padding: 0.15, duration: 300 });
    }, 50);
  }, [nodes, edges, onNodesChange]);

  // 키보드 단축키
  useKeyboardShortcuts({
    onCopy: () => {
      if (selectedNodeId) {
        const selectedNode = nodes.find(n => n.id === selectedNodeId);
        if (selectedNode) {
          localStorage.setItem('copiedNode', JSON.stringify(selectedNode));
        }
      }
    },
    onPaste: () => {
      const copiedData = localStorage.getItem('copiedNode');
      if (copiedData && reactFlowInstance.current) {
        try {
          const node = JSON.parse(copiedData);
          const newNode = {
            ...node,
            id: `${node.type}-${Date.now()}`,
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            data: { ...node.data },
          };
          addNode(newNode);
        } catch (e) {
          console.error('Paste failed:', e);
        }
      }
    },
    onDelete: () => {
      if (selectedNodeId) {
        deleteNode(selectedNodeId);
      }
    },
    onSelectAll: () => {
      // ReactFlow 기본 지원
    },
    onDuplicate: () => {
      if (selectedNodeId) {
        const selectedNode = nodes.find(n => n.id === selectedNodeId);
        if (selectedNode) {
          const newNode = {
            ...selectedNode,
            id: `${selectedNode.type}-${Date.now()}`,
            position: {
              x: selectedNode.position.x + 50,
              y: selectedNode.position.y + 50,
            },
            data: { ...selectedNode.data, label: `${selectedNode.data.label} (복사)` },
          };
          addNode(newNode);
        }
      }
    },
    onSave: () => {
      // TODO: 워크플로우 저장
      console.log('💾 워크플로우 저장');
    },
    onRun: () => {
      // TODO: 워크플로우 실행
      console.log('▶️ 워크플로우 실행');
    },
    onEscape: () => {
      setSelectedNode(null);
    },
  });

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        fitView
        snapToGrid={showGrid}
        snapGrid={[15, 15]}
        edgesUpdatable={true}
        edgesFocusable={true}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Shift']}
        selectionKeyCode={['Shift']}
        panOnDrag={[1, 2]}
        selectionOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnDoubleClick={true}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          interactionWidth: 20,
        }}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        className="bg-gradient-to-br from-gray-50 to-slate-100"
      >
        {/* 배경 그리드 */}
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            color="#cbd5e1"
            gap={20}
            size={1}
          />
        )}

        {/* 커스텀 컨트롤 (n8n 스타일) */}
        <CanvasControls
          position="bottom-left"
          showMinimap={showMinimap}
          onToggleMinimap={() => setShowMinimap(!showMinimap)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onTidyUp={handleTidyUp}
        />

        {/* 미니맵 */}
        {showMinimap && (
          <MiniMap
            className="!bg-white/90 !backdrop-blur-sm !border-gray-200 !rounded-xl !shadow-xl"
            nodeColor={(node) => getMinimapColor(node.type || '')}
            maskColor="rgba(0, 0, 0, 0.08)"
            pannable
            zoomable
            style={{
              bottom: 24,
              right: 24,
              width: 180,
              height: 120,
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}

// ============================================
// Provider 래퍼
// ============================================

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
