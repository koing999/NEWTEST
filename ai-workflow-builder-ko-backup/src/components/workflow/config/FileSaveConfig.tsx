'use client';

import { FileSaveNodeData } from '@/types/workflow';

interface FileSaveConfigProps {
  data: FileSaveNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<FileSaveNodeData>) => void;
}

export function FileSaveConfig({ data, nodeId, updateNodeData }: FileSaveConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">파일명</label>
        <input
          type="text"
          value={data.filename}
          onChange={(e) => updateNodeData(nodeId, { filename: e.target.value })}
          placeholder="result.txt"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">파일 형식</label>
        <select
          value={data.fileType}
          onChange={(e) => updateNodeData(nodeId, { fileType: e.target.value as FileSaveNodeData['fileType'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500"
        >
          <option value="text">텍스트 (.txt)</option>
          <option value="json">JSON (.json)</option>
          <option value="csv">CSV (.csv)</option>
          <option value="markdown">마크다운 (.md)</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="appendDate"
          checked={data.appendDate || false}
          onChange={(e) => updateNodeData(nodeId, { appendDate: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="appendDate" className="text-sm text-gray-600">파일명에 날짜 추가</label>
      </div>

      <div className="p-3 bg-lime-50 rounded-lg border border-lime-200">
        <p className="text-xs text-lime-700">
          💡 워크플로우 결과를 파일로 다운로드할 수 있어요
        </p>
      </div>
    </div>
  );
}
