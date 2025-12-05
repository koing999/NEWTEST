'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bell, MessageSquare, Send, LucideIcon } from 'lucide-react';
import { WebhookNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

const webhookIcons: Record<string, LucideIcon> = {
  'slack': MessageSquare,
  'discord': MessageSquare,
  'custom': Send,
};

const webhookColors: Record<string, string> = {
  'slack': 'from-purple-500 to-pink-500',
  'discord': 'from-indigo-500 to-purple-500',
  'custom': 'from-gray-500 to-slate-500',
};

const webhookLabels: Record<string, string> = {
  'slack': 'Slack',
  'discord': 'Discord',
  'custom': '커스텀',
};

function WebhookNode({ id, data, selected }: NodeProps<WebhookNodeData>) {
  const { nodeResults, setSelectedNode } = useWorkflowStore();
  const result = nodeResults[id];
  
  const isRunning = result?.status === 'running';
  const isSuccess = result?.status === 'success';
  const isError = result?.status === 'error';

  const type = data.webhookType || 'custom';
  const Icon = webhookIcons[type] || Bell;
  const colorClass = webhookColors[type] || webhookColors['custom'];

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        min-w-[200px] rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-pink-500 shadow-pink-200' : 'border-gray-200'}
        ${isRunning ? 'border-yellow-400 animate-pulse' : ''}
        ${isSuccess ? 'border-green-400' : ''}
        ${isError ? 'border-red-400' : ''}
        bg-white
      `}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-pink-400 border-2 border-white"
      />

      {/* 헤더 */}
      <div className={`px-3 py-2 bg-gradient-to-r ${colorClass} rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-white" />
          <span className="text-white font-medium text-sm">{data.label}</span>
        </div>
      </div>

      {/* 바디 */}
      <div className="p-3 space-y-2">
        {/* 타입 뱃지 */}
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-0.5 rounded text-xs font-medium text-white
            bg-gradient-to-r ${colorClass}
          `}>
            <Icon size={10} className="inline mr-1" />
            {webhookLabels[type]}
          </span>
        </div>

        {/* 메시지 미리보기 */}
        {data.messageTemplate && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
            {data.messageTemplate.length > 50 
              ? data.messageTemplate.slice(0, 50) + '...' 
              : data.messageTemplate}
          </div>
        )}

        {/* 실행 중 */}
        {isRunning && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <Send size={12} className="text-yellow-600 animate-pulse" />
            <span className="text-xs text-yellow-700">알림 보내는 중...</span>
          </div>
        )}

        {/* 성공 */}
        {isSuccess && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Bell size={12} className="text-green-600" />
            <span className="text-xs text-green-700">알림 전송 완료! 🔔</span>
          </div>
        )}

        {/* 에러 */}
        {isError && result?.error && (
          <div className="p-2 bg-red-50 rounded text-xs text-red-600 border border-red-200">
            {result.error}
          </div>
        )}
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-pink-400 border-2 border-white"
      />
    </div>
  );
}

export default memo(WebhookNode);
