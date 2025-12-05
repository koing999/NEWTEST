'use client';

/**
 * 통합 노드 입력 핸들러 (Node Input Handler)
 * 
 * n8n/Flowise NodeInputHandler 패턴 적용:
 * - 모든 노드 설정 UI를 통합 관리
 * - 노드 타입에 따라 적절한 입력 필드 렌더링
 * - 공통 유효성 검사 및 상태 관리
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo, useCallback, useMemo } from 'react';
import { WorkflowNodeData, NodeType, LLMProvider, LLMModel } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { cn } from '@/lib/utils';
import { NODE_CATEGORIES, NodeCategory, CATEGORY_STYLES } from './UnifiedNode';

// ============================================
// 입력 필드 타입 정의
// ============================================

export type InputFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'json'
  | 'code'
  | 'color'
  | 'slider';

export interface InputFieldConfig {
  key: string;
  label: string;
  type: InputFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  validation?: (value: any) => string | null;
}

// ============================================
// 노드 타입별 입력 필드 정의
// ============================================

export const NODE_INPUT_FIELDS: Record<NodeType, InputFieldConfig[]> = {
  // Input 노드
  'input': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'inputType', label: '입력 타입', type: 'select', options: [
      { value: 'text', label: '텍스트' },
      { value: 'file', label: '파일' },
      { value: 'json', label: 'JSON' },
    ]},
    { key: 'value', label: '입력 값', type: 'textarea', rows: 4 },
    { key: 'placeholder', label: '플레이스홀더', type: 'text' },
  ],

  // LLM 노드
  'llm': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'provider', label: 'AI 제공자', type: 'select', required: true, options: [
      { value: 'groq', label: 'Groq (무료!)' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'gemini', label: 'Google Gemini' },
      { value: 'deepseek', label: 'DeepSeek (저렴!)' },
      { value: 'xai', label: 'xAI (Grok)' },
      { value: 'perplexity', label: 'Perplexity' },
      { value: 'mistral', label: 'Mistral' },
    ]},
    { key: 'model', label: 'AI 모델', type: 'select', required: true },
    { key: 'systemPrompt', label: '시스템 프롬프트', type: 'textarea', rows: 3, 
      description: 'AI의 역할과 행동을 정의합니다' },
    { key: 'userPrompt', label: '사용자 프롬프트', type: 'textarea', rows: 4, required: true,
      description: '{{input}}으로 이전 노드 결과 참조 가능' },
    { key: 'temperature', label: '창의성 (Temperature)', type: 'slider', min: 0, max: 2, step: 0.1, defaultValue: 0.7 },
    { key: 'maxTokens', label: '최대 토큰', type: 'number', min: 100, max: 128000, defaultValue: 4096 },
  ],

  // API 노드
  'api': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'preset', label: '프리셋', type: 'select', options: [
      { value: 'custom', label: '커스텀 API' },
      { value: 'dart', label: 'DART 공시' },
      { value: 'stock-kr', label: '한국 주식' },
      { value: 'stock-us', label: '미국 주식' },
      { value: 'news', label: '뉴스' },
      { value: 'weather', label: '날씨' },
    ]},
    { key: 'method', label: 'HTTP 메소드', type: 'select', options: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'DELETE', label: 'DELETE' },
    ]},
    { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/...' },
    { key: 'headers', label: '헤더', type: 'json' },
    { key: 'body', label: '요청 본문', type: 'textarea', rows: 3 },
  ],

  // Condition 노드
  'condition': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'conditionType', label: '조건 타입', type: 'select', required: true, options: [
      { value: 'contains', label: '포함' },
      { value: 'equals', label: '같음' },
      { value: 'greater', label: '초과' },
      { value: 'less', label: '미만' },
      { value: 'regex', label: '정규식' },
      { value: 'empty', label: '비어있음' },
      { value: 'not-empty', label: '비어있지 않음' },
    ]},
    { key: 'conditionValue', label: '비교 값', type: 'text' },
    { key: 'caseSensitive', label: '대소문자 구분', type: 'toggle', defaultValue: false },
  ],

  // Loop 노드
  'loop': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'loopType', label: '반복 타입', type: 'select', required: true, options: [
      { value: 'count', label: '횟수 반복' },
      { value: 'foreach', label: '리스트 순회' },
      { value: 'while', label: '조건 반복' },
    ]},
    { key: 'maxIterations', label: '최대 반복 횟수', type: 'number', min: 1, max: 100, defaultValue: 10 },
    { key: 'delimiter', label: '구분자', type: 'text', defaultValue: ',' },
  ],

  // Transform 노드
  'transform': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'transformType', label: '변환 타입', type: 'select', required: true, options: [
      { value: 'json-extract', label: 'JSON 추출' },
      { value: 'json-to-csv', label: 'JSON → CSV' },
      { value: 'text-split', label: '텍스트 분할' },
      { value: 'regex', label: '정규식' },
      { value: 'template', label: '템플릿' },
    ]},
    { key: 'config.jsonPath', label: 'JSON 경로', type: 'text', placeholder: '$.data.items[*].name' },
    { key: 'config.delimiter', label: '구분자', type: 'text' },
    { key: 'config.pattern', label: '정규식 패턴', type: 'text' },
  ],

  // Output 노드
  'output': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'outputType', label: '출력 형식', type: 'select', options: [
      { value: 'text', label: '텍스트' },
      { value: 'json', label: 'JSON' },
      { value: 'markdown', label: '마크다운' },
    ]},
  ],

  // Multi-Agent 노드
  'multiagent': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'agents', label: '에이전트 선택', type: 'multiselect', options: [
      { value: 'jogwajang', label: '🧑‍💼 조과장 (총괄)' },
      { value: 'accountant', label: '📊 회계사' },
      { value: 'ib', label: '💼 IB 전문가' },
      { value: 'mckinsey', label: '📈 맥킨지 컨설턴트' },
      { value: 'planner', label: '📋 기획자' },
    ]},
    { key: 'analysisMode', label: '분석 모드', type: 'select', options: [
      { value: 'parallel', label: '병렬 (동시 분석)' },
      { value: 'sequential', label: '순차 (차례대로)' },
    ]},
    { key: 'outputFormat', label: '출력 형식', type: 'select', options: [
      { value: 'combined', label: '통합' },
      { value: 'separate', label: '개별' },
      { value: 'comparison', label: '비교' },
    ]},
  ],

  // 나머지 노드들은 기본 설정
  'delay': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'delayMs', label: '대기 시간 (ms)', type: 'number', min: 0, max: 60000, defaultValue: 1000 },
    { key: 'reason', label: '대기 이유', type: 'text' },
  ],

  'webhook': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'webhookType', label: '웹훅 타입', type: 'select', options: [
      { value: 'slack', label: 'Slack' },
      { value: 'discord', label: 'Discord' },
      { value: 'custom', label: '커스텀' },
    ]},
    { key: 'webhookUrl', label: '웹훅 URL', type: 'text', required: true },
    { key: 'messageTemplate', label: '메시지 템플릿', type: 'textarea', rows: 3 },
  ],

  'code': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'code', label: '코드', type: 'code', rows: 10 },
  ],

  'parallel': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'branches', label: '병렬 분기 수', type: 'number', min: 2, max: 5, defaultValue: 2 },
    { key: 'mergeStrategy', label: '병합 전략', type: 'select', options: [
      { value: 'all', label: '모두 완료 후' },
      { value: 'first', label: '첫 번째 완료 시' },
      { value: 'any', label: '아무거나 완료 시' },
    ]},
  ],

  // 금융 특화 노드
  'stockalert': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'minHighRise', label: '최소 고점 상승률 (%)', type: 'number', defaultValue: 5 },
    { key: 'maxDropFromHigh', label: '고점 대비 최대 하락 (%)', type: 'number', defaultValue: -3 },
    { key: 'minCurrentRise', label: '최소 현재 상승률 (%)', type: 'number', defaultValue: 2 },
  ],

  'chart': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'chartType', label: '차트 타입', type: 'select', options: [
      { value: 'bar', label: '막대' },
      { value: 'line', label: '선' },
      { value: 'pie', label: '파이' },
      { value: 'doughnut', label: '도넛' },
      { value: 'radar', label: '레이더' },
    ]},
    { key: 'chartTitle', label: '차트 제목', type: 'text' },
    { key: 'showLegend', label: '범례 표시', type: 'toggle', defaultValue: true },
  ],

  // 기타 노드들 (간단한 기본 설정)
  'random': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'count', label: '선택 개수', type: 'number', min: 1, defaultValue: 1 },
    { key: 'delimiter', label: '구분자', type: 'text', defaultValue: ',' },
  ],

  'slice': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'sliceType', label: '자르기 단위', type: 'select', options: [
      { value: 'chars', label: '문자' },
      { value: 'words', label: '단어' },
      { value: 'lines', label: '줄' },
      { value: 'tokens', label: '토큰' },
    ]},
    { key: 'start', label: '시작 위치', type: 'number', defaultValue: 0 },
    { key: 'end', label: '끝 위치', type: 'number' },
  ],

  'datetime': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'format', label: '형식', type: 'select', options: [
      { value: 'full', label: '전체' },
      { value: 'date', label: '날짜만' },
      { value: 'time', label: '시간만' },
      { value: 'iso', label: 'ISO 형식' },
      { value: 'custom', label: '커스텀' },
    ]},
    { key: 'customFormat', label: '커스텀 형식', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
  ],

  'template': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'template', label: '템플릿', type: 'textarea', rows: 4, 
      description: '{{변수명}} 형식으로 변수 사용' },
  ],

  'htmlclean': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'removeScripts', label: '스크립트 제거', type: 'toggle', defaultValue: true },
    { key: 'removeStyles', label: '스타일 제거', type: 'toggle', defaultValue: true },
    { key: 'removeComments', label: '주석 제거', type: 'toggle', defaultValue: true },
    { key: 'keepLinks', label: '링크 유지', type: 'toggle', defaultValue: true },
  ],

  'math': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'operation', label: '연산', type: 'select', options: [
      { value: 'add', label: '더하기' },
      { value: 'subtract', label: '빼기' },
      { value: 'multiply', label: '곱하기' },
      { value: 'divide', label: '나누기' },
      { value: 'percent', label: '퍼센트' },
      { value: 'round', label: '반올림' },
    ]},
    { key: 'value1', label: '값 1', type: 'text' },
    { key: 'value2', label: '값 2', type: 'text' },
  ],

  'formula': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'outputAsJson', label: 'JSON 출력', type: 'toggle', defaultValue: true },
  ],

  'multifilter': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'logic', label: '조건 결합', type: 'select', options: [
      { value: 'AND', label: 'AND (모두 만족)' },
      { value: 'OR', label: 'OR (하나라도 만족)' },
    ]},
    { key: 'passThrough', label: '통과 항목만', type: 'toggle', defaultValue: true },
  ],

  'filesave': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'fileType', label: '파일 형식', type: 'select', options: [
      { value: 'txt', label: '텍스트 (.txt)' },
      { value: 'json', label: 'JSON (.json)' },
      { value: 'csv', label: 'CSV (.csv)' },
      { value: 'md', label: '마크다운 (.md)' },
    ]},
    { key: 'filename', label: '파일명', type: 'text' },
    { key: 'appendDate', label: '날짜 추가', type: 'toggle', defaultValue: true },
  ],

  'taskbreakdown': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'breakdownStyle', label: '분해 스타일', type: 'select', options: [
      { value: 'steps', label: '단계별' },
      { value: 'checklist', label: '체크리스트' },
      { value: 'mindmap', label: '마인드맵' },
    ]},
    { key: 'maxSteps', label: '최대 단계 수', type: 'number', min: 3, max: 20, defaultValue: 5 },
  ],

  'state': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'operation', label: '작업', type: 'select', options: [
      { value: 'init', label: '초기화' },
      { value: 'get', label: '읽기' },
      { value: 'set', label: '쓰기' },
      { value: 'update', label: '업데이트' },
    ]},
  ],

  'airouter': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'instruction', label: '라우팅 지시', type: 'textarea', rows: 3 },
  ],

  'approval': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'message', label: '승인 요청 메시지', type: 'textarea', rows: 2 },
    { key: 'approveLabel', label: '승인 버튼 텍스트', type: 'text', defaultValue: '승인' },
    { key: 'rejectLabel', label: '거절 버튼 텍스트', type: 'text', defaultValue: '거절' },
  ],

  'note': [
    { key: 'label', label: '제목', type: 'text' },
    { key: 'content', label: '내용', type: 'textarea', rows: 4 },
    { key: 'backgroundColor', label: '배경색', type: 'color', defaultValue: '#fef3c7' },
  ],

  'compareinput': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'compareType', label: '비교 유형', type: 'select', options: [
      { value: 'financial', label: '재무제표' },
      { value: 'stock', label: '주가' },
      { value: 'all', label: '전체' },
    ]},
  ],

  'tableoutput': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'tableStyle', label: '테이블 스타일', type: 'select', options: [
      { value: 'default', label: '기본' },
      { value: 'compact', label: '컴팩트' },
      { value: 'striped', label: '줄무늬' },
    ]},
    { key: 'numberFormat', label: '숫자 형식', type: 'select', options: [
      { value: 'raw', label: '원본' },
      { value: 'korean', label: '한국식 (억, 조)' },
      { value: 'comma', label: '콤마' },
    ]},
  ],

  'intentparser': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'mode', label: '분석 모드', type: 'select', options: [
      { value: 'auto', label: '자동' },
      { value: 'financial', label: '금융' },
      { value: 'general', label: '일반' },
    ]},
  ],

  'smartanalysis': [
    { key: 'label', label: '노드 이름', type: 'text', required: true },
    { key: 'autoDetect', label: '자동 감지', type: 'toggle', defaultValue: true },
    { key: 'aiPersona', label: 'AI 페르소나', type: 'select', options: [
      { value: 'jogwajang', label: '🧑‍💼 조과장' },
      { value: 'accountant', label: '📊 회계사' },
      { value: 'analyst', label: '📈 분석가' },
      { value: 'custom', label: '커스텀' },
    ]},
  ],
};

// ============================================
// 메인 컴포넌트
// ============================================

interface NodeInputHandlerProps {
  nodeId: string;
  nodeType: NodeType;
  data: WorkflowNodeData;
  onChange: (key: string, value: any) => void;
}

function NodeInputHandler({ nodeId, nodeType, data, onChange }: NodeInputHandlerProps) {
  const fields = NODE_INPUT_FIELDS[nodeType] || [
    { key: 'label', label: '노드 이름', type: 'text' as const, required: true },
  ];

  const category = NODE_CATEGORIES[nodeType] || 'other';
  const styles = CATEGORY_STYLES[category];

  return (
    <div className="space-y-4">
      {/* 카테고리 헤더 */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        `bg-gradient-to-r ${styles.gradient}`
      )}>
        <styles.icon className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-700 text-sm">
          {nodeType.toUpperCase()} 설정
        </span>
      </div>

      {/* 필드 렌더링 */}
      {fields.map((field) => (
        <InputField
          key={field.key}
          field={field}
          value={getNestedValue(data, field.key)}
          onChange={(value) => onChange(field.key, value)}
        />
      ))}
    </div>
  );
}

// ============================================
// 개별 입력 필드 컴포넌트
// ============================================

interface InputFieldProps {
  field: InputFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

function InputField({ field, value, onChange }: InputFieldProps) {
  const inputId = `field-${field.key}`;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}

      {/* 타입별 입력 렌더링 */}
      {field.type === 'text' && (
        <input
          id={inputId}
          type="text"
          value={value || field.defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          id={inputId}
          value={value || field.defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      )}

      {field.type === 'number' && (
        <input
          id={inputId}
          type="number"
          value={value ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={field.min}
          max={field.max}
          step={field.step || 1}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}

      {field.type === 'select' && (
        <select
          id={inputId}
          value={value || field.defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">선택하세요...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'toggle' && (
        <button
          type="button"
          role="switch"
          aria-checked={value ?? field.defaultValue ?? false}
          onClick={() => onChange(!(value ?? field.defaultValue ?? false))}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            (value ?? field.defaultValue) ? 'bg-blue-500' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              (value ?? field.defaultValue) ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      )}

      {field.type === 'slider' && (
        <div className="flex items-center gap-3">
          <input
            id={inputId}
            type="range"
            value={value ?? field.defaultValue ?? field.min ?? 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step || 0.1}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12 text-right">
            {value ?? field.defaultValue ?? field.min ?? 0}
          </span>
        </div>
      )}

      {field.type === 'code' && (
        <textarea
          id={inputId}
          value={value || field.defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                     font-mono bg-gray-50
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      )}

      {field.type === 'color' && (
        <input
          id={inputId}
          type="color"
          value={value || field.defaultValue || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
        />
      )}

      {field.type === 'multiselect' && (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(value || []).includes(opt.value)}
                onChange={(e) => {
                  const currentValues = value || [];
                  if (e.target.checked) {
                    onChange([...currentValues, opt.value]);
                  } else {
                    onChange(currentValues.filter((v: string) => v !== opt.value));
                  }
                }}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 유틸리티 함수
// ============================================

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export default memo(NodeInputHandler);
export { NodeInputHandler };
