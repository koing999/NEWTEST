'use client';

import { WebhookNodeData } from '@/types/workflow';

interface WebhookConfigProps {
  data: WebhookNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<WebhookNodeData>) => void;
}

export function WebhookConfig({ data, nodeId, updateNodeData }: WebhookConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">웹훅 타입</label>
        <select
          value={data.webhookType}
          onChange={(e) => updateNodeData(nodeId, { webhookType: e.target.value as WebhookNodeData['webhookType'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
        >
          <option value="slack">🔔 Slack</option>
          <option value="discord">🎮 Discord</option>
          <option value="custom">🔧 커스텀</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">웹훅 URL</label>
        <input
          type="url"
          value={data.webhookUrl}
          onChange={(e) => updateNodeData(nodeId, { webhookUrl: e.target.value })}
          placeholder={
            data.webhookType === 'slack' ? 'https://hooks.slack.com/services/...' :
            data.webhookType === 'discord' ? 'https://discord.com/api/webhooks/...' :
            'https://...'
          }
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메시지 템플릿</label>
        <textarea
          value={data.messageTemplate || ''}
          onChange={(e) => updateNodeData(nodeId, { messageTemplate: e.target.value })}
          placeholder="{{input}}을 사용하면 입력값이 삽입돼요"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-pink-500"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-500">
          <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code>으로 동적 값 삽입
        </p>
      </div>

      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
        <p className="text-xs text-pink-700">
          💡 워크플로우 결과를 Slack/Discord 채널에 자동으로 알려요
        </p>
      </div>
    </div>
  );
}
