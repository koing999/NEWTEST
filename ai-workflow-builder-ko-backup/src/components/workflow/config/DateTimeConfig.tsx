'use client';

import { DateTimeNodeData } from '@/types/workflow';

interface DateTimeConfigProps {
  data: DateTimeNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<DateTimeNodeData>) => void;
}

export function DateTimeConfig({ data, nodeId, updateNodeData }: DateTimeConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">출력 형식</label>
        <select
          value={data.format}
          onChange={(e) => updateNodeData(nodeId, { format: e.target.value as DateTimeNodeData['format'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
        >
          <option value="iso">ISO 8601 (2024-01-15T10:30:00)</option>
          <option value="date">날짜만 (2024-01-15)</option>
          <option value="time">시간만 (10:30:00)</option>
          <option value="korean">한국식 (2024년 1월 15일)</option>
          <option value="relative">상대시간 (3시간 전)</option>
          <option value="unix">Unix 타임스탬프</option>
          <option value="custom">커스텀</option>
        </select>
      </div>

      {data.format === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">커스텀 형식</label>
          <input
            type="text"
            value={data.customFormat || ''}
            onChange={(e) => updateNodeData(nodeId, { customFormat: e.target.value })}
            placeholder="YYYY-MM-DD HH:mm:ss"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-violet-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            YYYY(년), MM(월), DD(일), HH(시), mm(분), ss(초)
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">타임존</label>
        <select
          value={data.timezone || 'Asia/Seoul'}
          onChange={(e) => updateNodeData(nodeId, { timezone: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
        >
          <option value="Asia/Seoul">한국 (KST)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">미국 동부</option>
          <option value="Europe/London">런던</option>
          <option value="Asia/Tokyo">도쿄</option>
        </select>
      </div>

      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
        <p className="text-xs text-violet-700">
          💡 현재 날짜/시간을 다양한 형식으로 출력해요
        </p>
      </div>
    </div>
  );
}
