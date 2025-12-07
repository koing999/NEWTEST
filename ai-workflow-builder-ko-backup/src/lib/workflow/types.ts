// lib/workflow/types.ts
export type NodeType = 'trigger' | 'agent' | 'output';

export interface UnifiedNodeData {
  label: string;
  type: NodeType;
  config?: Record<string, any>;
}

export const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { label: '트리거 시작', type: 'trigger' } as UnifiedNodeData,
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 400, y: 100 },
    data: { label: 'AI 에이전트', type: 'agent' } as UnifiedNodeData,
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 700, y: 100 },
    data: { label: '결과 출력', type: 'output' } as UnifiedNodeData,
  },
];
