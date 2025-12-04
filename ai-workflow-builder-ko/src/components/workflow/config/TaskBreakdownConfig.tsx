'use client';

import { TaskBreakdownNodeData } from '@/types/workflow';

interface TaskBreakdownConfigProps {
  data: TaskBreakdownNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<TaskBreakdownNodeData>) => void;
}

export function TaskBreakdownConfig({ data, nodeId, updateNodeData }: TaskBreakdownConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">분해 스타일</label>
        <select
          value={data.breakdownStyle}
          onChange={(e) => updateNodeData(nodeId, { breakdownStyle: e.target.value as TaskBreakdownNodeData['breakdownStyle'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="steps">단계별 (Steps)</option>
          <option value="checklist">체크리스트</option>
          <option value="mindmap">마인드맵</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">최대 단계 수</label>
        <input
          type="number"
          value={data.maxSteps || 5}
          onChange={(e) => updateNodeData(nodeId, { maxSteps: parseInt(e.target.value) || 5 })}
          min={1}
          max={20}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">옵션</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includePriority"
            checked={data.includePriority || false}
            onChange={(e) => updateNodeData(nodeId, { includePriority: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="includePriority" className="text-sm text-gray-600">우선순위 포함</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeTimeEstimate"
            checked={data.includeTimeEstimate || false}
            onChange={(e) => updateNodeData(nodeId, { includeTimeEstimate: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="includeTimeEstimate" className="text-sm text-gray-600">예상 시간 포함</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">커스텀 프롬프트 (선택)</label>
        <textarea
          value={data.customPrompt || ''}
          onChange={(e) => updateNodeData(nodeId, { customPrompt: e.target.value })}
          placeholder="추가 지시사항..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500"
          rows={2}
        />
      </div>

      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <p className="text-xs text-indigo-700">
          💡 AI가 복잡한 작업을 구조화된 단계로 분해해요
        </p>
      </div>
    </div>
  );
}
