'use client';

import { TransformNodeData } from '@/types/workflow';

interface TransformConfigProps {
  data: TransformNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<TransformNodeData>) => void;
}

export function TransformConfig({ data, nodeId, updateNodeData }: TransformConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">변환 타입</label>
        <select
          value={data.transformType}
          onChange={(e) => updateNodeData(nodeId, { 
            transformType: e.target.value as TransformNodeData['transformType'],
            config: {} 
          })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
        >
          <option value="json-extract">JSON 추출</option>
          <option value="text-split">텍스트 분할</option>
          <option value="regex">정규식 매칭</option>
          <option value="template">템플릿</option>
        </select>
      </div>

      {data.transformType === 'json-extract' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">JSON 경로</label>
          <input
            type="text"
            value={data.config?.jsonPath || ''}
            onChange={(e) => updateNodeData(nodeId, { 
              config: { ...data.config, jsonPath: e.target.value } 
            })}
            placeholder="$.data.result"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {data.transformType === 'text-split' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">구분자</label>
          <input
            type="text"
            value={data.config?.delimiter || ''}
            onChange={(e) => updateNodeData(nodeId, { 
              config: { ...data.config, delimiter: e.target.value } 
            })}
            placeholder=","
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {data.transformType === 'regex' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">정규식 패턴</label>
          <input
            type="text"
            value={data.config?.pattern || ''}
            onChange={(e) => updateNodeData(nodeId, { 
              config: { ...data.config, pattern: e.target.value } 
            })}
            placeholder="[0-9]+"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {data.transformType === 'template' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">템플릿</label>
          <textarea
            value={data.config?.template || ''}
            onChange={(e) => updateNodeData(nodeId, { 
              config: { ...data.config, template: e.target.value } 
            })}
            placeholder="결과: {{input}}"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500"
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
