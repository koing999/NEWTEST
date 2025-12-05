/**
 * 워크플로우 템플릿 정의
 * 
 * 원클릭 템플릿 - 회계사 3년치 재무제표 분석 (사용자 요청)
 */

import { Node, Edge } from 'reactflow';
import { WorkflowNodeData, LLMProvider, LLMModel } from '@/types/workflow';

// 템플릿 타입 정의
export type TemplateType = 'accountant' | 'multi-expert';

export interface WorkflowTemplate {
  name: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

/**
 * 모든 워크플로우 템플릿
 */
export const workflowTemplates: Record<TemplateType, WorkflowTemplate> = {
  // 📊 회계사 3년치 재무제표 분석 (사용자 요청)
  accountant: {
    name: '📊 회계사 3년치 재무제표 분석',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 250 },
        data: {
          type: 'input',
          label: '🏢 기업명 입력',
          inputType: 'text',
          value: '삼성전자',
          placeholder: '분석할 기업명을 입력하세요 (예: 삼성전자)',
        },
      },
      {
        id: 'api-dart',
        type: 'api',
        position: { x: 300, y: 250 },
        data: {
          type: 'api',
          label: '📡 DART (3년치 재무제표)',
          preset: 'dart',
          method: 'GET',
          url: '',
          presetConfig: {
            reportType: 'financial',
            yearCount: 3 // 3년치 데이터 요청
          },
        },
      },
      {
        id: 'transform-csv',
        type: 'transform',
        position: { x: 550, y: 250 },
        data: {
          type: 'transform',
          label: '🔄 JSON to CSV',
          transformType: 'json-to-csv',
          config: {},
        },
      },
      {
        id: 'slice-csv',
        type: 'slice',
        position: { x: 800, y: 250 },
        data: {
          type: 'slice',
          label: '✂️ 데이터 자르기 (토큰 절약)',
          sliceType: 'chars',
          start: 0,
          end: 15000, // 3년치 데이터가 너무 길 수 있으므로 제한
        },
      },
      {
        id: 'llm-accountant',
        type: 'llm',
        position: { x: 1050, y: 250 },
        data: {
          type: 'llm',
          label: '🧮 회계사 AI',
          provider: 'groq' as LLMProvider,
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct' as LLMModel,
          systemPrompt: `당신은 경력 20년의 베테랑 회계사입니다. 
제공된 3년치 재무제표 CSV 데이터를 분석하여 기업의 재무 건전성, 성장성, 수익성을 평가해주세요.
특히 유동자산, 부채비율, 영업이익 추이를 중점적으로 봐주세요.
결론은 "투자 적합" 또는 "투자 주의"로 명확하게 내려주세요.`,
          userPrompt: `{{input}}

위 기업의 최근 3년치 재무제표 데이터입니다. 회계사 관점에서 정밀 분석해주세요.`,
          temperature: 0.3,
          maxTokens: 1500,
        },
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 1300, y: 250 },
        data: {
          type: 'output',
          label: '📋 분석 결과',
          outputType: 'text'
        },
      },
      {
        id: 'output-table',
        type: 'tableoutput',
        position: { x: 800, y: 450 },
        data: {
          type: 'tableoutput',
          label: '📉 엑셀 데이터 확인',
          tableStyle: 'default',
          numberFormat: 'comma',
          numberAlign: 'right',
          showChangeIndicator: true,
          showPercent: true,
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'api-dart', animated: true },
      { id: 'e2', source: 'api-dart', target: 'transform-csv', animated: true },
      { id: 'e3', source: 'transform-csv', target: 'slice-csv', animated: true },
      { id: 'e4', source: 'slice-csv', target: 'llm-accountant', animated: true },
      { id: 'e5', source: 'llm-accountant', target: 'output-1', animated: true },
      // CSV 데이터를 엑셀 다운로드용 테이블 노드에도 연결
      { id: 'e6', source: 'transform-csv', target: 'output-table', animated: true },
    ],
  },
  // 🧠 종합 전문가 분석 (회계사 + IB + 조과장)
  'multi-expert': {
    name: '🧠 종합 전문가 분석 (회계사 + IB + 조과장)',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 50, y: 350 },
        data: {
          type: 'input',
          label: '🏢 기업명 입력',
          inputType: 'text',
          value: '아이티아이즈',
          placeholder: '분석할 기업명을 입력하세요 (예: 아이티아이즈)',
        },
      },
      {
        id: 'api-dart',
        type: 'api',
        position: { x: 300, y: 350 },
        data: {
          type: 'api',
          label: '📡 DART (3년치)',
          preset: 'dart',
          method: 'GET',
          url: '',
          presetConfig: {
            reportType: 'financial',
            yearCount: 3
          },
        },
      },
      {
        id: 'transform-csv',
        type: 'transform',
        position: { x: 550, y: 350 },
        data: {
          type: 'transform',
          label: '🔄 JSON to CSV',
          transformType: 'json-to-csv',
          config: {},
        },
      },
      {
        id: 'slice-csv',
        type: 'slice',
        position: { x: 800, y: 350 },
        data: {
          type: 'slice',
          label: '✂️ 데이터 자르기',
          sliceType: 'chars',
          start: 0,
          end: 15000,
        },
      },
      // 1. 회계사 (첫 번째 실행)
      {
        id: 'llm-accountant',
        type: 'llm',
        position: { x: 1100, y: 100 },
        data: {
          type: 'llm',
          label: '🧮 회계사 AI',
          provider: 'groq' as LLMProvider,
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct' as LLMModel,
          systemPrompt: `당신은 깐깐한 회계사입니다. 
[중요] 제공된 데이터의 모든 숫자는 "원(KRW)" 단위입니다. 
절대로 숫자를 그대로 읽지 말고, 반드시 "억" 또는 "조" 단위로 변환해서 말하세요. (예: 43,000,000,000 -> 430억 원)
부채비율, 유동비율 등 지표를 분석하여 리스크를 경고하세요.`,
          userPrompt: `{{input}} \n\n위 데이터를 바탕으로 재무 건전성을 분석해주세요. (단위 주의: 원 단위 데이터임)`,
          temperature: 0.3,
          maxTokens: 1000,
        },
      },
      // 2. IB (회계사 완료 후 실행 - 딜레이 효과)
      {
        id: 'llm-ib',
        type: 'llm',
        position: { x: 1100, y: 350 },
        data: {
          type: 'llm',
          label: '💼 IB 전문가 AI',
          provider: 'groq' as LLMProvider,
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct' as LLMModel,
          systemPrompt: `당신은 공격적인 투자은행(IB) 뱅커입니다. 
[중요] 데이터는 "원(KRW)" 단위입니다. "억" 단위로 환산해서 분석하세요.
성장성과 미래 가치, 시장 점유율 확대를 중시합니다. M&A 가능성이나 주가 상승 여력을 분석하세요.`,
          userPrompt: `{{input}} \n\n위 데이터를 바탕으로 투자 매력도와 성장성을 분석해주세요. (단위 환산 필수)`,
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
      // 3. 조과장 (IB 완료 후 실행)
      {
        id: 'llm-jogwajang',
        type: 'llm',
        position: { x: 1100, y: 600 },
        data: {
          type: 'llm',
          label: '🦥 조과장 AI',
          provider: 'groq' as LLMProvider,
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct' as LLMModel,
          systemPrompt: `당신은 "조과장"입니다. 
[중요] 숫자가 너무 크니까 "억" 단위로 딱 잘라서 말해줘. (예: 153,200,000,000 -> 1,532억)
어려운 재무 용어를 직장인들이 이해하기 쉽게 비유를 들어 설명해주는 친근한 선배입니다. "형님", "이건 말이죠" 같은 말투를 사용하세요.`,
          userPrompt: `{{input}} \n\n위 데이터를 우리 팀장님도 이해할 수 있게 쉽게 요약해줘. (단위: 억 원으로 통일)`,
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
      // 출력 노드들
      {
        id: 'output-accountant',
        type: 'output',
        position: { x: 1350, y: 100 },
        data: { type: 'output', label: '회계사 의견', outputType: 'text' },
      },
      {
        id: 'output-ib',
        type: 'output',
        position: { x: 1350, y: 350 },
        data: { type: 'output', label: 'IB 의견', outputType: 'text' },
      },
      {
        id: 'output-jogwajang',
        type: 'output',
        position: { x: 1350, y: 600 },
        data: { type: 'output', label: '조과장 요약', outputType: 'text' },
      },
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'api-dart', animated: true },
      { id: 'e2', source: 'api-dart', target: 'transform-csv', animated: true },
      { id: 'e3', source: 'transform-csv', target: 'slice-csv', animated: true },
      // 분기
      { id: 'e4-1', source: 'slice-csv', target: 'llm-accountant', animated: true },
      { id: 'e4-2', source: 'slice-csv', target: 'llm-ib', animated: true },
      { id: 'e4-3', source: 'slice-csv', target: 'llm-jogwajang', animated: true },
      // 출력 연결
      { id: 'e5-1', source: 'llm-accountant', target: 'output-accountant', animated: true },
      { id: 'e5-2', source: 'llm-ib', target: 'output-ib', animated: true },
      { id: 'e5-3', source: 'llm-jogwajang', target: 'output-jogwajang', animated: true },
    ],
  },
};

/**
 * 템플릿 가져오기
 */
export function getTemplate(templateType: TemplateType): WorkflowTemplate | undefined {
  return workflowTemplates[templateType];
}

/**
 * 모든 템플릿 목록 가져오기
 */
export function getTemplateList(): { type: TemplateType; name: string }[] {
  return Object.entries(workflowTemplates).map(([type, template]) => ({
    type: type as TemplateType,
    name: template.name,
  }));
}
