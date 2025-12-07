// components/workflow/Canvas.tsx
'use client';
import ReactFlow, { Background, Controls, NodeTypes, useNodesState, useEdgesState, useReactFlow } from 'reactflow';
import { initialNodes } from '@/lib/workflow/types';
import { runWorkflow } from '@/lib/workflow/engine';
import UnifiedNode from './nodes/UnifiedNode';

const nodeTypes: NodeTypes = { custom: UnifiedNode };

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export default function Canvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const handleRun = () => {
    runWorkflow(nodes, edges);
    setTimeout(() => fitView(), 100);
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleRun}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xl rounded-xl shadow-2xl hover:scale-105 transition-all"
        >
          ▶️ 실행하기
        </button>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </>
  );
}
