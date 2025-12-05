'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Plus, Minus } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { StateNodeData } from '@/types/workflow';

const operationLabels = {
  init: '🏁 초기화',
  get: '📖 읽기',
  set: '✏️ 쓰기',
  update: '🔄 업데이트',
};

const operationColors = {
  init: 'from-emerald-500 to-teal-500',
  get: 'from-blue-500 to-cyan-500',
  set: 'from-orange-500 to-amber-500',
  update: 'from-purple-500 to-pink-500',
};

function StateNode({ id, data, selected }: NodeProps<StateNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-teal-400 shadow-lg shadow-teal-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[220px] max-w-[280px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${operationColors[data.operation]} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
        <Database size={18} />
        <span className="font-medium">{data.label || '상태 관리'}</span>
        {result?.status === 'running' && (
          <div className="ml-auto animate-spin">⚙️</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* 작업 타입 배지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">
            {operationLabels[data.operation]}
          </span>
          <span className="text-xs text-gray-400">
            {data.variables?.length || 0}개 변수
          </span>
        </div>

        {/* 변수 목록 미리보기 */}
        {data.variables && data.variables.length > 0 ? (
          <div className="space-y-1 max-h-[120px] overflow-y-auto">
            {data.variables.slice(0, 4).map((variable, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 px-2 py-1 rounded">
                <span className="font-mono text-teal-600">${variable.key}</span>
                <span className="text-gray-400">=</span>
                <span className="text-gray-600 truncate flex-1">
                  {variable.value || '(빈 값)'}
                </span>
                <span className={`px-1 rounded text-[10px] ${
                  variable.type === 'string' ? 'bg-blue-100 text-blue-600' :
                  variable.type === 'number' ? 'bg-green-100 text-green-600' :
                  variable.type === 'boolean' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {variable.type}
                </span>
              </div>
            ))}
            {data.variables.length > 4 && (
              <div className="text-xs text-gray-400 text-center">
                +{data.variables.length - 4}개 더...
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">💡 Flow State</div>
            <div>워크플로우 전체에서 공유하는 변수를 관리해요</div>
          </div>
        )}

        {/* 결과 */}
        {result?.status === 'success' && result.output && (
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
            ✅ {data.operation === 'get' ? result.output : '상태 업데이트됨'}
          </div>
        )}

        {/* 에러 */}
        {result?.status === 'error' && (
          <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
            ❌ {result.error}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(StateNode);
