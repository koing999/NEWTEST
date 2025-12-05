'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StickyNote } from 'lucide-react';
import { NoteNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function NoteNode({ id, data, selected }: NodeProps<NoteNodeData>) {
  const { setSelectedNode } = useWorkflowStore();
  
  const bgColor = data.backgroundColor || '#fef3c7';
  const textColor = data.textColor || '#92400e';

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        min-w-[200px] max-w-[300px] rounded-lg shadow-lg transition-all duration-200
        ${selected ? 'ring-2 ring-amber-500 ring-offset-2' : ''}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-300/50">
        <StickyNote size={16} style={{ color: textColor }} />
        <span className="text-xs font-semibold" style={{ color: textColor }}>
          {data.label || '메모'}
        </span>
        <span className="ml-auto text-[10px] bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
          주석
        </span>
      </div>

      {/* 내용 */}
      <div className="p-3">
        <p className="text-sm whitespace-pre-wrap" style={{ color: textColor }}>
          {data.content || '메모를 입력하세요...'}
        </p>
      </div>

      {/* 참고: Note 노드는 실행되지 않으므로 Handle이 없어도 됨 */}
      {/* 하지만 시각적 연결을 위해 옵션으로 추가 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(NoteNode);
