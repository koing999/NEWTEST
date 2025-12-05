'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, Check, X } from 'lucide-react';
import { ConditionNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

const conditionLabels: Record<string, string> = {
  'contains': '포함',
  'equals': '같음',
  'greater': '초과',
  'less': '미만',
  'regex': '정규식',
  'empty': '비어있음',
  'not-empty': '비어있지 않음',
};

function ConditionNode({ id, data, selected }: NodeProps<ConditionNodeData>) {
  const { nodeResults, setSelectedNode } = useWorkflowStore();
  const result = nodeResults[id];
  
  const isRunning = result?.status === 'running';
  const isSuccess = result?.status === 'success';
  const isError = result?.status === 'error';
  const conditionResult = data.result;

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        min-w-[200px] rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-orange-500 shadow-orange-200' : 'border-gray-200'}
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
        className="w-3 h-3 !bg-orange-400 border-2 border-white"
      />

      {/* 헤더 */}
      <div className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-lg">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-white" />
          <span className="text-white font-medium text-sm">{data.label}</span>
        </div>
      </div>

      {/* 바디 */}
      <div className="p-3 space-y-2">
        {/* 조건 타입 */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">조건:</span>
          <span className="font-medium text-gray-700 bg-orange-100 px-2 py-0.5 rounded">
            {conditionLabels[data.conditionType] || data.conditionType}
          </span>
        </div>

        {/* 비교 값 (empty/not-empty 제외) */}
        {data.conditionType !== 'empty' && data.conditionType !== 'not-empty' && (
          <div className="text-xs">
            <span className="text-gray-500">비교값:</span>
            <span className="ml-1 font-mono text-gray-700 bg-gray-100 px-1 rounded">
              {data.conditionValue || '(없음)'}
            </span>
          </div>
        )}

        {/* 실행 결과 */}
        {conditionResult && (
          <div className={`
            flex items-center gap-2 p-2 rounded-lg text-sm font-medium
            ${conditionResult === 'true' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'}
          `}>
            {conditionResult === 'true' ? (
              <>
                <Check size={14} />
                <span>참 (TRUE)</span>
              </>
            ) : (
              <>
                <X size={14} />
                <span>거짓 (FALSE)</span>
              </>
            )}
          </div>
        )}

        {/* 에러 표시 */}
        {isError && result?.error && (
          <div className="p-2 bg-red-50 rounded text-xs text-red-600 border border-red-200">
            {result.error}
          </div>
        )}
      </div>

      {/* 출력 핸들 - TRUE (위) */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '30%' }}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
      <div 
        className="absolute text-[10px] font-bold text-green-600"
        style={{ right: '-28px', top: '26%' }}
      >
        참
      </div>

      {/* 출력 핸들 - FALSE (아래) */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '70%' }}
        className="w-3 h-3 !bg-red-500 border-2 border-white"
      />
      <div 
        className="absolute text-[10px] font-bold text-red-600"
        style={{ right: '-32px', top: '66%' }}
      >
        거짓
      </div>
    </div>
  );
}

export default memo(ConditionNode);
