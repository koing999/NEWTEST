'use client';

import { ApprovalNodeData } from '@/types/workflow';

interface ApprovalConfigProps {
  data: ApprovalNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<ApprovalNodeData>) => void;
}

export function ApprovalConfig({ data, nodeId, updateNodeData }: ApprovalConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">승인 요청 메시지</label>
        <textarea
          value={data.message || ''}
          onChange={(e) => updateNodeData(nodeId, { message: e.target.value })}
          placeholder="사용자에게 보여줄 승인 요청 메시지..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showInput"
          checked={data.showInput || false}
          onChange={(e) => updateNodeData(nodeId, { showInput: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="showInput" className="text-sm text-gray-600">사용자 입력 받기</label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">승인 버튼</label>
          <input
            type="text"
            value={data.approveLabel || '승인'}
            onChange={(e) => updateNodeData(nodeId, { approveLabel: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">거절 버튼</label>
          <input
            type="text"
            value={data.rejectLabel || '거절'}
            onChange={(e) => updateNodeData(nodeId, { rejectLabel: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">타임아웃 (초)</label>
        <input
          type="number"
          value={(data.timeout || 60000) / 1000}
          onChange={(e) => updateNodeData(nodeId, { timeout: (parseInt(e.target.value) || 60) * 1000 })}
          min={1}
          max={86400}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-700">
          💡 <strong>승인</strong> 출력과 <strong>거절</strong> 출력을 각각 다른 노드에 연결하세요<br/>
          현재는 자동 승인 모드로 동작합니다.
        </p>
      </div>
    </div>
  );
}
