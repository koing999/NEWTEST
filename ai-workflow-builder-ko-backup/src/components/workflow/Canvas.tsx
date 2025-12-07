// components/workflow/Canvas.tsx
'use client';
import ReactFlow, { Background, Controls, NodeTypes } from 'reactflow';
import { initialNodes } from '@/lib/workflow/types';
import UnifiedNode from './nodes/UnifiedNode';

const nodeTypes: NodeTypes = {
  custom: UnifiedNode,
};

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export default function Canvas() {
  return (
    <ReactFlow 
      nodes={initialNodes} 
      edges={initialEdges}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
