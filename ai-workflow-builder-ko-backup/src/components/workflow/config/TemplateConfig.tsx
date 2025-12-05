'use client';

import { Plus, Minus } from 'lucide-react';
import { TemplateNodeData, TemplateVariable } from '@/types/workflow';

interface TemplateConfigProps {
  data: TemplateNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<TemplateNodeData>) => void;
}

export function TemplateConfig({ data, nodeId, updateNodeData }: TemplateConfigProps) {
  // 템플릿에서 변수 추출
  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  };

  const addVariable = () => {
    const newVar: TemplateVariable = {
      key: `var${(data.variables?.length || 0) + 1}`,
      value: '',
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

  const updateVariable = (index: number, field: keyof TemplateVariable, value: string) => {
    const newVars = [...(data.variables || [])];
    newVars[index] = { ...newVars[index], [field]: value };
    updateNodeData(nodeId, { variables: newVars });
  };

  const templateVars = extractVariables(data.template || '');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">템플릿</label>
        <textarea
          value={data.template || ''}
          onChange={(e) => updateNodeData(nodeId, { template: e.target.value })}
          placeholder={`안녕하세요 {{name}}님,

{{content}}

감사합니다.`}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-500 font-mono"
          rows={6}
        />
        <p className="mt-1 text-xs text-gray-500">
          <code className="bg-gray-100 px-1 rounded">{'{{변수명}}'}</code> 형식으로 변수 사용
        </p>
      </div>

      {templateVars.length > 0 && (
        <div className="p-2 bg-sky-50 rounded border border-sky-200">
          <p className="text-xs text-sky-700 mb-1">🔍 감지된 변수:</p>
          <div className="flex flex-wrap gap-1">
            {templateVars.map(v => (
              <span key={v} className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">변수 기본값</label>
          <button
            onClick={addVariable}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600"
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
              className="w-24 p-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={variable.value || ''}
              onChange={(e) => updateVariable(index, 'value', e.target.value)}
              placeholder="기본값"
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

      <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
        <p className="text-xs text-sky-700">
          💡 입력이 JSON이면 자동으로 필드를 변수에 매핑해요<br/>
          예: <code className="bg-sky-100 px-1 rounded">{"{ name: '홍길동' }"}</code> → <code className="bg-sky-100 px-1 rounded">{'{{name}}'}</code>에 자동 대입
        </p>
      </div>
    </div>
  );
}
