'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Repeat, ArrowRight } from 'lucide-react';
import { LoopNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

const loopTypeLabels: Record<string, string> = {
  'count': '횟수 반복',
  'foreach': '각 항목',
  'while': '조건 반복',
};

function LoopNode({ id, data, selected }: NodeProps<LoopNodeData>) {
  const { nodeResults, setSelectedNode } = useWorkflowStore();
  const result = nodeResults[id];
  
  const isRunning = result?.status === 'running';
  const isSuccess = result?.status === 'success';
  const isError = result?.status === 'error';

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        min-w-[200px] rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-cyan-500 shadow-cyan-200' : 'border-gray-200'}
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
        className="w-3 h-3 !bg-cyan-400 border-2 border-white"
      />

      {/* 헤더 */}
      <div className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Repeat size={14} className="text-white" />
          <span className="text-white font-medium text-sm">{data.label}</span>
        </div>
      </div>

      {/* 바디 */}
      <div className="p-3 space-y-2">
        {/* 반복 타입 */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">타입:</span>
          <span className="font-medium text-gray-700 bg-cyan-100 px-2 py-0.5 rounded">
            {loopTypeLabels[data.loopType] || data.loopType}
          </span>
        </div>

        {/* 최대 반복 횟수 */}
        <div className="text-xs">
          <span className="text-gray-500">최대 반복:</span>
          <span className="ml-1 font-mono text-cyan-600 font-bold">
            {data.maxIterations}회
          </span>
        </div>

        {/* foreach 구분자 */}
        {data.loopType === 'foreach' && (
          <div className="text-xs">
            <span className="text-gray-500">구분자:</span>
            <span className="ml-1 font-mono text-gray-700 bg-gray-100 px-1 rounded">
              {data.delimiter === '\n' ? '줄바꿈' : data.delimiter || ','}
            </span>
          </div>
        )}

        {/* 현재 진행 상황 */}
        {isRunning && data.currentIndex !== undefined && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <div className="animate-spin">
              <Repeat size={12} className="text-yellow-600" />
            </div>
            <span className="text-xs text-yellow-700">
              {data.currentIndex + 1} / {data.maxIterations} 처리 중...
            </span>
          </div>
        )}

        {/* 완료된 결과 개수 */}
        {isSuccess && data.results && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <ArrowRight size={12} className="text-green-600" />
            <span className="text-xs text-green-700">
              {data.results.length}개 결과 생성
            </span>
          </div>
        )}

        {/* 에러 표시 */}
        {isError && result?.error && (
          <div className="p-2 bg-red-50 rounded text-xs text-red-600 border border-red-200">
            {result.error}
          </div>
        )}
      </div>

      {/* 루프 내부 연결 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        id="loop"
        style={{ top: '30%' }}
        className="w-3 h-3 !bg-cyan-500 border-2 border-white"
      />
      <div 
        className="absolute text-[10px] font-bold text-cyan-600"
        style={{ right: '-32px', top: '26%' }}
      >
        반복
      </div>

      {/* 완료 후 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        id="done"
        style={{ top: '70%' }}
        className="w-3 h-3 !bg-teal-500 border-2 border-white"
      />
      <div 
        className="absolute text-[10px] font-bold text-teal-600"
        style={{ right: '-32px', top: '66%' }}
      >
        완료
      </div>
    </div>
  );
}

export default memo(LoopNode);
