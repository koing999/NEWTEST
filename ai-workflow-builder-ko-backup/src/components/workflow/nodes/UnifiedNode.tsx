// components/workflow/nodes/UnifiedNode.tsx
'use client';
import { Handle, Position } from 'reactflow';
import { UnifiedNodeData } from '@/lib/workflow/types';

const typeColor = {
  trigger: 'bg-emerald-500',
  agent: 'bg-blue-500',
  output: 'bg-purple-500',
};

export default function UnifiedNode({ data }: { data: UnifiedNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className={`px-4 py-3 rounded-lg shadow-lg text-white font-bold ${typeColor[data.type]}`}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </>
  );
}
