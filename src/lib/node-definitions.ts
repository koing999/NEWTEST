/**
 * 노드 정의 모듈
 * 
 * 사이드바에서 사용하는 노드 템플릿 정의
 * 각 노드 타입의 기본 데이터와 UI 정보를 포함
 */

import {
  Type, Bot, Wand2, FileOutput, GitBranch, Repeat, Globe, Timer, Bell,
  Shuffle, Scissors, Calendar, Download, ListTodo, Database, Route,
  UserCheck, StickyNote, Code2, GitMerge, FileText, Eraser, Calculator,
  FunctionSquare, Filter, TrendingUp, Users, GitCompare, Table, BarChart3,
  Brain, Sparkles, LucideIcon,
} from 'lucide-react';
import {
  InputNodeData, LLMNodeData, TransformNodeData, OutputNodeData,
  ConditionNodeData, LoopNodeData, ApiNodeData, DelayNodeData,
  WebhookNodeData, RandomNodeData, SliceNodeData, DateTimeNodeData,
  FileSaveNodeData, TaskBreakdownNodeData, StateNodeData, AIRouterNodeData,
  ApprovalNodeData, NoteNodeData, CodeNodeData, ParallelNodeData,
  TemplateNodeData, HtmlCleanNodeData, MathNodeData, FormulaNodeData,
  MultiFilterNodeData, StockAlertNodeData, MultiAgentNodeData,
  CompareInputNodeData, TableOutputNodeData, ChartNodeData,
  IntentParserNodeData, SmartAnalysisNodeData, WorkflowNodeData,
} from '@/types/workflow';

// 노드 템플릿 타입
export interface NodeTemplate {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
  getData: () => WorkflowNodeData;
}

/**
 * 모든 노드 템플릿 정의
 */
export const nodeTemplates: NodeTemplate[] = [
  // 기본 노드
  {
    type: 'inputNode',
    label: '입력',
    icon: Type,
    color: 'bg-emerald-500',
    description: '텍스트 또는 파일 입력',
    getData: (): InputNodeData => ({
      type: 'input',
      label: '입력',
      inputType: 'text',
      value: '',
      placeholder: '텍스트를 입력하세요...',
    }),
  },
  {
    type: 'smartanalysisNode',
    label: '🔮 스마트 분석',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500',
    description: '한방에 다 처리! (통역+API+AI)',
    getData: (): SmartAnalysisNodeData => ({
      type: 'smartanalysis',
      label: '🔮 스마트 분석',
      autoDetect: true,
    }),
  },
  {
    type: 'intentParserNode',
    label: '🧠 통역사',
    icon: Brain,
    color: 'bg-gradient-to-r from-pink-500 to-violet-500',
    description: '사람 말 → AI가 이해하는 말로 번역',
    getData: (): IntentParserNodeData => ({
      type: 'intentparser',
      label: '통역사',
    }),
  },
  {
    type: 'llmNode',
    label: 'AI 모델',
    icon: Bot,
    color: 'bg-blue-500',
    description: 'AI로 처리하기',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: 'AI 처리',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      userPrompt: '{{input}}',
      systemPrompt: '당신은 유능한 AI 어시스턴트입니다.',
      temperature: 0.7,
      maxTokens: 1000,
    }),
  },
  {
    type: 'transformNode',
    label: '변환',
    icon: Wand2,
    color: 'bg-amber-500',
    description: '데이터 변환하기',
    getData: (): TransformNodeData => ({
      type: 'transform',
      label: '변환',
      transformType: 'json-extract',
      config: { jsonPath: '$.result' },
    }),
  },
  {
    type: 'outputNode',
    label: '출력',
    icon: FileOutput,
    color: 'bg-purple-500',
    description: '결과 표시하기',
    getData: (): OutputNodeData => ({
      type: 'output',
      label: '출력',
      outputType: 'text',
    }),
  },
  
  // 제어 흐름 노드
  {
    type: 'conditionNode',
    label: '조건 분기',
    icon: GitBranch,
    color: 'bg-orange-500',
    description: 'IF/ELSE 분기 처리',
    getData: (): ConditionNodeData => ({
      type: 'condition',
      label: '조건',
      conditionType: 'contains',
      conditionValue: '',
      caseSensitive: false,
    }),
  },
  {
    type: 'loopNode',
    label: '반복',
    icon: Repeat,
    color: 'bg-cyan-500',
    description: '여러 번 반복 실행',
    getData: (): LoopNodeData => ({
      type: 'loop',
      label: '반복',
      loopType: 'foreach',
      maxIterations: 10,
      delimiter: '\n',
    }),
  },

  // API & 외부 연동
  {
    type: 'apiNode',
    label: 'API 호출',
    icon: Globe,
    color: 'bg-indigo-500',
    description: 'DART, 주식, 뉴스 등',
    getData: (): ApiNodeData => ({
      type: 'api',
      label: 'API',
      method: 'GET',
      url: '',
      preset: 'custom',
      presetConfig: {},
    }),
  },
  {
    type: 'delayNode',
    label: '잠깐 쉬어',
    icon: Timer,
    color: 'bg-yellow-500',
    description: 'N초 대기 (API 제한 회피)',
    getData: (): DelayNodeData => ({
      type: 'delay',
      label: '쉬는 중',
      delayMs: 2000,
      reason: 'API 호출 제한 회피',
    }),
  },
  {
    type: 'webhookNode',
    label: '알림 보내기',
    icon: Bell,
    color: 'bg-pink-500',
    description: 'Slack, Discord로 알림',
    getData: (): WebhookNodeData => ({
      type: 'webhook',
      label: '알림',
      webhookType: 'slack',
      webhookUrl: '',
      messageTemplate: '🦥 조과장: 일 끝났습니다.\n\n{{input}}',
    }),
  },

  // 데이터 처리
  {
    type: 'randomNode',
    label: '랜덤 뽑기',
    icon: Shuffle,
    color: 'bg-teal-500',
    description: '리스트에서 무작위 선택',
    getData: (): RandomNodeData => ({
      type: 'random',
      label: '랜덤 뽑기',
      delimiter: '\n',
      count: 1,
      allowDuplicate: false,
    }),
  },
  {
    type: 'sliceNode',
    label: '텍스트 자르기',
    icon: Scissors,
    color: 'bg-rose-500',
    description: '글자/단어/줄 수 제한',
    getData: (): SliceNodeData => ({
      type: 'slice',
      label: '텍스트 자르기',
      sliceType: 'chars',
      start: 0,
      end: 1000,
    }),
  },
  {
    type: 'datetimeNode',
    label: '날짜/시간',
    icon: Calendar,
    color: 'bg-violet-500',
    description: '현재 날짜/시간 삽입',
    getData: (): DateTimeNodeData => ({
      type: 'datetime',
      label: '날짜/시간',
      format: 'full',
      timezone: 'Asia/Seoul',
    }),
  },
  {
    type: 'filesaveNode',
    label: '파일 저장',
    icon: Download,
    color: 'bg-lime-500',
    description: 'txt/json/csv 다운로드',
    getData: (): FileSaveNodeData => ({
      type: 'filesave',
      label: '파일 저장',
      fileType: 'txt',
      filename: 'output',
      appendDate: true,
    }),
  },

  // AI 고급 기능
  {
    type: 'taskbreakdownNode',
    label: '작업 분해',
    icon: ListTodo,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    description: 'AI가 복잡한 작업을 단계별로',
    getData: (): TaskBreakdownNodeData => ({
      type: 'taskbreakdown',
      label: '작업 분해',
      breakdownStyle: 'steps',
      maxSteps: 5,
      includeTimeEstimate: true,
      includePriority: true,
    }),
  },
  {
    type: 'stateNode',
    label: '전역 상태',
    icon: Database,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    description: '변수 저장/읽기 (Flowise 스타일)',
    getData: (): StateNodeData => ({
      type: 'state',
      label: 'Flow State',
      operation: 'init',
      variables: [{ key: 'result', value: '', type: 'string' }],
    }),
  },
  {
    type: 'airouterNode',
    label: 'AI 라우터',
    icon: Route,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'AI가 의도 분석해서 경로 결정',
    getData: (): AIRouterNodeData => ({
      type: 'airouter',
      label: 'AI 라우터',
      instruction: '사용자의 요청을 분석해서 적절한 카테고리로 분류하세요.',
      scenarios: [
        { id: 'support', name: '고객지원', description: '문제 해결, 불만, 환불 요청 등' },
        { id: 'sales', name: '영업문의', description: '가격, 구매, 견적 요청 등' },
        { id: 'other', name: '기타', description: '기타 일반 문의' },
      ],
    }),
  },
  {
    type: 'approvalNode',
    label: '승인 요청',
    icon: UserCheck,
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
    description: '사람 승인 후 다음 단계 (HITL)',
    getData: (): ApprovalNodeData => ({
      type: 'approval',
      label: '승인 요청',
      message: '이 작업을 계속 진행할까요?',
      showInput: true,
      approveLabel: '승인',
      rejectLabel: '거절',
    }),
  },
  {
    type: 'noteNode',
    label: '메모',
    icon: StickyNote,
    color: 'bg-amber-400',
    description: '워크플로우에 주석 추가',
    getData: (): NoteNodeData => ({
      type: 'note',
      label: '메모',
      content: '',
      backgroundColor: '#fef3c7',
      textColor: '#92400e',
    }),
  },
  {
    type: 'codeNode',
    label: '코드 실행',
    icon: Code2,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    description: 'JavaScript 코드 직접 실행',
    getData: (): CodeNodeData => ({
      type: 'code',
      label: '코드 실행',
      code: '// input 변수로 이전 노드 결과를 받아요\nconst result = input.toUpperCase();\nreturn result;',
      language: 'javascript',
    }),
  },
  {
    type: 'parallelNode',
    label: '병렬 실행',
    icon: GitMerge,
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    description: '여러 작업 동시 실행 후 병합',
    getData: (): ParallelNodeData => ({
      type: 'parallel',
      label: '병렬 실행',
      branches: 2,
      mergeStrategy: 'all',
    }),
  },
  {
    type: 'templateNode',
    label: '빈칸 채우기',
    icon: FileText,
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    description: '템플릿에 변수 채우기',
    getData: (): TemplateNodeData => ({
      type: 'template',
      label: '빈칸 채우기',
      template: '안녕하세요, {{name}}님!\n\n{{message}}\n\n감사합니다.',
      variables: [
        { key: 'name', value: '고객' },
        { key: 'message', value: '{{input}}' },
      ],
    }),
  },
  {
    type: 'htmlcleanNode',
    label: 'HTML 청소기',
    icon: Eraser,
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
    description: '태그 제거, 텍스트만 추출 (토큰 절약!)',
    getData: (): HtmlCleanNodeData => ({
      type: 'htmlclean',
      label: 'HTML 청소기',
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      keepLinks: false,
      keepImages: false,
    }),
  },
  {
    type: 'mathNode',
    label: '계산기',
    icon: Calculator,
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    description: '간단한 사칙연산',
    getData: (): MathNodeData => ({
      type: 'math',
      label: '계산기',
      operation: 'add',
      value1: '{{input}}',
      value2: '0',
      decimals: 2,
    }),
  },
  {
    type: 'formulaNode',
    label: '수식 계산',
    icon: FunctionSquare,
    color: 'bg-gradient-to-r from-violet-600 to-purple-600',
    description: '복잡한 수식 (주식 분석용!)',
    getData: (): FormulaNodeData => ({
      type: 'formula',
      label: '수식 계산',
      inputFields: ['price', 'volume', 'prevClose'],
      formulas: [
        { name: 'changeRate', label: '등락률', formula: '(price - prevClose) / prevClose * 100', decimals: 2 },
        { name: 'value', label: '거래대금', formula: 'price * volume', decimals: 0 },
      ],
      outputAsJson: true,
    }),
  },
  {
    type: 'multifilterNode',
    label: '복합 필터',
    icon: Filter,
    color: 'bg-gradient-to-r from-amber-600 to-yellow-600',
    description: 'AND/OR 조건으로 필터링',
    getData: (): MultiFilterNodeData => ({
      type: 'multifilter',
      label: '복합 필터',
      logic: 'AND',
      conditions: [
        { field: 'value', operator: '>=', value: '0' },
      ],
      passThrough: true,
    }),
  },
  {
    type: 'stockalertNode',
    label: '📈 주식 급등락',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-green-500 to-lime-500',
    description: '급등 → 조정 → 회복 패턴 감지',
    getData: (): StockAlertNodeData => ({
      type: 'stockalert',
      label: '주식 급등락',
      minHighRise: 18,
      maxDropFromHigh: -8,
      minCurrentRise: 13,
      openField: 'open',
      highField: 'high',
      lowField: 'low',
      currentField: 'current',
      nameField: 'name',
      messageTemplate: '{{name}} | 고점 {{highRise}}% → 저점 {{maxDrop}}% → 현재 {{currentRise}}%',
    }),
  },
  
  // 재무 분석 특화
  {
    type: 'multiagentNode',
    label: '👥 다중 전문가',
    icon: Users,
    color: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    description: '회계사 + IB + 맥킨지 동시 분석',
    getData: (): MultiAgentNodeData => ({
      type: 'multiagent',
      label: '다중 전문가',
      agents: ['accountant', 'ib', 'mckinsey'],
      analysisMode: 'parallel',
      outputFormat: 'combined',
    }),
  },
  {
    type: 'compareinputNode',
    label: '⚖️ 기업 비교',
    icon: GitCompare,
    color: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    description: '2개 이상 기업 비교 분석',
    getData: (): CompareInputNodeData => ({
      type: 'compareinput',
      label: '기업 비교',
      companies: ['삼성전자', 'SK하이닉스'],
      compareType: 'financial',
    }),
  },
  {
    type: 'tableoutputNode',
    label: '📊 표 출력',
    icon: Table,
    color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    description: '재무제표를 깔끔한 표로',
    getData: (): TableOutputNodeData => ({
      type: 'tableoutput',
      label: '표 출력',
      tableStyle: 'default',
      numberFormat: 'korean',
      numberAlign: 'right',
      showChangeIndicator: true,
      showPercent: true,
    }),
  },
  {
    type: 'chartNode',
    label: '📈 차트',
    icon: BarChart3,
    color: 'bg-gradient-to-r from-orange-600 to-red-600',
    description: '데이터 시각화 (막대, 선, 파이)',
    getData: (): ChartNodeData => ({
      type: 'chart',
      label: '차트',
      chartType: 'bar',
      chartTitle: '데이터 분석',
      labelField: 'name',
      valueField: 'value',
      colorTheme: 'cool',
      showLegend: true,
      showValues: true,
      showGrid: true,
    }),
  },

  // 전문가 AI 프리셋
  {
    type: 'llmNode',
    label: '🧮 회계사 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-emerald-600 to-green-600',
    description: '재무제표 전문 분석',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🧮 회계사 AI',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 경력 20년의 공인회계사입니다. 빅4 출신으로 재무제표 분석의 전문가입니다.

핵심 분석:
- 현금흐름 건전성
- 분식회계 징후
- 이자보상배율
- 재고자산 회전율

결론은 반드시 "투자 적합/부적합 + 이유"로 마무리하세요.`,
      userPrompt: `{{input}}

위 재무데이터를 분석해주세요:

[회계사 분석]
1. 현금흐름 건전성
2. 부채비율 및 이자보상배율
3. 회계적 리스크 요인
4. 투자 적합성 판단 (적합/부적합 + 이유)`,
      temperature: 0.3,
      maxTokens: 1200,
    }),
  },
  {
    type: 'llmNode',
    label: '🏦 IB 전문가 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    description: '밸류에이션, 목표주가',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🏦 IB 전문가 AI',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 경력 20년의 투자은행(IB) 전문가입니다. 골드만삭스 출신입니다.

핵심 분석:
- 밸류에이션 (PER/PBR/EV)
- 동종업계 멀티플 비교
- M&A 가능성

결론은 반드시 "목표 주가 + 투자 의견"으로 마무리하세요.`,
      userPrompt: `{{input}}

위 기업을 분석해주세요:

[IB 분석]
1. 밸류에이션 (적정 PER/PBR)
2. 동종업계 대비 멀티플
3. 목표주가 (보수/기본/낙관)
4. 투자의견 (매수/중립/매도)`,
      temperature: 0.4,
      maxTokens: 1200,
    }),
  },
  {
    type: 'llmNode',
    label: '🎯 맥킨지 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    description: '전략 분석, 7S 프레임워크',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🎯 맥킨지 AI',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 맥킨지 출신 전략 컨설턴트입니다. 7S 프레임워크의 대가입니다.

핵심 분석:
- 경쟁우위 (Moat)
- 산업구조 (5 Forces)
- 실행력 평가

결론은 반드시 "전략적 시사점 + So What?"으로 마무리하세요.`,
      userPrompt: `{{input}}

위 기업을 전략적으로 분석해주세요:

[전략 분석]
1. 경쟁우위 (Moat) 분석
2. 산업 내 포지션 (5 Forces)
3. 성장 기회와 위협
4. 전략적 시사점 (So What?)`,
      temperature: 0.5,
      maxTokens: 1500,
    }),
  },
  {
    type: 'llmNode',
    label: '🦥 조과장 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    description: '결론만! 뭘 사야 돈 버나?',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🦥 조과장 AI (실전 투자)',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 "일 안하는 조과장" AI입니다.

[캐릭터]
- 나무늘보처럼 느긋하지만 핵심만 콕콕 짚음
- 복잡한 분석? 귀찮아. 결론만 말해줌
- 한국 개인투자자 감성 100% 이해
- 솔직하고 직설적 (돌려 말하기 NO)

[투자 철학]
1. 어려운 거 하지 마. 쉬운 돈 벌어.
2. 모르면 반반. 아는 척 하지 마.
3. 손절은 빠르게, 익절은 느긋하게.
4. 남들 다 살 때 팔고, 남들 다 팔 때 사.
5. 제일 중요한 건 "잃지 않는 것"

[말투]
- 반말 (친근하게)
- "솔직히...", "내 생각엔...", "근데 말이야..."  
- 이모지 적극 사용 🦥💰📈📉
- 재미있게, 핵심만!`,
      userPrompt: `{{input}}

야, 이거 분석해봤는데... 결론부터 말해줄게 🦥

[5줄 요약]
복잡한 거 다 필요 없고, 핵심만 5줄로!

[조과장 점수] 
- 지금 살만해? ⭐⭐⭐⭐⭐ (5/5)
- 안전해? ⭐⭐⭐⭐⭐ (5/5)
- 오를 거야? ⭐⭐⭐⭐⭐ (5/5)

[한줄 결론]
"솔직히 이 주식은 ___다" 

[실전 전략]
- 지금 들어가? YES/NO
- 얼마에 사? ___원 부근
- 얼마에 팔아? ___원 목표
- 손절은? ___원 깨지면 도망

[조과장 한마디]
(투자 조언이나 농담 한마디)

⚠️ 조과장 말 믿고 투자했다가 망해도 난 몰라~ 
   투자는 본인 책임! 🦥`,
      temperature: 0.7,
      maxTokens: 1200,
    }),
  },
];

/**
 * 노드 타입으로 템플릿 찾기
 */
export function findNodeTemplate(type: string): NodeTemplate | undefined {
  return nodeTemplates.find(t => t.type === type);
}

/**
 * 노드 카테고리별 분류
 */
export const nodeCategories = {
  basic: ['inputNode', 'outputNode', 'llmNode', 'transformNode'],
  smart: ['smartanalysisNode', 'intentParserNode'],
  flow: ['conditionNode', 'loopNode', 'parallelNode'],
  api: ['apiNode', 'webhookNode', 'delayNode'],
  data: ['randomNode', 'sliceNode', 'datetimeNode', 'filesaveNode'],
  advanced: ['taskbreakdownNode', 'stateNode', 'airouterNode', 'approvalNode', 'codeNode'],
  transform: ['templateNode', 'htmlcleanNode', 'mathNode', 'formulaNode', 'multifilterNode'],
  finance: ['stockalertNode', 'multiagentNode', 'compareinputNode', 'tableoutputNode', 'chartNode'],
};
