'use client';

import { LLMNodeData, LLMProvider, LLMModel } from '@/types/workflow';
import { PROVIDER_MODELS, MODEL_INFO, PROVIDER_INFO, formatCost, isModelFree } from '@/utils/cost-calculator';

interface LLMConfigProps {
  data: LLMNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<LLMNodeData>) => void;
}

export function LLMConfig({ data, nodeId, updateNodeData }: LLMConfigProps) {
  const providerInfo = PROVIDER_INFO[data.provider];

  return (
    <div className="space-y-4">
      {/* 프로바이더 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AI 제공자</label>
        <select
          value={data.provider}
          onChange={(e) => {
            const newProvider = e.target.value as LLMProvider;
            const newModel = PROVIDER_MODELS[newProvider][0];
            updateNodeData(nodeId, { provider: newProvider, model: newModel });
          }}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(PROVIDER_INFO).map(([key, info]) => (
            <option key={key} value={key}>{info.name} - {info.description}</option>
          ))}
        </select>
        <div className="mt-1 flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-medium text-white rounded ${providerInfo?.color || 'bg-gray-500'}`}>
            {providerInfo?.name}
          </span>
          <span className="text-xs text-gray-500">{providerInfo?.description}</span>
        </div>
      </div>

      {/* 모델 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">모델</label>
        <select
          value={data.model}
          onChange={(e) => updateNodeData(nodeId, { model: e.target.value as LLMModel })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {PROVIDER_MODELS[data.provider]?.map((model) => {
            const info = MODEL_INFO[model];
            const isFree = isModelFree(model);
            return (
              <option key={model} value={model}>
                {info?.name || model} {isFree ? '(무료!)' : `(${formatCost(info?.cost.promptTokenCost || 0)}/1K)`}
              </option>
            );
          })}
        </select>
        {MODEL_INFO[data.model] && (
          <p className="mt-1 text-xs text-gray-500">{MODEL_INFO[data.model].description}</p>
        )}
      </div>

      {/* 시스템 프롬프트 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">시스템 프롬프트</label>
        <textarea
          value={data.systemPrompt || ''}
          onChange={(e) => updateNodeData(nodeId, { systemPrompt: e.target.value })}
          placeholder="당신은 유능한 AI 어시스턴트입니다..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* 사용자 프롬프트 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">사용자 프롬프트</label>
        <textarea
          value={data.userPrompt}
          onChange={(e) => updateNodeData(nodeId, { userPrompt: e.target.value })}
          placeholder="{{input}}을 사용해서 이전 노드의 출력을 참조할 수 있어요"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <p className="mt-1 text-xs text-gray-500">
          <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code>을 사용하면 연결된 노드의 입력값을 삽입해요
        </p>
      </div>

      {/* 온도 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          창의성(Temperature): {data.temperature?.toFixed(1) || '0.7'}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={data.temperature || 0.7}
          onChange={(e) => updateNodeData(nodeId, { temperature: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>정확함</span>
          <span>창의적</span>
        </div>
      </div>

      {/* 최대 토큰 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">최대 토큰 수</label>
        <input
          type="number"
          value={data.maxTokens || 1000}
          onChange={(e) => updateNodeData(nodeId, { maxTokens: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          min={1}
          max={MODEL_INFO[data.model]?.maxTokens || 4096}
        />
      </div>
    </div>
  );
}
