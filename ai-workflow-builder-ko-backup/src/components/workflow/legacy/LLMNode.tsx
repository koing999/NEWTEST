'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { LLMNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { MODEL_INFO, PROVIDER_INFO, formatCost, isModelFree } from '@/utils/cost-calculator';

function LLMNode({ id, data, selected }: NodeProps<LLMNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const nodeResult = nodeResults[id];
  const modelInfo = MODEL_INFO[data.model];
  const providerInfo = PROVIDER_INFO[data.provider];

  const getStatusIcon = () => {
    if (!nodeResult) return null;
    switch (nodeResult.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getProviderGradient = () => {
    switch (data.provider) {
      case 'openai':
        return 'from-emerald-50 to-green-100 border-emerald-300';
      case 'anthropic':
        return 'from-orange-50 to-amber-100 border-orange-300';
      case 'gemini':
        return 'from-blue-50 to-indigo-100 border-blue-300';
      case 'groq':
        return 'from-red-50 to-rose-100 border-red-300';
      case 'deepseek':
        return 'from-purple-50 to-violet-100 border-purple-300';
      case 'xai':
        return 'from-gray-50 to-slate-100 border-gray-400';
      case 'perplexity':
        return 'from-teal-50 to-cyan-100 border-teal-300';
      case 'mistral':
        return 'from-indigo-50 to-blue-100 border-indigo-300';
      case 'cohere':
        return 'from-pink-50 to-rose-100 border-pink-300';
      case 'moonshot':
        return 'from-yellow-50 to-amber-100 border-yellow-400';
      default:
        return 'from-gray-50 to-gray-100 border-gray-300';
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2 min-w-[240px] max-w-[300px]
        bg-gradient-to-br ${getProviderGradient()}
        ${selected ? 'ring-2 ring-blue-200 border-blue-500' : ''}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${providerInfo?.color || 'bg-gray-500'} text-white`}>
            <Bot size={14} />
          </div>
          <span className="font-semibold text-gray-800 text-sm">
            {data.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isModelFree(data.model) && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded">
              무료
            </span>
          )}
          {getStatusIcon()}
        </div>
      </div>

      {/* 모델 정보 */}
      <div className="mb-2 p-2 bg-white/60 rounded-md">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Sparkles size={12} />
          <span className="font-medium">{modelInfo?.name || data.model}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
          <span className={`px-1 py-0.5 rounded text-white text-[8px] ${providerInfo?.color || 'bg-gray-500'}`}>
            {providerInfo?.name || data.provider}
          </span>
          <span>{formatCost(modelInfo?.cost.promptTokenCost || 0)}/1K</span>
        </div>
      </div>

      {/* 프롬프트 미리보기 */}
      <div className="text-xs text-gray-600 bg-white/40 rounded p-2 truncate">
        <span className="font-medium">프롬프트: </span>
        {data.userPrompt?.slice(0, 50) || '클릭해서 설정하세요...'}
        {data.userPrompt && data.userPrompt.length > 50 && '...'}
      </div>

      {/* 결과 미리보기 (실행 후) */}
      {data.result && (
        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
          <div className="text-[10px] text-green-700 font-medium mb-1">결과:</div>
          <div className="text-xs text-green-800 truncate">
            {data.result.slice(0, 80)}...
          </div>
          {data.usage && (
            <div className="text-[10px] text-green-600 mt-1">
              {data.usage.totalTokens} 토큰 · {formatCost(data.cost || 0)}
            </div>
          )}
        </div>
      )}

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(LLMNode);
