'use client';

/**
 * 제어 흐름 노드 카테고리 콘텐츠 렌더러
 * 
 * 대상 노드: condition, loop, parallel, delay, approval
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo } from 'react';
import { 
  GitBranch, Repeat, Zap, Clock, UserCheck,
  Check, X, Loader2, Play, Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

interface ControlNodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: string | boolean;
    error?: string;
    currentIteration?: number;
    totalIterations?: number;
    approved?: boolean;
  };
}

// ============================================
// 조건 타입 레이블
// ============================================

const CONDITION_TYPE_LABELS: Record<string, string> = {
  contains: '포함',
  equals: '같음',
  greater: '초과',
  less: '미만',
  regex: '정규식',
  empty: '비어있음',
  'not-empty': '비어있지 않음',
};

// ============================================
// 반복 타입 레이블
// ============================================

const LOOP_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  count: { label: '횟수', icon: '🔢' },
  foreach: { label: '리스트', icon: '📋' },
  while: { label: '조건', icon: '🔄' },
};

// ============================================
// 메인 렌더러
// ============================================

function ControlNodeContent({ nodeType, data, nodeResult }: ControlNodeContentProps) {
  switch (nodeType) {
    case 'condition':
      return <ConditionContent data={data} nodeResult={nodeResult} />;
    case 'loop':
      return <LoopContent data={data} nodeResult={nodeResult} />;
    case 'parallel':
      return <ParallelContent data={data} nodeResult={nodeResult} />;
    case 'delay':
      return <DelayContent data={data} nodeResult={nodeResult} />;
    case 'approval':
      return <ApprovalContent data={data} nodeResult={nodeResult} />;
    default:
      return <DefaultControlContent />;
  }
}

// ============================================
// Condition 노드 콘텐츠
// ============================================

function ConditionContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const conditionType = data.conditionType || 'equals';
  const conditionValue = data.conditionValue || '';
  const result = nodeResult?.output;

  return (
    <div className="text-xs space-y-2">
      {/* 조건 타입 */}
      <div className="flex items-center gap-2">
        <GitBranch size={12} className="text-orange-500" />
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
          {CONDITION_TYPE_LABELS[conditionType] || conditionType}
        </span>
      </div>

      {/* 비교 값 */}
      {conditionValue && !['empty', 'not-empty'].includes(conditionType) && (
        <div className="text-gray-600 bg-white/60 rounded p-1.5 font-mono text-[10px] truncate">
          "{conditionValue}"
        </div>
      )}

      {/* 대소문자 구분 */}
      {data.caseSensitive && (
        <div className="text-[9px] text-gray-500">
          Aa 대소문자 구분
        </div>
      )}

      {/* 결과 표시 */}
      {result !== undefined && (
        <div className={cn(
          'p-2 rounded text-center font-bold transition-all',
          result === true || result === 'true'
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        )}>
          <div className="flex items-center justify-center gap-1">
            {result === true || result === 'true' ? (
              <>
                <Check size={14} className="text-green-600" />
                <span>TRUE</span>
              </>
            ) : (
              <>
                <X size={14} className="text-red-600" />
                <span>FALSE</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Loop 노드 콘텐츠
// ============================================

function LoopContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const loopType = data.loopType || 'count';
  const maxIterations = data.maxIterations || 10;
  const currentIteration = nodeResult?.currentIteration || 0;
  const loopInfo = LOOP_TYPE_LABELS[loopType] || LOOP_TYPE_LABELS.count;

  return (
    <div className="text-xs space-y-2">
      {/* 반복 타입 */}
      <div className="flex items-center gap-2">
        <Repeat size={12} className="text-orange-500" />
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px]">
          {loopInfo.icon} {loopInfo.label}
        </span>
      </div>

      {/* 반복 설정 */}
      <div className="flex items-center justify-between text-[10px] text-gray-600">
        <span>최대 반복:</span>
        <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded">
          {maxIterations}회
        </span>
      </div>

      {/* 구분자 (foreach용) */}
      {loopType === 'foreach' && data.delimiter && (
        <div className="text-[10px] text-gray-500">
          구분자: <code className="bg-gray-100 px-1 rounded">{data.delimiter}</code>
        </div>
      )}

      {/* 실행 상태 */}
      {nodeResult?.status === 'running' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-blue-500" />
            <span className="text-blue-700 text-[10px]">
              {currentIteration}/{maxIterations} 반복 중...
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentIteration / maxIterations) * 100}%` }}
            />
          </div>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded p-1.5 text-center">
          <span className="text-green-700 text-[10px] font-medium">
            ✓ {nodeResult.totalIterations || currentIteration}회 완료
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Parallel 노드 콘텐츠
// ============================================

function ParallelContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const branches = data.branches || 2;
  const mergeStrategy = data.mergeStrategy || 'all';

  const strategyLabels: Record<string, string> = {
    all: '모두 완료',
    first: '첫 번째',
    any: '아무거나',
  };

  return (
    <div className="text-xs space-y-2">
      {/* 병렬 분기 */}
      <div className="flex items-center gap-2">
        <Zap size={12} className="text-orange-500" />
        <span className="text-gray-700">
          {branches}개 병렬 분기
        </span>
      </div>

      {/* 분기 시각화 */}
      <div className="flex justify-center gap-1">
        {Array.from({ length: branches }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold',
              nodeResult?.status === 'running'
                ? 'bg-blue-100 text-blue-600 animate-pulse'
                : nodeResult?.status === 'success'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-500'
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* 병합 전략 */}
      <div className="text-[10px] text-gray-500 text-center">
        병합: {strategyLabels[mergeStrategy]}
      </div>

      {/* 상태 */}
      {nodeResult?.status === 'running' && (
        <div className="flex items-center justify-center gap-1 text-blue-500 text-[10px]">
          <Loader2 size={10} className="animate-spin" />
          <span>병렬 실행 중...</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Delay 노드 콘텐츠
// ============================================

function DelayContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const delayMs = data.delayMs || 1000;
  const displayTime = delayMs >= 1000 
    ? `${(delayMs / 1000).toFixed(1)}초` 
    : `${delayMs}ms`;

  return (
    <div className="text-xs space-y-2">
      {/* 대기 시간 */}
      <div className="flex items-center justify-center gap-2">
        <Clock size={14} className="text-orange-500" />
        <span className="text-lg font-bold text-gray-700">
          {displayTime}
        </span>
      </div>

      {/* 대기 이유 */}
      {data.reason && (
        <div className="text-[10px] text-gray-500 bg-white/60 rounded p-1.5 text-center">
          💬 {data.reason}
        </div>
      )}

      {/* 실행 상태 */}
      {nodeResult?.status === 'running' && (
        <div className="relative pt-1">
          <div className="flex items-center justify-center gap-1 text-blue-500 text-[10px] mb-1">
            <Pause size={10} />
            <span>대기 중...</span>
          </div>
          <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '50%' }} />
          </div>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="flex items-center justify-center gap-1 text-green-600 text-[10px]">
          <Play size={10} />
          <span>대기 완료</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Approval 노드 콘텐츠
// ============================================

function ApprovalContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const message = data.message || '승인이 필요합니다';
  const approveLabel = data.approveLabel || '승인';
  const rejectLabel = data.rejectLabel || '거절';

  return (
    <div className="text-xs space-y-2">
      {/* 아이콘 & 타이틀 */}
      <div className="flex items-center gap-2">
        <UserCheck size={12} className="text-orange-500" />
        <span className="text-gray-700 font-medium">승인 대기</span>
      </div>

      {/* 메시지 */}
      <div className="text-[10px] text-gray-600 bg-white/60 rounded p-1.5">
        📝 {message.slice(0, 50)}{message.length > 50 ? '...' : ''}
      </div>

      {/* 버튼 미리보기 (대기 중일 때) */}
      {nodeResult?.status === 'running' && (
        <div className="flex gap-1 justify-center">
          <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] hover:bg-green-200">
            {approveLabel}
          </button>
          <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] hover:bg-red-200">
            {rejectLabel}
          </button>
        </div>
      )}

      {/* 승인 결과 */}
      {nodeResult?.status === 'success' && (
        <div className={cn(
          'p-2 rounded text-center font-bold',
          nodeResult.approved
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        )}>
          {nodeResult.approved ? (
            <div className="flex items-center justify-center gap-1">
              <Check size={14} />
              <span>승인됨</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <X size={14} />
              <span>거절됨</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 기본 콘텐츠
// ============================================

function DefaultControlContent() {
  return (
    <div className="text-xs text-gray-500">
      <GitBranch size={12} className="inline mr-1" />
      제어 노드 설정 필요
    </div>
  );
}

export default memo(ControlNodeContent);
export { ControlNodeContent };
