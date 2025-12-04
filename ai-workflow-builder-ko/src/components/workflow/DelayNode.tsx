'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Timer, Coffee } from 'lucide-react';
import { DelayNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function DelayNode({ id, data, selected }: NodeProps<DelayNodeData>) {
  const { nodeResults, setSelectedNode } = useWorkflowStore();
  const result = nodeResults[id];
  
  const isRunning = result?.status === 'running';
  const isSuccess = result?.status === 'success';
  const isError = result?.status === 'error';

  const seconds = (data.delayMs || 1000) / 1000;

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        min-w-[180px] rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-yellow-500 shadow-yellow-200' : 'border-gray-200'}
        ${isRunning ? 'border-yellow-400 animate-pulse' : ''}
        ${isSuccess ? 'border-green-400' : ''}
        ${isError ? 'border-red-400' : ''}
        bg-white
      `}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-yellow-400 border-2 border-white"
      />

      {/* 헤더 */}
      <div className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-t-lg">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Coffee size={14} className="text-white animate-bounce" />
          ) : (
            <Timer size={14} className="text-white" />
          )}
          <span className="text-white font-medium text-sm">{data.label}</span>
        </div>
      </div>

      {/* 바디 */}
      <div className="p-3 space-y-2">
        {/* 대기 시간 */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="text-2xl font-bold text-yellow-600">{seconds}</span>
          <span className="text-sm text-gray-500">초</span>
        </div>

        {/* 실행 중일 때 */}
        {isRunning && (
          <div className="flex items-center justify-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <Coffee size={14} className="text-yellow-600 animate-pulse" />
            <span className="text-xs text-yellow-700">쉬는 중... ☕</span>
          </div>
        )}

        {/* 이유 */}
        {data.reason && !isRunning && (
          <div className="text-xs text-gray-500 text-center">
            {data.reason}
          </div>
        )}

        {/* 완료 */}
        {isSuccess && (
          <div className="text-xs text-green-600 text-center">
            ✓ 충분히 쉬었음
          </div>
        )}
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-yellow-400 border-2 border-white"
      />
    </div>
  );
}

export default memo(DelayNode);
