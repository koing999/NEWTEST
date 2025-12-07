// components/workflow/Canvas.tsx
'use client';
import ReactFlow, { Background, Controls } from 'reactflow';

export default function Canvas() {
  return (
    <ReactFlow nodes={[]} edges={[]}>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
