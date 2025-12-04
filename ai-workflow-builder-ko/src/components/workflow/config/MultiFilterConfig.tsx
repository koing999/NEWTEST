'use client';

import { Plus, Minus } from 'lucide-react';
import { MultiFilterNodeData, FilterCondition } from '@/types/workflow';

interface MultiFilterConfigProps {
  data: MultiFilterNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<MultiFilterNodeData>) => void;
}

const OPERATORS = [
  { value: '>=', label: '≥ 이상' },
  { value: '>', label: '> 초과' },
  { value: '<=', label: '≤ 이하' },
  { value: '<', label: '< 미만' },
  { value: '==', label: '= 같음' },
  { value: '!=', label: '≠ 다름' },
];

export function MultiFilterConfig({ data, nodeId, updateNodeData }: MultiFilterConfigProps) {
  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: '',
      operator: '>=',
      value: '',
    };
    updateNodeData(nodeId, {
      conditions: [...(data.conditions || []), newCondition],
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = [...(data.conditions || [])];
    newConditions.splice(index, 1);
    updateNodeData(nodeId, { conditions: newConditions });
  };

  const updateCondition = (index: number, field: keyof FilterCondition, value: string) => {
    const newConditions = [...(data.conditions || [])];
    newConditions[index] = { ...newConditions[index], [field]: value };
    updateNodeData(nodeId, { conditions: newConditions });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">조건 연결</label>
        <select
          value={data.logic}
          onChange={(e) => updateNodeData(nodeId, { logic: e.target.value as 'AND' | 'OR' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
        >
          <option value="AND">AND - 모든 조건 충족</option>
          <option value="OR">OR - 하나 이상 충족</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">조건 목록</label>
          <button
            onClick={addCondition}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            <Plus size={12} /> 추가
          </button>
        </div>
        
        {(data.conditions || []).map((condition, index) => (
          <div key={index} className="flex gap-1 items-center">
            {index > 0 && (
              <span className="text-xs text-gray-400 w-8">{data.logic}</span>
            )}
            <input
              type="text"
              value={condition.field}
              onChange={(e) => updateCondition(index, 'field', e.target.value)}
              placeholder="필드명"
              className="w-20 p-2 border border-gray-300 rounded text-sm"
            />
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(index, 'operator', e.target.value as FilterCondition['operator'])}
              className="w-16 p-2 border border-gray-300 rounded text-sm"
            >
              {OPERATORS.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={condition.value}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              placeholder="값"
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={() => removeCondition(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded"
            >
              <Minus size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 space-y-2">
        <p className="text-xs text-cyan-700 font-medium">📋 주식 필터 예시</p>
        <pre className="text-[10px] text-cyan-600 bg-cyan-100 p-2 rounded overflow-x-auto">{`조건:
  highRise >= 18
  AND maxDrop <= -8
  AND currentRise >= 13

결과: 조건을 모두 충족하는 항목만 통과`}</pre>
      </div>
    </div>
  );
}
