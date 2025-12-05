'use client';

/**
 * 통합 노드 컴포넌트 (Unified Node Component)
 * 
 * n8n/Activepieces 패턴 적용:
 * - 모든 노드 타입을 단일 컴포넌트로 렌더링
 * - 노드 타입에 따라 카테고리별 렌더러 자동 선택
 * - 공통 기능(Handle, 상태표시, 선택)을 통합
 * 
 * 기존 32개 개별 노드 → 1 UnifiedNode + 6 CategoryRenderers 구조
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Loader2, CheckCircle, XCircle,
  // 카테고리별 아이콘
  Bot, Sparkles, Brain, Users,    // AI
  Globe, Code, Webhook,           // 외부 연동
  GitBranch, Repeat, Zap, Clock, UserCheck, // 제어
  RefreshCw, FileText, Calculator, Database, Filter, // 데이터
  TrendingUp, LineChart, Table, ArrowLeftRight,      // 금융
  FileInput, FileOutput, Save, StickyNote,           // 입출력
} from 'lucide-react';
import { WorkflowNodeData, NodeType } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { cn } from '@/lib/utils';

// 카테고리별 콘텐츠 렌더러 임포트
import { CategoryContent } from '../nodes/getCategoryRenderer';

// ============================================
// 노드 카테고리 정의
// ============================================

export type NodeCategory = 'ai' | 'external' | 'control' | 'data' | 'finance' | 'io' | 'other';

export const NODE_CATEGORIES: Record<NodeType, NodeCategory> = {
  // AI 노드
  'llm': 'ai',
  'airouter': 'ai',
  'taskbreakdown': 'ai',
  'smartanalysis': 'ai',
  'intentparser': 'ai',
  'multiagent': 'ai',
  
  // 외부 연동
  'api': 'external',
  'webhook': 'external',
  'code': 'external',
  
  // 제어 흐름
  'condition': 'control',
  'loop': 'control',
  'parallel': 'control',
  'delay': 'control',
  'approval': 'control',
  
  // 데이터 처리
  'transform': 'data',
  'template': 'data',
  'random': 'data',
  'slice': 'data',
  'datetime': 'data',
  'htmlclean': 'data',
  'math': 'data',
  'formula': 'data',
  'multifilter': 'data',
  'state': 'data',
  
  // 금융 특화
  'stockalert': 'finance',
  'compareinput': 'finance',
  'tableoutput': 'finance',
  'chart': 'finance',
  
  // 입출력
  'input': 'io',
  'output': 'io',
  'filesave': 'io',
  
  // 기타
  'note': 'other',
};

// ============================================
// 카테고리별 스타일
// ============================================

export const CATEGORY_STYLES: Record<NodeCategory, {
  gradient: string;
  border: string;
  icon: React.ElementType;
  iconBg: string;
  label: string;
}> = {
  ai: {
    gradient: 'from-violet-50 to-purple-100',
    border: 'border-violet-300',
    icon: Bot,
    iconBg: 'bg-violet-500',
    label: 'AI',
  },
  external: {
    gradient: 'from-slate-50 to-gray-100',
    border: 'border-slate-300',
    icon: Globe,
    iconBg: 'bg-slate-600',
    label: '연동',
  },
  control: {
    gradient: 'from-orange-50 to-amber-100',
    border: 'border-orange-300',
    icon: GitBranch,
    iconBg: 'bg-orange-500',
    label: '제어',
  },
  data: {
    gradient: 'from-cyan-50 to-sky-100',
    border: 'border-cyan-300',
    icon: Database,
    iconBg: 'bg-cyan-500',
    label: '데이터',
  },
  finance: {
    gradient: 'from-emerald-50 to-green-100',
    border: 'border-emerald-300',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500',
    label: '금융',
  },
  io: {
    gradient: 'from-blue-50 to-indigo-100',
    border: 'border-blue-300',
    icon: FileInput,
    iconBg: 'bg-blue-500',
    label: '입출력',
  },
  other: {
    gradient: 'from-yellow-50 to-amber-100',
    border: 'border-yellow-300',
    icon: StickyNote,
    iconBg: 'bg-yellow-500',
    label: '기타',
  },
};

// ============================================
// 노드 타입별 아이콘 오버라이드
// ============================================

const NODE_TYPE_ICONS: Partial<Record<NodeType, React.ElementType>> = {
  // AI
  'llm': Bot,
  'airouter': Sparkles,
  'taskbreakdown': Zap,
  'smartanalysis': Brain,
  'intentparser': Sparkles,
  'multiagent': Users,
  
  // 외부 연동
  'api': Globe,
  'webhook': Webhook,
  'code': Code,
  
  // 제어
  'condition': GitBranch,
  'loop': Repeat,
  'parallel': Zap,
  'delay': Clock,
  'approval': UserCheck,
  
  // 데이터
  'transform': RefreshCw,
  'template': FileText,
  'math': Calculator,
  'formula': Calculator,
  'datetime': Clock,
  'state': Database,
  'multifilter': Filter,
  
  // 금융
  'stockalert': TrendingUp,
  'chart': LineChart,
  'tableoutput': Table,
  'compareinput': ArrowLeftRight,
  
  // 입출력
  'input': FileInput,
  'output': FileOutput,
  'filesave': Save,
  
  // 기타
  'note': StickyNote,
};

// ============================================
// 노드 타입별 한글 레이블
// ============================================

const NODE_TYPE_LABELS: Partial<Record<NodeType, string>> = {
  'llm': 'AI 모델',
  'airouter': 'AI 라우터',
  'taskbreakdown': '작업 분해',
  'smartanalysis': '스마트 분석',
  'intentparser': '의도 파싱',
  'multiagent': '멀티 에이전트',
  'api': 'API 호출',
  'webhook': '웹훅',
  'code': '코드 실행',
  'condition': '조건 분기',
  'loop': '반복',
  'parallel': '병렬 실행',
  'delay': '대기',
  'approval': '승인',
  'transform': '데이터 변환',
  'template': '템플릿',
  'random': '랜덤 선택',
  'slice': '자르기',
  'datetime': '날짜/시간',
  'htmlclean': 'HTML 정리',
  'math': '수학 연산',
  'formula': '수식',
  'multifilter': '다중 필터',
  'state': '상태 관리',
  'stockalert': '주식 알림',
  'compareinput': '비교 입력',
  'tableoutput': '테이블',
  'chart': '차트',
  'input': '입력',
  'output': '출력',
  'filesave': '파일 저장',
  'note': '메모',
};

// ============================================
// 메인 컴포넌트
// ============================================

interface UnifiedNodeProps extends NodeProps {
  data: WorkflowNodeData & { type?: NodeType };
}

function UnifiedNode({ id, data, selected, type }: UnifiedNodeProps) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const nodeResult = nodeResults[id];
  
  // 노드 타입 결정
  const nodeType = (type || data.type || 'input') as NodeType;
  const category = NODE_CATEGORIES[nodeType] || 'other';
  const styles = CATEGORY_STYLES[category];
  
  // 아이콘 결정 (타입별 오버라이드 → 카테고리 기본값)
  const IconComponent = NODE_TYPE_ICONS[nodeType] || styles.icon;
  
  // 노드 타입 레이블
  const typeLabel = NODE_TYPE_LABELS[nodeType] || nodeType.toUpperCase();
  
  // 상태 아이콘
  const StatusIcon = useMemo(() => {
    if (!nodeResult) return null;
    switch (nodeResult.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  }, [nodeResult]);

  // 노드 상태 클래스
  const statusClass = useMemo(() => {
    if (!nodeResult) return '';
    switch (nodeResult.status) {
      case 'running':
        return 'ring-2 ring-blue-400 animate-pulse';
      case 'success':
        return 'ring-2 ring-green-400';
      case 'error':
        return 'ring-2 ring-red-400';
      default:
        return '';
    }
  }, [nodeResult]);

  // 특별한 핸들이 필요한 노드들
  const hasMultipleOutputs = nodeType === 'condition' || nodeType === 'airouter';
  const hasMultipleInputs = nodeType === 'parallel';

  // Note 노드는 특별한 스타일
  if (nodeType === 'note') {
    const noteData = data as any;
    const bgColor = noteData.backgroundColor || '#fef3c7';
    
    return (
      <div
        className={cn(
          'px-3 py-2 rounded-lg shadow-md min-w-[180px] max-w-[240px]',
          'transition-all duration-200 hover:shadow-lg cursor-pointer',
          selected && 'ring-2 ring-blue-500'
        )}
        style={{ backgroundColor: bgColor }}
        onClick={() => setSelectedNode(id)}
      >
        <div className="flex items-center gap-2 mb-1">
          <StickyNote size={12} className="text-amber-600" />
          <span className="font-medium text-gray-700 text-sm truncate">
            {data.label || '메모'}
          </span>
        </div>
        {noteData.content && (
          <div className="text-xs text-gray-600 whitespace-pre-wrap">
            {noteData.content.slice(0, 80)}
            {noteData.content.length > 80 && '...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl shadow-lg border-2 min-w-[200px] max-w-[280px]',
        'bg-gradient-to-br transition-all duration-200 hover:shadow-xl cursor-pointer',
        styles.gradient,
        styles.border,
        selected && 'ring-2 ring-blue-500 border-blue-500 shadow-blue-200',
        statusClass
      )}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      {nodeType !== 'input' && (
        hasMultipleInputs ? (
          <>
            <Handle
              type="target"
              position={Position.Left}
              id="input-1"
              style={{ top: '30%' }}
              className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            />
            <Handle
              type="target"
              position={Position.Left}
              id="input-2"
              style={{ top: '70%' }}
              className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            />
          </>
        ) : (
          <Handle
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
          />
        )
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg text-white shadow-sm',
            styles.iconBg
          )}>
            <IconComponent size={14} />
          </div>
          <span className="font-semibold text-gray-800 text-sm truncate max-w-[140px]">
            {data.label || typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {StatusIcon}
        </div>
      </div>

      {/* 노드 타입 뱃지 */}
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          'px-2 py-0.5 text-[10px] font-medium text-white rounded-md',
          styles.iconBg
        )}>
          {typeLabel}
        </span>
        <span className="text-[9px] text-gray-400">
          {styles.label}
        </span>
      </div>

      {/* 콘텐츠 영역 - 카테고리별 렌더러 사용 */}
      <CategoryContent 
        nodeType={nodeType} 
        data={data} 
        nodeResult={nodeResult} 
      />

      {/* 에러 메시지 */}
      {nodeResult?.status === 'error' && nodeResult.error && (
        <div className="mt-2 p-1.5 bg-red-50 rounded border border-red-200 text-[10px] text-red-600 truncate">
          ⚠️ {nodeResult.error.slice(0, 50)}
        </div>
      )}

      {/* 출력 핸들 */}
      {nodeType !== 'output' && nodeType !== 'filesave' && (
        hasMultipleOutputs ? (
          <>
            {/* 조건/라우터 노드용 다중 출력 */}
            <div className="absolute right-0 top-1/4 transform translate-x-1/2 -translate-y-1/2">
              <Handle
                type="source"
                position={Position.Right}
                id="true"
                className="!relative !transform-none !w-3 !h-3 !bg-green-500 !border-2 !border-white"
              />
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-green-600 font-bold">
                TRUE
              </span>
            </div>
            <div className="absolute right-0 top-3/4 transform translate-x-1/2 -translate-y-1/2">
              <Handle
                type="source"
                position={Position.Right}
                id="false"
                className="!relative !transform-none !w-3 !h-3 !bg-red-500 !border-2 !border-white"
              />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-red-600 font-bold">
                FALSE
              </span>
            </div>
          </>
        ) : (
          <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
          />
        )
      )}
    </div>
  );
}

export default memo(UnifiedNode);

// Named export for use in nodeTypes
export { UnifiedNode };
