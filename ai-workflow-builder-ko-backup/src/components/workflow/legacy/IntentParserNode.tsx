'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { IntentParserNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function IntentParserNode({ id, data, selected }: NodeProps<IntentParserNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const nodeResult = nodeResults[id];

  const getStatusIcon = () => {
    if (!nodeResult) return null;
    switch (nodeResult.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-purple-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // 파싱 결과에서 requestType 추출
  const getRequestTypeLabel = () => {
    if (data.result) {
      try {
        const parsed = JSON.parse(data.result);
        const typeMap: Record<string, string> = {
          'dart': '📊 DART 공시',
          'stock-kr': '🇰🇷 국내주식',
          'stock-us': '🇺🇸 해외주식',
          'news': '📰 뉴스',
          'weather': '🌤️ 날씨',
          'general': '💬 일반질문',
        };
        return typeMap[parsed.requestType] || parsed.requestType;
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2 min-w-[200px] max-w-[280px]
        bg-gradient-to-br from-purple-50 via-pink-50 to-violet-100 border-purple-300
        ${selected ? 'ring-2 ring-purple-300 border-purple-500' : ''}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white">
            <Brain size={14} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">
            {data.label || '통역사'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500 text-white rounded">
            AI
          </span>
          {getStatusIcon()}
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-2 p-2 bg-white/60 rounded-md">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Zap size={12} className="text-purple-500" />
          <span>사람 말 → AI 명령으로 변환</span>
        </div>
      </div>

      {/* 지원 기능 미리보기 */}
      <div className="flex flex-wrap gap-1 text-[10px] mb-2">
        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">DART</span>
        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">주식</span>
        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">뉴스</span>
        <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded">날씨</span>
      </div>

      {/* 결과 미리보기 (실행 후) */}
      {data.result && (
        <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
          <div className="text-[10px] text-purple-700 font-medium mb-1">
            분석 결과:
          </div>
          {getRequestTypeLabel() && (
            <div className="text-xs font-medium text-purple-800 mb-1">
              {getRequestTypeLabel()}
            </div>
          )}
          <div className="text-[10px] text-purple-600 truncate">
            {data.result.slice(0, 60)}...
          </div>
        </div>
      )}

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(IntentParserNode);
