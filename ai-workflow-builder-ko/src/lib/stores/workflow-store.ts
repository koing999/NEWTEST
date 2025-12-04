/**
 * 워크플로우 상태 관리
 * 
 * Zustand를 사용하여 워크플로우 캔버스의 상태를 관리합니다.
 * 노드, 엣지, 실행 상태를 포함합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  Connection, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import { 
  WorkflowNodeData, 
  ExecutionStatus, 
  NodeExecutionResult,
  WorkflowExecutionResult,
  LLMProvider,
  LLMModel,
} from '@/types/workflow';

// ============================================
// 스토어 인터페이스
// ============================================

interface WorkflowState {
  workflowId: string;
  workflowName: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  executionStatus: ExecutionStatus;
  nodeResults: Record<string, NodeExecutionResult>;
  executionResult: WorkflowExecutionResult | null;
  
  setWorkflowName: (name: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setExecutionStatus: (status: ExecutionStatus) => void;
  setNodeResult: (nodeId: string, result: NodeExecutionResult) => void;
  setExecutionResult: (result: WorkflowExecutionResult | null) => void;
  resetExecution: () => void;
  saveWorkflow: () => string;
  loadWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

// ============================================
// 기본 상태
// ============================================

const createDefaultNodes = (): Node<WorkflowNodeData>[] => [
  {
    id: 'input-1',
    type: 'inputNode',
    position: { x: 100, y: 200 },
    data: {
      type: 'input',
      label: '입력',
      inputType: 'text',
      value: '',
      placeholder: '여기에 텍스트를 입력하세요...',
    },
  },
  {
    id: 'llm-1',
    type: 'llmNode',
    position: { x: 400, y: 200 },
    data: {
      type: 'llm',
      label: '🦥 조과장',
      provider: 'groq' as LLMProvider,
      model: 'llama-3.3-70b-versatile' as LLMModel,
      userPrompt: '{{input}}',
      systemPrompt: `당신은 "조과장"입니다. 15년차 만능 과장으로 뭐든지 척척 해결합니다.

특징:
- 간결하고 실용적인 답변
- 어려운 것도 쉽게 설명
- 한국 비즈니스 문화 이해
- 유머 감각 보유

말투: 친근하지만 프로페셔널하게`,
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
  {
    id: 'output-1',
    type: 'outputNode',
    position: { x: 700, y: 200 },
    data: {
      type: 'output',
      label: '출력',
      outputType: 'text',
    },
  },
];

const createDefaultEdges = (): Edge[] => [
  { id: 'e1-2', source: 'input-1', target: 'llm-1', animated: true },
  { id: 'e2-3', source: 'llm-1', target: 'output-1', animated: true },
];

// ============================================
// 스토어 구현
// ============================================

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: `workflow-${Date.now()}`,
  workflowName: '새 워크플로우',
  nodes: createDefaultNodes(),
  edges: createDefaultEdges(),
  selectedNodeId: null,
  executionStatus: 'idle',
  nodeResults: {},
  executionResult: null,

  setWorkflowName: (name) => set({ workflowName: name }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as WorkflowNodeData }
          : node
      ) as Node<WorkflowNodeData>[],
    });
  },

  deleteNode: (nodeId) => {
    const { selectedNodeId } = get();
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setExecutionStatus: (status) => set({ executionStatus: status }),

  setNodeResult: (nodeId, result) => {
    set({ nodeResults: { ...get().nodeResults, [nodeId]: result } });
  },

  setExecutionResult: (result) => set({ executionResult: result }),

  resetExecution: () => {
    set({
      executionStatus: 'idle',
      nodeResults: {},
      executionResult: null,
      nodes: get().nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          result: undefined,
          usage: undefined,
          cost: undefined,
          latency: undefined,
        } as WorkflowNodeData,
      })) as Node<WorkflowNodeData>[],
    });
  },

  saveWorkflow: () => {
    const { workflowId, workflowName, nodes, edges } = get();
    return JSON.stringify({
      id: workflowId,
      name: workflowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    }, null, 2);
  },

  loadWorkflow: (json) => {
    try {
      const data = JSON.parse(json);
      set({
        workflowId: data.id || `workflow-${Date.now()}`,
        workflowName: data.name || '불러온 워크플로우',
        nodes: data.nodes || [],
        edges: data.edges || [],
        selectedNodeId: null,
        executionStatus: 'idle',
        nodeResults: {},
        executionResult: null,
      });
    } catch (err) {
      console.error('워크플로우 불러오기 실패:', err);
    }
  },

  clearWorkflow: () => {
    set({
      workflowId: `workflow-${Date.now()}`,
      workflowName: '새 워크플로우',
      nodes: createDefaultNodes(),
      edges: createDefaultEdges(),
      selectedNodeId: null,
      executionStatus: 'idle',
      nodeResults: {},
      executionResult: null,
    });
  },
}));
