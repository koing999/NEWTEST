'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { UserCheck, ThumbsUp, ThumbsDown, Clock, MessageSquare } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { ApprovalNodeData } from '@/types/workflow';

function ApprovalNode({ id, data, selected }: NodeProps<ApprovalNodeData>) {
  const { setSelectedNode, nodeResults, updateNodeData } = useWorkflowStore();
  const result = nodeResults[id];
  const [userInput, setUserInput] = useState('');

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-amber-400 shadow-lg shadow-amber-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  const isWaiting = result?.status === 'running';

  // 승인/거절 처리 (실제로는 서버와 연동 필요)
  const handleApprove = () => {
    updateNodeData(id, { result: 'approved', userInput });
  };

  const handleReject = () => {
    updateNodeData(id, { result: 'rejected', userInput });
  };

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-amber-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[280px] max-w-[350px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <UserCheck size={18} />
        <span className="font-medium">{data.label || '승인 대기'}</span>
        {isWaiting && (
          <div className="ml-auto animate-bounce">
            <Clock size={14} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* 메시지 */}
        <div className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg mb-3">
          {data.message || '계속 진행하시겠습니까?'}
        </div>

        {/* 대기 중일 때 버튼 표시 */}
        {isWaiting && (
          <>
            {/* 사용자 입력 (옵션) */}
            {data.showInput && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MessageSquare size={12} />
                  피드백 (선택)
                </div>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="의견이나 수정사항을 입력하세요..."
                  className="w-full p-2 text-xs border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={2}
                />
              </div>
            )}

            {/* 승인/거절 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleApprove(); }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ThumbsUp size={14} />
                {data.approveLabel || '승인'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReject(); }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ThumbsDown size={14} />
                {data.rejectLabel || '거절'}
              </button>
            </div>
          </>
        )}

        {/* 대기 전 안내 */}
        {!result?.status && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">✋ Human-in-the-Loop</div>
            <div>워크플로우 실행 중 사람의 승인을 기다려요</div>
          </div>
        )}

        {/* 결과: 승인됨 */}
        {data.result === 'approved' && (
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <ThumbsUp size={14} />
              승인됨
            </div>
            {data.userInput && (
              <div className="mt-1 text-xs text-green-600">
                💬 "{data.userInput}"
              </div>
            )}
          </div>
        )}

        {/* 결과: 거절됨 */}
        {data.result === 'rejected' && (
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
              <ThumbsDown size={14} />
              거절됨
            </div>
            {data.userInput && (
              <div className="mt-1 text-xs text-red-600">
                💬 "{data.userInput}"
              </div>
            )}
          </div>
        )}

        {/* 타임아웃 표시 */}
        {data.timeout && isWaiting && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            ⏱️ {Math.round(data.timeout / 1000)}초 후 자동 타임아웃
          </div>
        )}
      </div>

      {/* Handles - 입력 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      {/* Handles - 승인 출력 */}
      <Handle
        type="source"
        position={Position.Right}
        id="approved"
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-white"
        style={{ top: '35%' }}
      />
      
      {/* Handles - 거절 출력 */}
      <Handle
        type="source"
        position={Position.Right}
        id="rejected"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
        style={{ top: '65%' }}
      />
    </div>
  );
}

export default memo(ApprovalNode);
