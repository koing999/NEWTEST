'use client';

import { Plus, Minus } from 'lucide-react';
import { StateNodeData, StateVariable } from '@/types/workflow';

interface StateConfigProps {
  data: StateNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<StateNodeData>) => void;
}

export function StateConfig({ data, nodeId, updateNodeData }: StateConfigProps) {
  const addVariable = () => {
    const newVar: StateVariable = {
      key: `var${(data.variables?.length || 0) + 1}`,
      value: '',
      type: 'string',
    };
    updateNodeData(nodeId, {
      variables: [...(data.variables || []), newVar],
    });
  };

  const removeVariable = (index: number) => {
    const newVars = [...(data.variables || [])];
    newVars.splice(index, 1);
    updateNodeData(nodeId, { variables: newVars });
  };

  const updateVariable = (index: number, field: keyof StateVariable, value: string) => {
    const newVars = [...(data.variables || [])];
    newVars[index] = { ...newVars[index], [field]: value };
    updateNodeData(nodeId, { variables: newVars });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">작업</label>
        <select
          value={data.operation}
          onChange={(e) => updateNodeData(nodeId, { operation: e.target.value as StateNodeData['operation'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
        >
          <option value="init">초기화 (init)</option>
          <option value="get">읽기 (get)</option>
          <option value="set">쓰기 (set)</option>
          <option value="update">업데이트 (update)</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">변수 목록</label>
          <button
            onClick={addVariable}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            <Plus size={12} /> 추가
          </button>
        </div>
        
        {(data.variables || []).map((variable, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={variable.key}
              onChange={(e) => updateVariable(index, 'key', e.target.value)}
              placeholder="변수명"
              className="w-20 p-2 border border-gray-300 rounded text-sm"
            />
            <select
              value={variable.type}
              onChange={(e) => updateVariable(index, 'type', e.target.value)}
              className="w-20 p-2 border border-gray-300 rounded text-sm"
            >
              <option value="string">문자열</option>
              <option value="number">숫자</option>
              <option value="boolean">불리언</option>
              <option value="json">JSON</option>
            </select>
            <input
              type="text"
              value={variable.value}
              onChange={(e) => updateVariable(index, 'value', e.target.value)}
              placeholder="값"
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={() => removeVariable(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded"
            >
              <Minus size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
        <p className="text-xs text-teal-700">
          💡 워크플로우 전체에서 공유할 수 있는 상태 변수를 관리해요
        </p>
      </div>
    </div>
  );
}
