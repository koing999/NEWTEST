'use client';

/**
 * AI 노드 카테고리 콘텐츠 렌더러
 * 
 * 대상 노드: llm, airouter, taskbreakdown, smartanalysis, intentparser, multiagent
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo } from 'react';
import { 
  Bot, Sparkles, Zap, Brain, GitBranch, Users,
  Loader2, DollarSign, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

interface AINodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: string;
    error?: string;
    cost?: number;
    tokens?: { input?: number; output?: number };
    executionTime?: number;
  };
}

// ============================================
// LLM Provider 스타일
// ============================================

const LLM_PROVIDER_STYLES: Record<string, { color: string; bgColor: string }> = {
  openai: { color: 'text-green-700', bgColor: 'bg-green-100' },
  anthropic: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  gemini: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  groq: { color: 'text-purple-700', bgColor: 'bg-purple-100' },
  deepseek: { color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  xai: { color: 'text-gray-700', bgColor: 'bg-gray-100' },
  perplexity: { color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  mistral: { color: 'text-red-700', bgColor: 'bg-red-100' },
};

// ============================================
// Agent 정의 (Multi-Agent용)
// ============================================

const AGENT_INFO: Record<string, { name: string; emoji: string }> = {
  jogwajang: { name: '조과장', emoji: '🧑‍💼' },
  accountant: { name: '회계사', emoji: '📊' },
  ib: { name: 'IB 전문가', emoji: '💼' },
  mckinsey: { name: '맥킨지', emoji: '📈' },
  planner: { name: '기획자', emoji: '📋' },
};

// ============================================
// 메인 렌더러
// ============================================

function AINodeContent({ nodeType, data, nodeResult }: AINodeContentProps) {
  switch (nodeType) {
    case 'llm':
      return <LLMContent data={data} nodeResult={nodeResult} />;
    case 'airouter':
      return <AIRouterContent data={data} nodeResult={nodeResult} />;
    case 'taskbreakdown':
      return <TaskBreakdownContent data={data} nodeResult={nodeResult} />;
    case 'smartanalysis':
      return <SmartAnalysisContent data={data} nodeResult={nodeResult} />;
    case 'intentparser':
      return <IntentParserContent data={data} nodeResult={nodeResult} />;
    case 'multiagent':
      return <MultiAgentContent data={data} nodeResult={nodeResult} />;
    default:
      return <DefaultAIContent data={data} />;
  }
}

// ============================================
// LLM 노드 콘텐츠
// ============================================

function LLMContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const provider = data.provider || 'groq';
  const model = data.model || 'llama3-8b-8192';
  const providerStyle = LLM_PROVIDER_STYLES[provider] || LLM_PROVIDER_STYLES.openai;

  return (
    <div className="text-xs space-y-2">
      {/* Provider & Model */}
      <div className="flex items-center gap-2">
        <span className={cn(
          'px-2 py-0.5 rounded font-medium',
          providerStyle.bgColor, providerStyle.color
        )}>
          {provider.toUpperCase()}
        </span>
        <span className="text-gray-500 truncate text-[10px]">{model}</span>
      </div>

      {/* Prompt Preview */}
      {data.userPrompt && (
        <div className="text-gray-600 bg-white/60 rounded p-1.5 truncate">
          💬 {data.userPrompt.slice(0, 35)}
          {data.userPrompt.length > 35 && '...'}
        </div>
      )}

      {/* Execution Info */}
      {nodeResult?.status === 'success' && (
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          {nodeResult.cost && (
            <span className="flex items-center gap-0.5">
              <DollarSign size={10} />
              ${nodeResult.cost.toFixed(4)}
            </span>
          )}
          {nodeResult.tokens && (
            <span>{nodeResult.tokens.input + nodeResult.tokens.output} tokens</span>
          )}
        </div>
      )}

      {/* Running State */}
      {nodeResult?.status === 'running' && (
        <div className="flex items-center gap-1 text-blue-500">
          <Loader2 size={12} className="animate-spin" />
          <span>AI 처리 중...</span>
        </div>
      )}

      {/* Result Preview */}
      {nodeResult?.status === 'success' && nodeResult.output && (
        <div className="p-1.5 bg-green-50 border border-green-200 rounded text-green-800 truncate">
          {nodeResult.output.slice(0, 40)}...
        </div>
      )}
    </div>
  );
}

// ============================================
// AI Router 노드 콘텐츠
// ============================================

function AIRouterContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-1 text-purple-600">
        <GitBranch size={12} />
        <span>AI 라우팅</span>
      </div>

      {data.instruction && (
        <div className="text-gray-500 bg-white/60 rounded p-1 truncate text-[10px]">
          {data.instruction.slice(0, 40)}...
        </div>
      )}

      {/* 라우팅 결과 */}
      {nodeResult?.status === 'success' && (
        <div className={cn(
          'p-1 rounded text-center font-bold text-[10px]',
          nodeResult.output === 'true' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        )}>
          → {nodeResult.output === 'true' ? 'TRUE 경로' : 'FALSE 경로'}
        </div>
      )}
    </div>
  );
}

// ============================================
// Task Breakdown 노드 콘텐츠
// ============================================

function TaskBreakdownContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-1 text-amber-600">
        <Zap size={12} />
        <span>작업 분해</span>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
          {data.breakdownStyle || 'steps'}
        </span>
        <span className="text-gray-500">
          최대 {data.maxSteps || 5}단계
        </span>
      </div>

      {nodeResult?.status === 'success' && nodeResult.output && (
        <div className="p-1 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[10px]">
          ✓ {typeof nodeResult.output === 'object' 
            ? `${Object.keys(nodeResult.output).length}개 단계 생성`
            : '분해 완료'}
        </div>
      )}
    </div>
  );
}

// ============================================
// Smart Analysis 노드 콘텐츠
// ============================================

function SmartAnalysisContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-1 text-violet-600">
        <Brain size={12} />
        <span>스마트 분석</span>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        {data.autoDetect && (
          <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
            자동 감지
          </span>
        )}
        {data.aiPersona && (
          <span className="text-gray-500">
            {AGENT_INFO[data.aiPersona]?.emoji} {AGENT_INFO[data.aiPersona]?.name}
          </span>
        )}
      </div>

      {nodeResult?.status === 'success' && (
        <div className="p-1 bg-violet-50 border border-violet-200 rounded text-violet-800 text-[10px]">
          ✓ 분석 완료
        </div>
      )}
    </div>
  );
}

// ============================================
// Intent Parser 노드 콘텐츠
// ============================================

function IntentParserContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-1 text-indigo-600">
        <Sparkles size={12} />
        <span>의도 파싱</span>
      </div>

      <div className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] inline-block">
        {data.mode || 'auto'} 모드
      </div>

      {nodeResult?.status === 'success' && nodeResult.output && (
        <div className="p-1 bg-indigo-50 border border-indigo-200 rounded text-[10px]">
          <div className="text-indigo-600 font-medium">감지된 의도:</div>
          <div className="text-indigo-800 truncate">
            {typeof nodeResult.output === 'object' 
              ? nodeResult.output.intent || JSON.stringify(nodeResult.output).slice(0, 30)
              : nodeResult.output.slice(0, 30)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Multi-Agent 노드 콘텐츠
// ============================================

function MultiAgentContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const selectedAgents = data.agents || [];

  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-1 text-fuchsia-600">
        <Users size={12} />
        <span>멀티 에이전트</span>
      </div>

      {/* 선택된 에이전트 */}
      <div className="flex flex-wrap gap-1">
        {selectedAgents.length > 0 ? (
          selectedAgents.slice(0, 3).map((agentId: string) => {
            const agent = AGENT_INFO[agentId];
            return (
              <span
                key={agentId}
                className="px-1 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded text-[10px]"
              >
                {agent?.emoji} {agent?.name || agentId}
              </span>
            );
          })
        ) : (
          <span className="text-gray-400 text-[10px]">에이전트 선택 필요</span>
        )}
        {selectedAgents.length > 3 && (
          <span className="text-gray-500 text-[10px]">+{selectedAgents.length - 3}</span>
        )}
      </div>

      {/* 분석 모드 */}
      <div className="text-[10px] text-gray-500">
        {data.analysisMode === 'parallel' ? '⚡ 병렬 분석' : '📋 순차 분석'}
      </div>

      {/* 실행 상태 */}
      {nodeResult?.status === 'running' && (
        <div className="flex items-center gap-1 text-blue-500 text-[10px]">
          <Loader2 size={10} className="animate-spin" />
          <span>에이전트 협업 중...</span>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="p-1 bg-fuchsia-50 border border-fuchsia-200 rounded text-fuchsia-800 text-[10px]">
          ✓ {selectedAgents.length}개 에이전트 분석 완료
        </div>
      )}
    </div>
  );
}

// ============================================
// 기본 AI 콘텐츠
// ============================================

function DefaultAIContent({ data }: { data: any }) {
  return (
    <div className="text-xs text-gray-500">
      <Bot size={12} className="inline mr-1" />
      AI 노드 설정 필요
    </div>
  );
}

export default memo(AINodeContent);
export { AINodeContent };
