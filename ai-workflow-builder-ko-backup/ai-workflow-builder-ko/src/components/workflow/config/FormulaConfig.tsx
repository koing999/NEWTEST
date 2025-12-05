'use client';

import { Plus, Minus } from 'lucide-react';
import { FormulaNodeData, FormulaItem } from '@/types/workflow';

interface FormulaConfigProps {
  data: FormulaNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<FormulaNodeData>) => void;
}

export function FormulaConfig({ data, nodeId, updateNodeData }: FormulaConfigProps) {
  const addFormula = () => {
    const newFormula: FormulaItem = {
      name: `result${(data.formulas?.length || 0) + 1}`,
      formula: '',
      label: '',
    };
    updateNodeData(nodeId, {
      formulas: [...(data.formulas || []), newFormula],
    });
  };

  const removeFormula = (index: number) => {
    const newFormulas = [...(data.formulas || [])];
    newFormulas.splice(index, 1);
    updateNodeData(nodeId, { formulas: newFormulas });
  };

  const updateFormula = (index: number, field: keyof FormulaItem, value: string) => {
    const newFormulas = [...(data.formulas || [])];
    newFormulas[index] = { ...newFormulas[index], [field]: value };
    updateNodeData(nodeId, { formulas: newFormulas });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">공식 목록</label>
          <button
            onClick={addFormula}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-500 text-white rounded hover:bg-violet-600"
          >
            <Plus size={12} /> 추가
          </button>
        </div>
        
        {(data.formulas || []).map((formula, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded border space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={formula.name}
                onChange={(e) => updateFormula(index, 'name', e.target.value)}
                placeholder="결과 변수명"
                className="w-28 p-2 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-400">=</span>
              <input
                type="text"
                value={formula.formula}
                onChange={(e) => updateFormula(index, 'formula', e.target.value)}
                placeholder="(high / open - 1) * 100"
                className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono"
              />
              <button
                onClick={() => removeFormula(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="outputAsJson"
          checked={data.outputAsJson || false}
          onChange={(e) => updateNodeData(nodeId, { outputAsJson: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="outputAsJson" className="text-sm text-gray-600">결과를 JSON으로 출력</label>
      </div>

      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 space-y-2">
        <p className="text-xs text-violet-700 font-medium">📊 주식 분석 예시</p>
        <pre className="text-[10px] text-violet-600 bg-violet-100 p-2 rounded overflow-x-auto">{`입력 JSON:
{ "open": 50000, "high": 60000, "low": 45000, "current": 55000 }

공식:
highRise = (high / open - 1) * 100
maxDrop = (low / high - 1) * 100
currentRise = (current / open - 1) * 100`}</pre>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-700 font-medium">💡 사용 가능한 연산</p>
        <p className="text-xs text-gray-600 mt-1">
          <code className="bg-gray-100 px-1 rounded">+ - * /</code> 사칙연산, 
          <code className="bg-gray-100 px-1 rounded">()</code> 괄호,
          JSON 필드명 직접 사용
        </p>
      </div>
    </div>
  );
}
