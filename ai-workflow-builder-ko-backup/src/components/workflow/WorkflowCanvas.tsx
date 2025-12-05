'use client';

/**
 * 워크플로우 캔버스 컴포넌트
 * 
 * n8n/Activepieces 패턴 적용:
 * - 통합 노드 렌더링 (UnifiedNode)
 * - 키보드 단축키 통합
 * - 통합 컨트롤 패널
 * - 그리드/미니맵 토글
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { useCallback, useRef, useState } from 'react';
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
import { CanvasControls, useKeyboardShortcuts, UnifiedNode, CATEGORY_STYLES, NODE_CATEGORIES } from './core';
import type { NodeCategory } from './core/UnifiedNode';

// 기존 노드 컴포넌트들 (레거시 지원용)
import InputNode from './InputNode';
import LLMNode from './LLMNode';
import TransformNode from './TransformNode';
import OutputNode from './OutputNode';
import ConditionNode from './ConditionNode';
import LoopNode from './LoopNode';
import ApiNode from './ApiNode';
import DelayNode from './DelayNode';
import WebhookNode from './WebhookNode';
import RandomNode from './RandomNode';
import SliceNode from './SliceNode';
import DateTimeNode from './DateTimeNode';
import FileSaveNode from './FileSaveNode';
import TaskBreakdownNode from './TaskBreakdownNode';
import StateNode from './StateNode';
import AIRouterNode from './AIRouterNode';
import ApprovalNode from './ApprovalNode';
import NoteNode from './NoteNode';
import CodeNode from './CodeNode';
import ParallelNode from './ParallelNode';
import TemplateNode from './TemplateNode';
import HtmlCleanNode from './HtmlCleanNode';
import MathNode from './MathNode';
import FormulaNode from './FormulaNode';
import MultiFilterNode from './MultiFilterNode';
import StockAlertNode from './StockAlertNode';
import MultiAgentNode from './MultiAgentNode';
import CompareInputNode from './CompareInputNode';
import TableOutputNode from './TableOutputNode';
import ChartNode from './ChartNode';
import IntentParserNode from './IntentParserNode';
import SmartAnalysisNode from './SmartAnalysisNode';
import CustomEdge from './CustomEdge';

// ============================================
// 통합 모드 설정 (true = UnifiedNode 사용)
// ============================================
const USE_UNIFIED_NODE = true;

// ============================================
// 노드 타입 정의 (통합 버전)
// ============================================

// UnifiedNode를 사용한 모든 노드 타입
const unifiedNodeTypes = {
  // 통합 노드 (모든 타입에 대해 UnifiedNode 사용)
  input: UnifiedNode,
  llm: UnifiedNode,
  transform: UnifiedNode,
  output: UnifiedNode,
  condition: UnifiedNode,
  loop: UnifiedNode,
  api: UnifiedNode,
  delay: UnifiedNode,
  webhook: UnifiedNode,
  random: UnifiedNode,
  slice: UnifiedNode,
  datetime: UnifiedNode,
  filesave: UnifiedNode,
  taskbreakdown: UnifiedNode,
  state: UnifiedNode,
  airouter: UnifiedNode,
  approval: UnifiedNode,
  note: UnifiedNode,
  code: UnifiedNode,
  parallel: UnifiedNode,
  template: UnifiedNode,
  htmlclean: UnifiedNode,
  math: UnifiedNode,
  formula: UnifiedNode,
  multifilter: UnifiedNode,
  stockalert: UnifiedNode,
  multiagent: UnifiedNode,
  compareinput: UnifiedNode,
  tableoutput: UnifiedNode,
  chart: UnifiedNode,
  intentparser: UnifiedNode,
  smartanalysis: UnifiedNode,
};

// 레거시 노드 타입 (기존 개별 컴포넌트 사용)
const legacyNodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  transformNode: TransformNode,
  outputNode: OutputNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  apiNode: ApiNode,
  delayNode: DelayNode,
  webhookNode: WebhookNode,
  randomNode: RandomNode,
  sliceNode: SliceNode,
  datetimeNode: DateTimeNode,
  filesaveNode: FileSaveNode,
  taskbreakdownNode: TaskBreakdownNode,
  stateNode: StateNode,
  airouterNode: AIRouterNode,
  approvalNode: ApprovalNode,
  noteNode: NoteNode,
  codeNode: CodeNode,
  parallelNode: ParallelNode,
  templateNode: TemplateNode,
  htmlcleanNode: HtmlCleanNode,
  mathNode: MathNode,
  formulaNode: FormulaNode,
  multifilterNode: MultiFilterNode,
  stockalertNode: StockAlertNode,
  multiagentNode: MultiAgentNode,
  compareinputNode: CompareInputNode,
  tableoutputNode: TableOutputNode,
  chartNode: ChartNode,
  intentParserNode: IntentParserNode,
  smartanalysisNode: SmartAnalysisNode,
};

// 현재 사용할 노드 타입
const nodeTypes = USE_UNIFIED_NODE ? unifiedNodeTypes : legacyNodeTypes;

// 엣지 타입 정의
const edgeTypes = {
  default: CustomEdge,
};

// ============================================
// 미니맵 색상 (카테고리 기반)
// ============================================

const getCategoryColor = (category: NodeCategory): string => {
  const colors: Record<NodeCategory, string> = {
    ai: '#8b5cf6',       // 보라 (AI)
    external: '#64748b', // 슬레이트 (외부연동)
    control: '#f97316',  // 오렌지 (제어)
    data: '#06b6d4',     // 시안 (데이터)
    finance: '#10b981',  // 에메랄드 (금융)
    io: '#3b82f6',       // 파랑 (입출력)
    other: '#eab308',    // 노랑 (기타)
  };
  return colors[category] || '#6b7280';
};

// 노드 타입에 따른 미니맵 색상
const getMinimapColor = (nodeType: string): string => {
  // 통합 모드: 노드 타입 직접 사용
  if (USE_UNIFIED_NODE) {
    const category = NODE_CATEGORIES[nodeType as keyof typeof NODE_CATEGORIES];
    return getCategoryColor(category || 'other');
  }
  
  // 레거시 모드: ~Node 접미사 제거 후 카테고리 조회
  const cleanType = nodeType.replace('Node', '').toLowerCase();
  const category = NODE_CATEGORIES[cleanType as keyof typeof NODE_CATEGORIES];
  return getCategoryColor(category || 'other');
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

      // 통합 모드에서는 타입명을 그대로 사용, 레거시에서는 Node 접미사 추가
      const nodeType = USE_UNIFIED_NODE 
        ? type.replace('Node', '').toLowerCase() 
        : type;

      const newNode = {
        id: `${nodeType.replace('Node', '')}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          ...nodeData,
          type: nodeType.replace('Node', '').toLowerCase(), // 데이터에도 타입 저장
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

  // 노드 정렬 (Tidy Up) - 간단한 수평 레이아웃
  const handleTidyUp = useCallback(() => {
    if (!reactFlowInstance.current || nodes.length === 0) return;

    // 노드 계층 분석 (입력 노드를 시작점으로)
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const incomingEdges = new Map<string, string[]>();
    const outgoingEdges = new Map<string, string[]>();
    
    edges.forEach(edge => {
      if (!incomingEdges.has(edge.target)) {
        incomingEdges.set(edge.target, []);
      }
      incomingEdges.get(edge.target)?.push(edge.source);
      
      if (!outgoingEdges.has(edge.source)) {
        outgoingEdges.set(edge.source, []);
      }
      outgoingEdges.get(edge.source)?.push(edge.target);
    });

    // 시작 노드 찾기 (incoming edge가 없는 노드)
    const startNodes = nodes.filter(n => !incomingEdges.has(n.id) || incomingEdges.get(n.id)?.length === 0);
    
    // 레벨별 노드 배치
    const levels: string[][] = [];
    const visited = new Set<string>();
    let currentLevel = startNodes.map(n => n.id);
    
    while (currentLevel.length > 0) {
      levels.push(currentLevel);
      currentLevel.forEach(id => visited.add(id));
      
      const nextLevel: string[] = [];
      currentLevel.forEach(nodeId => {
        const targets = outgoingEdges.get(nodeId) || [];
        targets.forEach(targetId => {
          if (!visited.has(targetId) && !nextLevel.includes(targetId)) {
            nextLevel.push(targetId);
          }
        });
      });
      currentLevel = nextLevel;
    }

    // 방문하지 않은 노드들 마지막 레벨에 추가
    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        if (levels.length === 0) {
          levels.push([]);
        }
        levels[levels.length - 1].push(n.id);
      }
    });

    // 새 위치 계산
    const HORIZONTAL_GAP = 300;
    const VERTICAL_GAP = 150;
    const START_X = 100;
    const START_Y = 100;

    const newNodes = nodes.map(node => {
      const levelIndex = levels.findIndex(level => level.includes(node.id));
      const indexInLevel = levels[levelIndex]?.indexOf(node.id) ?? 0;
      
      return {
        ...node,
        position: {
          x: START_X + levelIndex * HORIZONTAL_GAP,
          y: START_Y + indexInLevel * VERTICAL_GAP,
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
      reactFlowInstance.current?.fitView({ padding: 0.2, duration: 300 });
    }, 100);
  }, [nodes, edges, onNodesChange]);

  // 키보드 단축키
  useKeyboardShortcuts({
    onCopy: () => {
      if (selectedNodeId) {
        const selectedNode = nodes.find(n => n.id === selectedNodeId);
        if (selectedNode) {
          localStorage.setItem('copiedNode', JSON.stringify(selectedNode));
          console.log('Node copied:', selectedNodeId);
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
          console.log('Node pasted');
        } catch (e) {
          console.error('Paste failed:', e);
        }
      }
    },
    onDelete: () => {
      if (selectedNodeId) {
        deleteNode(selectedNodeId);
        console.log('Node deleted:', selectedNodeId);
      }
    },
    onSelectAll: () => {
      // 전체 선택은 ReactFlow에서 기본 지원
      console.log('Select all triggered');
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
          console.log('Node duplicated');
        }
      }
    },
    onSave: () => {
      // TODO: 워크플로우 저장 로직
      console.log('Save triggered');
    },
    onRun: () => {
      // TODO: 워크플로우 실행 로직
      console.log('Run triggered');
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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

      {/* 통합 모드 인디케이터 */}
      {USE_UNIFIED_NODE && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
          ✨ 통합 노드 모드
        </div>
      )}
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
