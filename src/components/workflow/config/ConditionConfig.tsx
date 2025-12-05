'use client';

import { ConditionNodeData } from '@/types/workflow';

interface ConditionConfigProps {
  data: ConditionNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<ConditionNodeData>) => void;
}

export function ConditionConfig({ data, nodeId, updateNodeData }: ConditionConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">조건 타입</label>
        <select
          value={data.conditionType}
          onChange={(e) => updateNodeData(nodeId, { conditionType: e.target.value as ConditionNodeData['conditionType'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
        >
          <option value="contains">포함</option>
          <option value="equals">같음</option>
          <option value="greater">초과 (숫자)</option>
          <option value="less">미만 (숫자)</option>
          <option value="regex">정규식</option>
          <option value="empty">비어있음</option>
          <option value="not-empty">비어있지 않음</option>
        </select>
      </div>

      {data.conditionType !== 'empty' && data.conditionType !== 'not-empty' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비교할 값</label>
          <input
            type="text"
            value={data.conditionValue || ''}
            onChange={(e) => updateNodeData(nodeId, { conditionValue: e.target.value })}
            placeholder={data.conditionType === 'regex' ? '[0-9]+' : '비교할 값 입력...'}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      {(data.conditionType === 'contains' || data.conditionType === 'equals') && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="caseSensitive"
            checked={data.caseSensitive || false}
            onChange={(e) => updateNodeData(nodeId, { caseSensitive: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="caseSensitive" className="text-sm text-gray-600">대소문자 구분</label>
        </div>
      )}

      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
        <p className="text-xs text-orange-700">
          💡 <strong>참(TRUE)</strong> 출력과 <strong>거짓(FALSE)</strong> 출력을 각각 다른 노드에 연결할 수 있어요
        </p>
      </div>
    </div>
  );
}
