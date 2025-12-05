'use client';

/**
 * 데이터 처리 노드 카테고리 콘텐츠 렌더러
 * 
 * 대상 노드: transform, template, random, slice, datetime, htmlclean, math, formula, multifilter, state
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo } from 'react';
import { 
  RefreshCw, FileText, Shuffle, Scissors, Clock, Code,
  Calculator, FunctionSquare, Filter, Database,
  Loader2, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

interface DataNodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: any;
    error?: string;
  };
}

// ============================================
// Transform 타입 정보
// ============================================

const TRANSFORM_TYPES: Record<string, { label: string; icon: string }> = {
  'json-extract': { label: 'JSON 추출', icon: '{}' },
  'json-to-csv': { label: 'JSON → CSV', icon: '📊' },
  'text-split': { label: '텍스트 분할', icon: '✂️' },
  'regex': { label: '정규식', icon: '.*' },
  'template': { label: '템플릿', icon: '📝' },
};

// ============================================
// Math 연산 정보
// ============================================

const MATH_OPERATIONS: Record<string, { label: string; symbol: string }> = {
  add: { label: '더하기', symbol: '+' },
  subtract: { label: '빼기', symbol: '-' },
  multiply: { label: '곱하기', symbol: '×' },
  divide: { label: '나누기', symbol: '÷' },
  percent: { label: '퍼센트', symbol: '%' },
  round: { label: '반올림', symbol: '≈' },
};

// ============================================
// 메인 렌더러
// ============================================

function DataNodeContent({ nodeType, data, nodeResult }: DataNodeContentProps) {
  switch (nodeType) {
    case 'transform':
      return <TransformContent data={data} nodeResult={nodeResult} />;
    case 'template':
      return <TemplateContent data={data} nodeResult={nodeResult} />;
    case 'random':
      return <RandomContent data={data} nodeResult={nodeResult} />;
    case 'slice':
      return <SliceContent data={data} nodeResult={nodeResult} />;
    case 'datetime':
      return <DateTimeContent data={data} nodeResult={nodeResult} />;
    case 'htmlclean':
      return <HtmlCleanContent data={data} nodeResult={nodeResult} />;
    case 'math':
      return <MathContent data={data} nodeResult={nodeResult} />;
    case 'formula':
      return <FormulaContent data={data} nodeResult={nodeResult} />;
    case 'multifilter':
      return <MultiFilterContent data={data} nodeResult={nodeResult} />;
    case 'state':
      return <StateContent data={data} nodeResult={nodeResult} />;
    default:
      return <DefaultDataContent />;
  }
}

// ============================================
// Transform 노드 콘텐츠
// ============================================

function TransformContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const transformType = data.transformType || 'json-extract';
  const typeInfo = TRANSFORM_TYPES[transformType] || TRANSFORM_TYPES['json-extract'];

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <RefreshCw size={12} className="text-cyan-500" />
        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px]">
          {typeInfo.icon} {typeInfo.label}
        </span>
      </div>

      {/* 설정 미리보기 */}
      {data.config?.jsonPath && (
        <div className="text-[10px] font-mono bg-white/60 rounded p-1.5 truncate">
          $.{data.config.jsonPath}
        </div>
      )}

      {data.config?.pattern && (
        <div className="text-[10px] font-mono bg-white/60 rounded p-1.5 truncate">
          /{data.config.pattern}/
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <ResultPreview output={nodeResult.output} />
      )}
    </div>
  );
}

// ============================================
// Template 노드 콘텐츠
// ============================================

function TemplateContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const template = data.template || '';

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <FileText size={12} className="text-cyan-500" />
        <span className="text-gray-700">템플릿</span>
      </div>

      {template && (
        <div className="text-[10px] text-gray-600 bg-white/60 rounded p-1.5 truncate">
          {template.slice(0, 40)}{template.length > 40 ? '...' : ''}
        </div>
      )}

      {/* 변수 하이라이트 */}
      {template.includes('{{') && (
        <div className="flex flex-wrap gap-1">
          {template.match(/\{\{(\w+)\}\}/g)?.slice(0, 3).map((v: string, i: number) => (
            <span key={i} className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[9px]">
              {v}
            </span>
          ))}
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <ResultPreview output={nodeResult.output} />
      )}
    </div>
  );
}

// ============================================
// Random 노드 콘텐츠
// ============================================

function RandomContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const count = data.count || 1;

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shuffle size={12} className="text-cyan-500" />
          <span className="text-gray-700">랜덤 선택</span>
        </div>
        <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">
          {count}개
        </span>
      </div>

      {data.delimiter && (
        <div className="text-[10px] text-gray-500">
          구분자: <code className="bg-gray-100 px-1 rounded">{data.delimiter}</code>
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <ResultPreview output={nodeResult.output} />
      )}
    </div>
  );
}

// ============================================
// Slice 노드 콘텐츠
// ============================================

function SliceContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const sliceTypes: Record<string, string> = {
    chars: '문자',
    words: '단어',
    lines: '줄',
    tokens: '토큰',
  };

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Scissors size={12} className="text-cyan-500" />
        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px]">
          {sliceTypes[data.sliceType] || '문자'}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-600">
        <span>범위:</span>
        <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded">
          [{data.start || 0}:{data.end || '끝'}]
        </span>
      </div>

      {nodeResult?.status === 'success' && (
        <ResultPreview output={nodeResult.output} />
      )}
    </div>
  );
}

// ============================================
// DateTime 노드 콘텐츠
// ============================================

function DateTimeContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const formatLabels: Record<string, string> = {
    full: '전체',
    date: '날짜',
    time: '시간',
    iso: 'ISO',
    custom: '커스텀',
  };

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Clock size={12} className="text-cyan-500" />
        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px]">
          {formatLabels[data.format] || '전체'}
        </span>
      </div>

      {data.format === 'custom' && data.customFormat && (
        <div className="text-[10px] font-mono text-gray-600 bg-white/60 rounded p-1.5">
          {data.customFormat}
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="text-center">
          <span className="text-sm font-mono text-cyan-700 bg-cyan-50 px-2 py-1 rounded">
            {nodeResult.output}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// HtmlClean 노드 콘텐츠
// ============================================

function HtmlCleanContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const options = [
    { key: 'removeScripts', label: '스크립트', icon: '🔒' },
    { key: 'removeStyles', label: '스타일', icon: '🎨' },
    { key: 'removeComments', label: '주석', icon: '💬' },
    { key: 'keepLinks', label: '링크 유지', icon: '🔗' },
  ];

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Code size={12} className="text-cyan-500" />
        <span className="text-gray-700">HTML 정리</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          data[opt.key] && (
            <span 
              key={opt.key}
              className="px-1 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[9px]"
            >
              {opt.icon} {opt.label}
            </span>
          )
        ))}
      </div>

      {nodeResult?.status === 'success' && (
        <div className="flex items-center gap-1 text-green-600 text-[10px]">
          <CheckCircle size={10} />
          <span>정리 완료</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Math 노드 콘텐츠
// ============================================

function MathContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const operation = data.operation || 'add';
  const opInfo = MATH_OPERATIONS[operation] || MATH_OPERATIONS.add;

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Calculator size={12} className="text-cyan-500" />
        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px]">
          {opInfo.label}
        </span>
      </div>

      {/* 수식 미리보기 */}
      <div className="text-center font-mono text-sm bg-white/60 rounded p-2">
        <span className="text-gray-600">{data.value1 || '?'}</span>
        <span className="text-cyan-600 mx-2 font-bold">{opInfo.symbol}</span>
        <span className="text-gray-600">{data.value2 || '?'}</span>
      </div>

      {nodeResult?.status === 'success' && (
        <div className="text-center">
          <span className="text-sm font-bold text-cyan-700">
            = {nodeResult.output}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Formula 노드 콘텐츠
// ============================================

function FormulaContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <FunctionSquare size={12} className="text-cyan-500" />
        <span className="text-gray-700">수식</span>
        {data.outputAsJson && (
          <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px]">
            JSON
          </span>
        )}
      </div>

      {nodeResult?.status === 'success' && (
        <ResultPreview output={nodeResult.output} />
      )}
    </div>
  );
}

// ============================================
// MultiFilter 노드 콘텐츠
// ============================================

function MultiFilterContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Filter size={12} className="text-cyan-500" />
        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px]">
          {data.logic || 'AND'}
        </span>
      </div>

      {data.passThrough && (
        <div className="text-[10px] text-gray-500">
          ✓ 통과 항목만
        </div>
      )}

      {nodeResult?.status === 'success' && (
        <div className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
          {Array.isArray(nodeResult.output) 
            ? `${nodeResult.output.length}개 통과`
            : '필터링 완료'}
        </div>
      )}
    </div>
  );
}

// ============================================
// State 노드 콘텐츠
// ============================================

function StateContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const operationLabels: Record<string, { label: string; icon: string }> = {
    init: { label: '초기화', icon: '🆕' },
    get: { label: '읽기', icon: '📖' },
    set: { label: '쓰기', icon: '✏️' },
    update: { label: '업데이트', icon: '🔄' },
  };

  const opInfo = operationLabels[data.operation] || operationLabels.get;

  return (
    <div className="text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Database size={12} className="text-cyan-500" />
        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px]">
          {opInfo.icon} {opInfo.label}
        </span>
      </div>

      {nodeResult?.status === 'success' && (
        <ResultPreview output={nodeResult.output} />
      )}
    </div>
  );
}

// ============================================
// 결과 미리보기 컴포넌트
// ============================================

function ResultPreview({ output }: { output: any }) {
  const displayValue = typeof output === 'object' 
    ? JSON.stringify(output).slice(0, 35) 
    : String(output).slice(0, 35);

  return (
    <div className="p-1.5 bg-green-50 border border-green-200 rounded text-green-800 text-[10px] truncate">
      <span className="text-green-600">→</span> {displayValue}{displayValue.length >= 35 ? '...' : ''}
    </div>
  );
}

// ============================================
// 기본 콘텐츠
// ============================================

function DefaultDataContent() {
  return (
    <div className="text-xs text-gray-500">
      <RefreshCw size={12} className="inline mr-1" />
      데이터 처리 설정 필요
    </div>
  );
}

export default memo(DataNodeContent);
export { DataNodeContent };
