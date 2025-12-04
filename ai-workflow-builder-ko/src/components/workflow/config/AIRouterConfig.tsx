'use client';

import { Plus, Minus } from 'lucide-react';
import { AIRouterNodeData, RouterScenario } from '@/types/workflow';

interface AIRouterConfigProps {
  data: AIRouterNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<AIRouterNodeData>) => void;
}

export function AIRouterConfig({ data, nodeId, updateNodeData }: AIRouterConfigProps) {
  const addScenario = () => {
    const newScenario: RouterScenario = {
      id: `scenario-${Date.now()}`,
      name: `시나리오${(data.scenarios?.length || 0) + 1}`,
      description: '',
    };
    updateNodeData(nodeId, {
      scenarios: [...(data.scenarios || []), newScenario],
    });
  };

  const removeScenario = (index: number) => {
    const newScenarios = [...(data.scenarios || [])];
    newScenarios.splice(index, 1);
    updateNodeData(nodeId, { scenarios: newScenarios });
  };

  const updateScenario = (index: number, field: keyof RouterScenario, value: string) => {
    const newScenarios = [...(data.scenarios || [])];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    updateNodeData(nodeId, { scenarios: newScenarios });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">시나리오 목록</label>
          <button
            onClick={addScenario}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-500 text-white rounded hover:bg-violet-600"
          >
            <Plus size={12} /> 추가
          </button>
        </div>
        
        {(data.scenarios || []).map((scenario, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded border space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={scenario.name}
                onChange={(e) => updateScenario(index, 'name', e.target.value)}
                placeholder="시나리오명"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => removeScenario(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Minus size={14} />
              </button>
            </div>
            <textarea
              value={scenario.description}
              onChange={(e) => updateScenario(index, 'description', e.target.value)}
              placeholder="이 시나리오에 해당하는 요청 설명..."
              className="w-full p-2 border border-gray-300 rounded text-xs resize-none"
              rows={2}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">라우팅 지시</label>
        <textarea
          value={data.instruction || ''}
          onChange={(e) => updateNodeData(nodeId, { instruction: e.target.value })}
          placeholder="어떤 기준으로 라우팅할지 설명해주세요..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-violet-500"
          rows={2}
        />
      </div>

      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
        <p className="text-xs text-violet-700">
          💡 AI가 입력을 분석하고 가장 적합한 시나리오를 선택해요
        </p>
      </div>
    </div>
  );
}
