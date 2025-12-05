'use client';

import React from 'react';
import { Type, Bot, Wand2, FileOutput, GitBranch, Repeat, Globe, Timer, Bell, Shuffle, Scissors, Calendar, Download, ListTodo, Database, Route, UserCheck, StickyNote, Code2, GitMerge, FileText, Eraser, Calculator, Search, FunctionSquare, Filter, TrendingUp, Users, GitCompare, Table, BarChart3, Brain, Sparkles } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { InputNodeData, LLMNodeData, TransformNodeData, OutputNodeData, ConditionNodeData, LoopNodeData, ApiNodeData, DelayNodeData, WebhookNodeData, RandomNodeData, SliceNodeData, DateTimeNodeData, FileSaveNodeData, TaskBreakdownNodeData, StateNodeData, AIRouterNodeData, ApprovalNodeData, NoteNodeData, CodeNodeData, ParallelNodeData, TemplateNodeData, HtmlCleanNodeData, MathNodeData, FormulaNodeData, MultiFilterNodeData, StockAlertNodeData, MultiAgentNodeData, CompareInputNodeData, TableOutputNodeData, ChartNodeData, IntentParserNodeData, SmartAnalysisNodeData, WorkflowNodeData } from '@/types/workflow';
import { Node } from 'reactflow';

const nodeTemplates = [
  {
    type: 'input',
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
    type: 'smartanalysis',
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
    type: 'intentparser',
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
    type: 'llm',
    label: 'AI 모델',
    icon: Bot,
    color: 'bg-blue-500',
    description: 'AI로 처리하기',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: 'AI 처리',
      provider: 'groq',  // 무료!
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      userPrompt: '{{input}}',
      systemPrompt: '당신은 유능한 AI 어시스턴트입니다.',
      temperature: 0.7,
      maxTokens: 1000,
    }),
  },
  {
    type: 'transform',
    label: '변환',
    icon: Wand2,
    color: 'bg-amber-500',
    description: '데이터 변환하기',
    getData: (): TransformNodeData => ({
      type: 'transform',
      label: '변환',
      transformType: 'json-extract',
      config: {
        jsonPath: '$.result',
      },
    }),
  },
  {
    type: 'output',
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
  {
    type: 'condition',
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
    type: 'loop',
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
  {
    type: 'api',
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
    type: 'delay',
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
    type: 'webhook',
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
  {
    type: 'random',
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
    type: 'slice',
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
    type: 'datetime',
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
    type: 'filesave',
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
  {
    type: 'taskbreakdown',
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
    type: 'state',
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
    type: 'airouter',
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
    type: 'approval',
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
    type: 'note',
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
    type: 'code',
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
    type: 'parallel',
    label: '병렬 실행',
    icon: GitMerge,
    color: 'bg-gradient-to-r from-fuchsia-500 to-purple-600',
    description: '여러 경로 동시 실행 후 병합',
    getData: (): ParallelNodeData => ({
      type: 'parallel',
      label: '병렬 실행',
      branches: 2,
      mergeStrategy: 'all',
    }),
  },
  {
    type: 'template',
    label: '빈칸 채우기',
    icon: FileText,
    color: 'bg-gradient-to-r from-sky-500 to-blue-600',
    description: '{{name}} 변수로 템플릿 채우기',
    getData: (): TemplateNodeData => ({
      type: 'template',
      label: '빈칸 채우기',
      template: '안녕하세요 {{name}}님,\n\n{{content}}\n\n감사합니다.',
      variables: [
        { key: 'name', value: '', description: '받는 사람 이름' },
        { key: 'content', value: '', description: '본문 내용' },
      ],
    }),
  },
  {
    type: 'htmlclean',
    label: 'HTML 청소기',
    icon: Eraser,
    color: 'bg-gradient-to-r from-red-400 to-orange-500',
    description: 'HTML 태그 제거 (토큰 절약!)',
    getData: (): HtmlCleanNodeData => ({
      type: 'htmlclean',
      label: 'HTML 청소기',
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      keepLinks: true,
      keepImages: false,
    }),
  },
  {
    type: 'math',
    label: '계산기',
    icon: Calculator,
    color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    description: '더하기/빼기/곱하기/나누기',
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
    type: 'formula',
    label: '수식 계산',
    icon: FunctionSquare,
    color: 'bg-gradient-to-r from-violet-500 to-purple-600',
    description: '다중 필드 수식 (주식 분석용)',
    getData: (): FormulaNodeData => ({
      type: 'formula',
      label: '수식 계산',
      formulas: [
        { name: 'highRise', formula: '(high / open - 1) * 100', label: '고점 상승률', decimals: 2 },
        { name: 'maxDrop', formula: '(low / high - 1) * 100', label: '고점 대비 하락폭', decimals: 2 },
        { name: 'currentRise', formula: '(current / open - 1) * 100', label: '현재 상승률', decimals: 2 },
      ],
      inputFields: ['open', 'high', 'low', 'current'],
      outputAsJson: true,
    }),
  },
  {
    type: 'multifilter',
    label: '복합 필터',
    icon: Filter,
    color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    description: 'AND/OR 복합 조건 필터링',
    getData: (): MultiFilterNodeData => ({
      type: 'multifilter',
      label: '복합 필터',
      logic: 'AND',
      conditions: [
        { field: 'highRise', operator: '>=', value: '18', label: '고점 상승률 18% 이상' },
        { field: 'maxDrop', operator: '<=', value: '-8', label: '최대 하락폭 8% 이상' },
        { field: 'currentRise', operator: '>=', value: '13', label: '현재 상승률 13% 이상' },
      ],
      passThrough: true,
    }),
  },
  {
    type: 'stockalert',
    label: '📈 주식 급등락',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
    description: '급등→조정→회복 패턴 감지!',
    getData: (): StockAlertNodeData => ({
      type: 'stockalert',
      label: '주식 급등락 알림',
      openField: 'open',
      highField: 'high',
      lowField: 'low',
      currentField: 'current',
      nameField: 'name',
      minHighRise: 18,
      maxDropFromHigh: -8,
      minCurrentRise: 13,
      messageTemplate: '{{name}} | 고점 {{highRise}}% → 저점 {{maxDrop}}% 빠짐 → 현재 {{currentRise}}% 회복!!',
    }),
  },
  // ════════════════════════════════════════
  // 📊 재무분석 강화 노드들 (NEW!)
  // ════════════════════════════════════════
  {
    type: 'multiagent',
    label: '👥 다중 AI 패널',
    icon: Users,
    color: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    description: '여러 전문가가 동시 분석!',
    getData: (): MultiAgentNodeData => ({
      type: 'multiagent',
      label: '다중 AI 패널',
      agents: ['accountant', 'ib', 'jogwajang'],
      analysisMode: 'parallel',
      outputFormat: 'combined',
    }),
  },
  {
    type: 'compareinput',
    label: '🔄 기업 비교',
    icon: GitCompare,
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    description: '여러 기업 동시 비교 분석',
    getData: (): CompareInputNodeData => ({
      type: 'compareinput',
      label: '기업 비교',
      companies: [],
      compareType: 'financial',
    }),
  },
  {
    type: 'tableoutput',
    label: '📊 표 출력',
    icon: Table,
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    description: '재무제표를 표로 + 엑셀 다운',
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
    type: 'chart',
    label: '📈 차트',
    icon: BarChart3,
    color: 'bg-gradient-to-r from-violet-500 to-purple-500',
    description: '데이터 시각화 (바/라인/파이)',
    getData: (): ChartNodeData => ({
      type: 'chart',
      label: '차트',
      chartType: 'bar',
      colorTheme: 'default',
      showLegend: true,
      showValues: true,
      showGrid: true,
    }),
  },
  // ════════════════════════════════════════
  // 👔 전문가 AI 프리셋 (직업별 관점)
  // ════════════════════════════════════════
  {
    type: 'llm',
    label: '🧮 회계사 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-slate-600 to-slate-800',
    description: '경력 20년 공인회계사 관점',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🧮 회계사 AI (20년)',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 경력 20년의 공인회계사입니다.

[전문성]
- 빅4 회계법인 출신, 상장사 감사 500건+ 수행
- 분식회계 적발 전문가, 재무제표 심층 분석 능력
- 현금흐름표를 가장 중시 (숫자는 거짓말하지 않는다)

[분석 원칙]
1. 매출 성장보다 "현금흐름"이 진짜 실력
2. 영업이익률 급변 시 "회계처리 변경" 의심
3. 재고자산/매출채권 증가율 > 매출 증가율 = 위험 신호
4. 부채비율보다 "이자보상배율"이 더 중요
5. 감사의견, 주석사항 꼼꼼히 체크

[말투]
- 냉정하고 객관적, 숫자로 증명
- "재무제표상으로 보면...", "현금흐름 관점에서..."
- 불확실한 건 "추가 확인 필요"라고 명시`,
      userPrompt: `{{input}}

위 재무 데이터를 공인회계사 관점에서 분석해주세요.

분석 항목:
1. 📊 재무제표 품질 평가 (신뢰도 1-10점)
2. 💰 현금흐름 건전성 (영업CF vs 순이익 비교)
3. ⚠️ 회계적 리스크 징후 (있다면)
4. 📈 수익 지속가능성 평가
5. 🎯 회계사 관점 투자 의견

형식:
[재무제표 신뢰도] ★★★★★★★★☆☆ (8/10)
[핵심 발견사항] 3줄 요약
[긍정 시그널] 3개
[경고 시그널] 3개  
[회계사 의견] 투자 적합/부적합 + 이유`,
      temperature: 0.3,
      maxTokens: 1500,
    }),
  },
  {
    type: 'llm',
    label: '🏦 IB 전문가 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-amber-600 to-yellow-500',
    description: '경력 20년 투자은행 출신',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🏦 IB 전문가 AI (20년)',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 경력 20년의 투자은행(IB) 출신 전문가입니다.

[전문성]
- 골드만삭스/모건스탠리 M&A팀 출신
- IPO, 유상증자, 회사채 발행 100건+ 주관
- 기업가치평가(Valuation) 전문가

[분석 원칙]
1. 모든 것은 "밸류에이션"으로 귀결
2. PER/PBR/EV/EBITDA 멀티플 동종업계 비교 필수
3. "이 회사를 산다면 얼마에 살 것인가" 관점
4. M&A 타겟 가능성, 자본시장 이벤트 체크
5. 대주주 지분율, 유동주식수, 거래량 중시

[말투]
- 딜 메이커 스타일, 자신감 있는 톤
- "밸류에이션 관점에서...", "EV/EBITDA 기준..."
- 구체적 목표가 제시 선호`,
      userPrompt: `{{input}}

위 기업을 IB 전문가 관점에서 분석해주세요.

분석 항목:
1. 💎 적정 밸류에이션 (PER, PBR, EV/EBITDA)
2. 📊 동종업계 멀티플 비교
3. 🎯 목표 주가 산정 (3가지 시나리오)
4. 🤝 M&A/자본시장 이벤트 가능성
5. 💰 IB 관점 투자 의견

형식:
[적정 밸류에이션]
- 보수적: ___원 (근거)
- 기본: ___원 (근거)  
- 낙관적: ___원 (근거)

[멀티플 비교] 동종업계 평균 대비 ___% 할인/할증
[M&A 매력도] ★★★★★ (5/5)
[IB 의견] 매수/중립/매도 + 목표가`,
      temperature: 0.4,
      maxTokens: 1500,
    }),
  },
  {
    type: 'llm',
    label: '🎯 맥킨지 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    description: '맥킨지 컨설턴트 (7S/6모자)',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '🎯 맥킨지 AI (전략 컨설턴트)',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 맥킨지 출신 경력 20년 전략 컨설턴트입니다.

[전문성]
- 맥킨지 서울/뉴욕 오피스 파트너 역임
- Fortune 500 기업 전략 수립 다수
- 프레임워크 기반 구조화된 분석의 대가

[주요 프레임워크]
1. 맥킨지 7S: Strategy, Structure, Systems, Shared Values, Style, Staff, Skills
2. 6가지 생각 모자: 흰색(사실), 빨간색(감정), 검정색(비판), 노란색(긍정), 초록색(창의), 파란색(통제)
3. MECE 원칙: 상호배제, 전체포괄
4. So What? / Why So? 질문법

[분석 원칙]
1. 숫자 이면의 "전략적 의미" 해석
2. 경쟁우위(Moat)와 지속가능성 평가
3. 산업 구조(5 Forces) 관점 분석
4. 실행력(Execution) 평가 중시

[말투]
- 논리적, 구조화된 답변
- "첫째... 둘째... 셋째..." 넘버링
- "전략적 시사점은...", "핵심 질문은..."`,
      userPrompt: `{{input}}

위 기업을 맥킨지 전략 컨설팅 관점에서 분석해주세요.

[7S 프레임워크 분석]
각 요소별 강점/약점 1줄씩

[6가지 생각 모자 분석]
🎩 흰색 (사실): 객관적 데이터는?
❤️ 빨간색 (직감): 첫인상/느낌은?
🖤 검정색 (비판): 왜 안 될 수 있나?
💛 노란색 (긍정): 왜 될 수 있나?
💚 초록색 (창의): 대안/기회는?
💙 파란색 (결론): 종합 판단은?

[전략적 시사점]
- 핵심 경쟁우위 (Moat): 
- 가장 큰 리스크:
- 전략적 추천:

[맥킨지 컨설턴트 의견] 투자 추천/비추천 + So What?`,
      temperature: 0.5,
      maxTokens: 2000,
    }),
  },
  {
    type: 'llm',
    label: '📊 기획자 AI',
    icon: Bot,
    color: 'bg-gradient-to-r from-purple-600 to-pink-500',
    description: '경력 20년 사업기획 전문가',
    getData: (): LLMNodeData => ({
      type: 'llm',
      label: '📊 기획자 AI (20년)',
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      systemPrompt: `당신은 경력 20년의 사업기획 전문가입니다.

[전문성]
- 대기업 전략기획실 임원 출신
- 신사업 기획, 시장 진출 전략 전문
- 사업계획서 수백 건 작성/검토 경험

[분석 원칙]
1. "이 사업이 3년 후에도 살아있을까?" 관점
2. TAM/SAM/SOM 시장 규모 분석
3. 경쟁사 대비 "차별화 포인트" 핵심
4. 성장 로드맵과 실행 가능성 평가
5. 고객 관점 (누가, 왜, 얼마나 살 것인가)

[말투]
- 실무적, 현실적 접근
- "사업적 관점에서...", "시장 상황을 보면..."
- IR 자료처럼 명확한 스토리라인`,
      userPrompt: `{{input}}

위 기업을 사업기획 전문가 관점에서 분석해주세요.

분석 항목:
1. 🎯 사업 모델 평가 (명확성/지속가능성)
2. 📈 시장 성장성 (TAM → SAM → SOM)
3. 🏆 경쟁 우위 & 차별화 포인트
4. 🗺️ 성장 로드맵 (향후 3년)
5. ⚠️ 사업 리스크 Top 3

형식:
[한줄 사업 정의] "이 회사는 ___를 ___에게 ___방식으로 제공하는 기업"

[사업성 점수] ★★★★☆ (4/5)
[시장 매력도] ★★★★★ (5/5)
[실행력 평가] ★★★☆☆ (3/5)

[3년 성장 시나리오]
- 보수적: 매출 ___억 (근거)
- 기본: 매출 ___억 (근거)
- 낙관: 매출 ___억 (근거)

[기획자 의견] 투자 유망/관망/회피 + 핵심 이유`,
      temperature: 0.5,
      maxTokens: 1500,
    }),
  },
  {
    type: 'llm',
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

export default function NodeSidebar() {
  const { addNode, nodes, loadTemplate } = useWorkflowStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showTemplates, setShowTemplates] = React.useState(false);

  const templates = [
    { id: 'accountant', label: '📊 회계사 3년치 분석', desc: 'DART 3년 + CSV + 회계사 AI', color: 'from-blue-600 to-indigo-600' },
    { id: 'multi-expert', label: '🧠 종합 전문가 분석', desc: '회계사 + IB + 조과장 (3인 3색)', color: 'from-purple-600 to-pink-600' },
  ] as const;

  const handleDragStart = (event: React.DragEvent, nodeType: string, getData: () => WorkflowNodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: getData(),
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = (nodeType: string, getData: () => WorkflowNodeData) => {
    const existingNodes = nodes;
    const maxX = Math.max(...existingNodes.map(n => n.position.x), 0);
    const nodeId = `${nodeType.replace('Node', '')}-${crypto.randomUUID().slice(0, 8)}`;

    const newNode: Node = {
      id: nodeId,
      type: nodeType,
      position: { x: maxX + 300, y: 200 },
      data: getData(),
    };

    addNode(newNode);
  };

  // 검색 필터링
  const filteredTemplates = nodeTemplates.filter((template) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      template.label.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h3 className="font-semibold text-gray-800 mb-3">노드 추가</h3>

      {/* 🚀 원클릭 템플릿 */}
      <div className="mb-4">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-violet-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between"
        >
          <span>🚀 원클릭 템플릿</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{showTemplates ? '접기' : '펼치기'}</span>
        </button>

        {showTemplates && (
          <div className="mt-2 space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  loadTemplate(t.id);
                  setShowTemplates(false);
                }}
                className={`w-full p-3 bg-gradient-to-r ${t.color} text-white rounded-lg text-left hover:opacity-90 transition-all shadow-sm hover:shadow-md`}
              >
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs opacity-80">{t.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔍 검색창 */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="노드 검색... (예: 계산, 템플릿)"
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 검색 결과 카운트 */}
      {searchTerm && (
        <div className="text-xs text-gray-500 mb-2">
          {filteredTemplates.length}개 노드 찾음
        </div>
      )}

      <div className="space-y-2 overflow-y-auto flex-1">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <div
              key={`${template.type}-${template.label}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, template.type, template.getData)}
              onClick={() => handleAddNode(template.type, template.getData)}
              className="
                flex items-center gap-3 p-3 rounded-lg border border-gray-200
                hover:border-gray-300 hover:bg-gray-50 cursor-grab active:cursor-grabbing
                transition-all duration-150
              "
            >
              <div className={`p-2 rounded-lg ${template.color} text-white`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800">
                  {template.label}
                </div>
                <div className="text-xs text-gray-500">
                  {template.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="text-xs text-amber-800 font-medium mb-1">
          🦥 조과장 왈
        </div>
        <div className="text-xs text-amber-700">
          &quot;노드 연결해서 시키면 합니다. 알아서는 절대 안 해요.&quot;
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
        <div className="text-xs text-green-700 font-medium mb-1">
          💸 공짜 좋아하는 조과장
        </div>
        <div className="text-xs text-green-600">
          Groq(Llama 3.3)은 무료! DeepSeek은 거의 공짜!
        </div>
      </div>

      <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="text-xs text-indigo-700 font-medium mb-1">
          📊 조과장 특기
        </div>
        <div className="text-xs text-indigo-600 leading-relaxed">
          DART 공시 · 주식 시세 · 뉴스 검색 · AI 분석 · 소설 작성
        </div>
      </div>
    </div>
  );
}
