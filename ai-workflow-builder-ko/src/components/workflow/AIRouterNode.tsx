'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Route, ArrowRight } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { AIRouterNodeData } from '@/types/workflow';

function AIRouterNode({ id, data, selected }: NodeProps<AIRouterNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-violet-400 shadow-lg shadow-violet-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  // 선택된 시나리오 찾기
  const selectedScenario = data.scenarios?.find(s => s.id === data.result);

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-violet-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[260px] max-w-[320px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Route size={18} />
        <span className="font-medium">{data.label || 'AI 라우터'}</span>
        {result?.status === 'running' && (
          <div className="ml-auto animate-pulse">🤔</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* 지시사항 미리보기 */}
        {data.instruction && (
          <div className="text-xs text-gray-600 bg-violet-50 p-2 rounded mb-3 line-clamp-2">
            📋 {data.instruction}
          </div>
        )}

        {/* 시나리오 목록 */}
        <div className="space-y-1">
          {data.scenarios && data.scenarios.length > 0 ? (
            data.scenarios.map((scenario, idx) => (
              <div
                key={scenario.id}
                className={`flex items-center gap-2 text-xs p-2 rounded transition-all ${
                  selectedScenario?.id === scenario.id
                    ? 'bg-violet-100 border border-violet-300'
                    : 'bg-gray-50'
                }`}
              >
                <ArrowRight size={12} className={
                  selectedScenario?.id === scenario.id ? 'text-violet-500' : 'text-gray-400'
                } />
                <span className={`font-medium ${
                  selectedScenario?.id === scenario.id ? 'text-violet-700' : 'text-gray-700'
                }`}>
                  {scenario.name}
                </span>
                {selectedScenario?.id === scenario.id && (
                  <span className="ml-auto text-violet-500">✓</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div className="font-medium mb-1">🤖 AI 의도 분류</div>
              <div>입력을 분석해서 적절한 경로로 보내요</div>
            </div>
          )}
        </div>

        {/* 실행 중 */}
        {result?.status === 'running' && (
          <div className="mt-3 p-2 bg-violet-50 rounded text-xs text-violet-600 animate-pulse">
            🧠 입력을 분석하는 중...
          </div>
        )}

        {/* 결과 */}
        {result?.status === 'success' && selectedScenario && (
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
            ✅ "{selectedScenario.name}" 경로로 라우팅됨
          </div>
        )}

        {/* 에러 */}
        {result?.status === 'error' && (
          <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
            ❌ {result.error}
          </div>
        )}
      </div>

      {/* Handles - 입력 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-violet-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      {/* Handles - 시나리오별 출력 */}
      {data.scenarios && data.scenarios.map((scenario, idx) => (
        <Handle
          key={scenario.id}
          type="source"
          position={Position.Right}
          id={scenario.id}
          className="!bg-violet-500 !w-3 !h-3 !border-2 !border-white"
          style={{ top: `${30 + (idx * 25)}%` }}
        />
      ))}
      
      {/* 기본 출력 (시나리오 없을 때) */}
      {(!data.scenarios || data.scenarios.length === 0) && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-violet-500 !w-3 !h-3 !border-2 !border-white"
        />
      )}
    </div>
  );
}

export default memo(AIRouterNode);
