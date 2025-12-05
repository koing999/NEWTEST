'use client';

/**
 * 외부 연동 노드 카테고리 콘텐츠 렌더러
 * 
 * 대상 노드: api, webhook, code
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo } from 'react';
import { 
  Globe, Send, Code, Webhook,
  Loader2, CheckCircle, XCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

interface ExternalNodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: string;
    error?: string;
    statusCode?: number;
    executionTime?: number;
  };
}

// ============================================
// API 프리셋 스타일
// ============================================

const API_PRESET_STYLES: Record<string, { label: string; color: string; bgColor: string }> = {
  custom: { label: '커스텀', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  dart: { label: 'DART', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'stock-kr': { label: '한국주식', color: 'text-red-700', bgColor: 'bg-red-100' },
  'stock-us': { label: '미국주식', color: 'text-green-700', bgColor: 'bg-green-100' },
  news: { label: '뉴스', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  weather: { label: '날씨', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
};

// ============================================
// HTTP Method 스타일
// ============================================

const HTTP_METHOD_STYLES: Record<string, { color: string; bgColor: string }> = {
  GET: { color: 'text-green-700', bgColor: 'bg-green-100' },
  POST: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  PUT: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  DELETE: { color: 'text-red-700', bgColor: 'bg-red-100' },
  PATCH: { color: 'text-purple-700', bgColor: 'bg-purple-100' },
};

// ============================================
// Webhook 타입 스타일
// ============================================

const WEBHOOK_STYLES: Record<string, { label: string; color: string; bgColor: string }> = {
  slack: { label: 'Slack', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  discord: { label: 'Discord', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  telegram: { label: 'Telegram', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  custom: { label: '커스텀', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

// ============================================
// 메인 렌더러
// ============================================

function ExternalNodeContent({ nodeType, data, nodeResult }: ExternalNodeContentProps) {
  switch (nodeType) {
    case 'api':
      return <APIContent data={data} nodeResult={nodeResult} />;
    case 'webhook':
      return <WebhookContent data={data} nodeResult={nodeResult} />;
    case 'code':
      return <CodeContent data={data} nodeResult={nodeResult} />;
    default:
      return <DefaultExternalContent />;
  }
}

// ============================================
// API 노드 콘텐츠
// ============================================

function APIContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const method = data.method || 'GET';
  const preset = data.preset || 'custom';
  const methodStyle = HTTP_METHOD_STYLES[method] || HTTP_METHOD_STYLES.GET;
  const presetStyle = API_PRESET_STYLES[preset] || API_PRESET_STYLES.custom;

  return (
    <div className="text-xs space-y-2">
      {/* Method & Preset */}
      <div className="flex items-center gap-2">
        <span className={cn(
          'px-2 py-0.5 rounded font-mono font-bold text-[10px]',
          methodStyle.bgColor, methodStyle.color
        )}>
          {method}
        </span>
        {preset !== 'custom' && (
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[10px]',
            presetStyle.bgColor, presetStyle.color
          )}>
            {presetStyle.label}
          </span>
        )}
      </div>

      {/* URL Preview */}
      {data.url && (
        <div className="flex items-center gap-1 text-gray-600 bg-white/60 rounded p-1.5">
          <Globe size={10} className="flex-shrink-0" />
          <span className="truncate text-[10px] font-mono">
            {data.url.length > 30 ? `${data.url.slice(0, 30)}...` : data.url}
          </span>
        </div>
      )}

      {/* Preset-specific Info */}
      {preset === 'dart' && data.corpCode && (
        <div className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          🏢 기업코드: {data.corpCode}
        </div>
      )}

      {(preset === 'stock-kr' || preset === 'stock-us') && data.stockCode && (
        <div className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
          📈 종목: {data.stockCode}
        </div>
      )}

      {/* Execution Status */}
      {nodeResult?.status === 'running' && (
        <div className="flex items-center gap-1 text-blue-500">
          <Loader2 size={12} className="animate-spin" />
          <span>API 호출 중...</span>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="p-1.5 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center gap-1 text-green-700">
            <CheckCircle size={10} />
            <span className="text-[10px]">
              {nodeResult.statusCode && `${nodeResult.statusCode} `}OK
            </span>
            {nodeResult.executionTime && (
              <span className="text-gray-500 ml-auto text-[9px]">
                {nodeResult.executionTime}ms
              </span>
            )}
          </div>
        </div>
      )}

      {nodeResult?.status === 'error' && (
        <div className="p-1.5 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-1 text-red-700">
            <XCircle size={10} />
            <span className="text-[10px] truncate">
              {nodeResult.error?.slice(0, 30) || 'API 오류'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Webhook 노드 콘텐츠
// ============================================

function WebhookContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const webhookType = data.webhookType || 'custom';
  const style = WEBHOOK_STYLES[webhookType] || WEBHOOK_STYLES.custom;

  return (
    <div className="text-xs space-y-2">
      {/* Webhook Type */}
      <div className="flex items-center gap-2">
        <Webhook size={12} className="text-gray-500" />
        <span className={cn(
          'px-2 py-0.5 rounded text-[10px]',
          style.bgColor, style.color
        )}>
          {style.label}
        </span>
      </div>

      {/* URL Preview */}
      {data.webhookUrl && (
        <div className="text-gray-600 bg-white/60 rounded p-1.5 truncate text-[10px] font-mono">
          🔗 {data.webhookUrl.slice(0, 28)}...
        </div>
      )}

      {/* Message Template Preview */}
      {data.messageTemplate && (
        <div className="text-gray-500 bg-white/50 rounded p-1 text-[10px] truncate">
          📝 {data.messageTemplate.slice(0, 30)}...
        </div>
      )}

      {/* Execution Status */}
      {nodeResult?.status === 'running' && (
        <div className="flex items-center gap-1 text-blue-500 text-[10px]">
          <Send size={10} className="animate-bounce" />
          <span>전송 중...</span>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="flex items-center gap-1 text-green-600 text-[10px] bg-green-50 px-1.5 py-0.5 rounded">
          <CheckCircle size={10} />
          <span>전송 완료</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Code 노드 콘텐츠
// ============================================

function CodeContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const code = data.code || '';
  const lineCount = code.split('\n').length;

  return (
    <div className="text-xs space-y-2">
      {/* Code Info */}
      <div className="flex items-center gap-2">
        <Code size={12} className="text-gray-500" />
        <span className="text-gray-600">
          JavaScript
        </span>
        <span className="text-[10px] text-gray-400 ml-auto">
          {lineCount}줄
        </span>
      </div>

      {/* Code Preview */}
      {code && (
        <div className="bg-gray-900 text-green-400 rounded p-1.5 font-mono text-[9px] overflow-hidden">
          <pre className="truncate">
            {code.split('\n').slice(0, 3).map((line: string, i: number) => (
              <div key={i} className="truncate">
                <span className="text-gray-600 select-none">{i + 1} </span>
                {line.slice(0, 35)}{line.length > 35 ? '...' : ''}
              </div>
            ))}
            {lineCount > 3 && (
              <div className="text-gray-500">... +{lineCount - 3}줄 더</div>
            )}
          </pre>
        </div>
      )}

      {!code && (
        <div className="text-gray-400 text-[10px] bg-gray-100 rounded p-1.5 text-center">
          코드를 입력하세요
        </div>
      )}

      {/* Execution Status */}
      {nodeResult?.status === 'running' && (
        <div className="flex items-center gap-1 text-blue-500 text-[10px]">
          <Loader2 size={10} className="animate-spin" />
          <span>실행 중...</span>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="flex items-center gap-1 text-green-600 text-[10px] bg-green-50 px-1.5 py-0.5 rounded">
          <ArrowRight size={10} />
          <span className="truncate">{String(nodeResult.output).slice(0, 25)}</span>
        </div>
      )}

      {nodeResult?.status === 'error' && (
        <div className="flex items-center gap-1 text-red-600 text-[10px] bg-red-50 px-1.5 py-0.5 rounded">
          <XCircle size={10} />
          <span className="truncate">{nodeResult.error?.slice(0, 25)}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// 기본 콘텐츠
// ============================================

function DefaultExternalContent() {
  return (
    <div className="text-xs text-gray-500">
      <Globe size={12} className="inline mr-1" />
      외부 연동 설정 필요
    </div>
  );
}

export default memo(ExternalNodeContent);
export { ExternalNodeContent };
