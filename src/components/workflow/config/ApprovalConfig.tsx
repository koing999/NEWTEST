'use client';

import { ApprovalNodeData } from '@/types/workflow';
import { MessageCircle, ExternalLink } from 'lucide-react';

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

      {/* Telegram 연동 섹션 */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={16} className="text-blue-500" />
          <span className="font-medium text-sm text-gray-700">Telegram 연동</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="useTelegram"
            checked={data.useTelegram || false}
            onChange={(e) => updateNodeData(nodeId, { useTelegram: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="useTelegram" className="text-sm text-gray-600">
            Telegram으로 승인 요청 보내기
          </label>
        </div>

        {data.useTelegram && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-200">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bot Token</label>
              <input
                type="password"
                value={data.telegramBotToken || ''}
                onChange={(e) => updateNodeData(nodeId, { telegramBotToken: e.target.value })}
                placeholder="123456789:ABCdefGHI..."
                className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chat ID</label>
              <input
                type="text"
                value={data.telegramChatId || ''}
                onChange={(e) => updateNodeData(nodeId, { telegramChatId: e.target.value })}
                placeholder="-100123456789 또는 개인 ID"
                className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
              />
            </div>
            
            <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
              <p className="font-medium mb-1">🔧 설정 방법:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  <a 
                    href="https://t.me/BotFather" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    @BotFather에서 봇 생성 <ExternalLink size={10} />
                  </a>
                </li>
                <li>Bot Token 복사하여 입력</li>
                <li>봇에게 /start 메시지 전송</li>
                <li>
                  <a
                    href="https://api.telegram.org/bot{TOKEN}/getUpdates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    Chat ID 확인 <ExternalLink size={10} />
                  </a>
                </li>
              </ol>
            </div>
          </div>
        )}
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
          {data.useTelegram ? (
            <>
              📱 <strong>Telegram 모드:</strong> 실행 시 Telegram으로 승인 요청이 전송됩니다.
              버튼 클릭으로 승인/거부할 수 있습니다.
            </>
          ) : (
            <>
              💡 <strong>기본 모드:</strong> UI에서 수동으로 승인 상태를 변경해야 합니다.
              Telegram 연동을 사용하면 실시간 승인이 가능합니다!
            </>
          )}
        </p>
      </div>
    </div>
  );
}
