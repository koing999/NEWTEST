/**
 * AI 워크플로우 빌더 - 핵심 타입 정의
 * 
 * 노드, 워크플로우, 실행 결과, LLM 통신에 사용되는 모든 타입을 정의합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

// ============================================
// 노드 타입
// ============================================

/** 워크플로우에서 사용 가능한 노드 타입 */
export type NodeType = 'input' | 'llm' | 'transform' | 'output' | 'condition' | 'loop' | 'api' | 'delay' | 'webhook' | 'random' | 'slice' | 'datetime' | 'filesave' | 'taskbreakdown' | 'state' | 'airouter' | 'approval' | 'note' | 'code' | 'parallel' | 'template' | 'htmlclean' | 'math' | 'formula' | 'multifilter' | 'stockalert';

/** 지원하는 AI 제공자 */
export type LLMProvider = 
  | 'openai'      // OpenAI (GPT)
  | 'anthropic'   // Anthropic (Claude)
  | 'gemini'      // Google Gemini
  | 'groq'        // Groq (무료!)
  | 'deepseek'    // DeepSeek (저렴!)
  | 'xai'         // xAI (Grok)
  | 'perplexity'  // Perplexity (검색 특화)
  | 'mistral'     // Mistral AI
  | 'cohere'      // Cohere
  | 'moonshot';   // Moonshot (Kimi)

/** 지원하는 AI 모델 */
export type LLMModel = 
  // ===== OpenAI =====
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'o1-preview'
  | 'o1-mini'
  
  // ===== Anthropic (Claude) =====
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  
  // ===== Google Gemini =====
  | 'gemini-2.0-flash'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  
  // ===== Groq (무료!) =====
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'
  
  // ===== DeepSeek (저렴!) =====
  | 'deepseek-chat'
  | 'deepseek-coder'
  | 'deepseek-reasoner'
  
  // ===== xAI (Grok) =====
  | 'grok-beta'
  | 'grok-2'
  | 'grok-2-mini'
  
  // ===== Perplexity (검색 특화) =====
  | 'sonar-pro'
  | 'sonar'
  | 'sonar-reasoning'
  
  // ===== Mistral =====
  | 'mistral-large-latest'
  | 'mistral-small-latest'
  | 'codestral-latest'
  | 'pixtral-large-latest'
  
  // ===== Cohere =====
  | 'command-r-plus'
  | 'command-r'
  | 'command-light'
  
  // ===== Moonshot (Kimi) =====
  | 'moonshot-v1-128k'
  | 'moonshot-v1-32k'
  | 'moonshot-v1-8k';

// ============================================
// 노드 데이터 타입
// ============================================

/** 모든 노드가 공유하는 기본 속성 */
export interface BaseNodeData {
  label: string;
  description?: string;
}

/** 입력 노드 - 사용자 텍스트 또는 파일 입력 */
export interface InputNodeData extends BaseNodeData {
  type: 'input';
  inputType: 'text' | 'file' | 'json';
  value: string;
  placeholder?: string;
}

/** LLM 노드 - AI로 입력 처리 */
export interface LLMNodeData extends BaseNodeData {
  type: 'llm';
  provider: LLMProvider;
  model: LLMModel;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  // 실행 후 채워짐
  result?: string;
  usage?: TokenUsage;
  cost?: number;
  latency?: number;
}

/** 변환 노드 - 데이터 조작 */
export interface TransformNodeData extends BaseNodeData {
  type: 'transform';
  transformType: 'json-extract' | 'text-split' | 'regex' | 'template';
  config: TransformConfig;
  result?: string;
}

/** 변환 설정 옵션 */
export interface TransformConfig {
  jsonPath?: string;      // json-extract용
  delimiter?: string;     // text-split용
  pattern?: string;       // regex용
  template?: string;      // template용
}

/** 출력 노드 - 결과 표시 */
export interface OutputNodeData extends BaseNodeData {
  type: 'output';
  outputType: 'text' | 'json' | 'markdown';
  result?: string;
}

/** 조건 노드 - IF/ELSE 분기 */
export interface ConditionNodeData extends BaseNodeData {
  type: 'condition';
  conditionType: 'contains' | 'equals' | 'greater' | 'less' | 'regex' | 'empty' | 'not-empty';
  conditionValue: string;  // 비교할 값
  caseSensitive?: boolean;
  result?: 'true' | 'false';
}

/** 반복 노드 - Loop */
export interface LoopNodeData extends BaseNodeData {
  type: 'loop';
  loopType: 'count' | 'foreach' | 'while';
  maxIterations: number;
  delimiter?: string;  // foreach용 구분자
  condition?: string;  // while용 조건
  currentIndex?: number;
  results?: string[];
}

/** API 호출 노드 - 외부 API 연동 */
export interface ApiNodeData extends BaseNodeData {
  type: 'api';
  // 기본 설정
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  // 프리셋
  preset?: 'custom' | 'dart' | 'stock-kr' | 'stock-us' | 'news' | 'weather';
  // 프리셋별 설정
  presetConfig?: {
    // DART
    dartApiKey?: string;
    corpCode?: string;  // 기업코드
    reportType?: 'disclosure' | 'financial' | 'dividend';  // 공시, 재무제표, 배당
    // 주식
    stockCode?: string;  // 종목코드
    market?: 'kospi' | 'kosdaq' | 'nyse' | 'nasdaq';
    // 뉴스
    query?: string;
    // 날씨
    city?: string;
  };
  // 결과
  result?: string;
  statusCode?: number;
  latency?: number;
}

/** 딜레이 노드 - 잠깐 쉬어! */
export interface DelayNodeData extends BaseNodeData {
  type: 'delay';
  delayMs: number;  // 밀리초
  reason?: string;  // 왜 쉬는지 (API 제한 등)
}

/** 웹훅/알림 노드 - 다 됐으면 불러 */
export interface WebhookNodeData extends BaseNodeData {
  type: 'webhook';
  webhookType: 'slack' | 'discord' | 'custom';
  webhookUrl: string;
  messageTemplate: string;  // {{input}}, {{result}} 등 사용 가능
  // 슬랙/디스코드 추가 설정
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

/** 랜덤 선택 노드 */
export interface RandomNodeData extends BaseNodeData {
  type: 'random';
  delimiter: string;  // 리스트 구분자
  count: number;      // 몇 개 뽑을지
  allowDuplicate: boolean;  // 중복 허용
  result?: string;
}

/** 텍스트 자르기 노드 */
export interface SliceNodeData extends BaseNodeData {
  type: 'slice';
  sliceType: 'chars' | 'words' | 'lines' | 'tokens';
  start: number;
  end?: number;
  result?: string;
}

/** 날짜/시간 노드 */
export interface DateTimeNodeData extends BaseNodeData {
  type: 'datetime';
  format: 'full' | 'date' | 'time' | 'iso' | 'custom';
  customFormat?: string;  // YYYY-MM-DD 등
  timezone?: string;
  result?: string;
}

/** 파일 저장 노드 (클라이언트 다운로드) */
export interface FileSaveNodeData extends BaseNodeData {
  type: 'filesave';
  fileType: 'txt' | 'json' | 'csv' | 'md';
  filename: string;
  appendDate: boolean;  // 파일명에 날짜 추가
}

/** 작업 분해 노드 - AI가 복잡한 작업을 단계별로 분해 */
export interface TaskBreakdownNodeData extends BaseNodeData {
  type: 'taskbreakdown';
  breakdownStyle: 'steps' | 'checklist' | 'mindmap';  // 분해 스타일
  maxSteps: number;  // 최대 단계 수
  includeTimeEstimate: boolean;  // 예상 소요시간 포함
  includePriority: boolean;  // 우선순위 포함
  customPrompt?: string;  // 커스텀 프롬프트
  // 결과
  tasks?: TaskItem[];
  result?: string;
}

/** Flow State 노드 - 전역 변수 관리 (Flowise 스타일) */
export interface StateNodeData extends BaseNodeData {
  type: 'state';
  operation: 'init' | 'get' | 'set' | 'update';  // 초기화/읽기/쓰기/업데이트
  variables: StateVariable[];  // 변수 목록
  result?: string;
}

/** 상태 변수 정의 */
export interface StateVariable {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

/** AI Router 노드 - AI가 의도 분석해서 경로 결정 (Flowise 스타일) */
export interface AIRouterNodeData extends BaseNodeData {
  type: 'airouter';
  instruction: string;  // AI에게 주는 라우팅 지시
  scenarios: RouterScenario[];  // 가능한 경로들
  result?: string;  // 선택된 시나리오 ID
}

/** 라우터 시나리오 */
export interface RouterScenario {
  id: string;
  name: string;  // "고객지원", "영업문의", "기타" 등
  description: string;  // AI가 판단할 때 사용하는 설명
}

/** Approval 노드 - Human-in-the-Loop (Flowise 스타일) */
export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  message: string;  // 사용자에게 보여줄 메시지
  showInput: boolean;  // 입력 입력받을지
  approveLabel: string;  // 승인 버튼 텍스트
  rejectLabel: string;   // 거절 버튼 텍스트
  timeout?: number;  // 타임아웃 (밀리초)
  result?: 'approved' | 'rejected' | 'timeout';
  userInput?: string;  // 사용자 입력값
}

/** Note 노드 - 워크플로우에 메모/주석 추가 (Langflow 스타일) */
export interface NoteNodeData extends BaseNodeData {
  type: 'note';
  content: string;  // 메모 내용
  backgroundColor?: string;  // 배경색
  textColor?: string;  // 텍스트 색상
}

/** Code 노드 - JavaScript 코드 실행 (Dify/Langflow 스타일) */
export interface CodeNodeData extends BaseNodeData {
  type: 'code';
  code: string;  // JavaScript 코드
  language: 'javascript';  // 현재 JS만 지원
  result?: string;
  error?: string;
}

/** Parallel 노드 - 여러 경로 동시 실행 (Dify 스타일) */
export interface ParallelNodeData extends BaseNodeData {
  type: 'parallel';
  branches: number;  // 병렬 분기 수 (2-5)
  mergeStrategy: 'all' | 'first' | 'any';  // 결과 합치기 전략
  timeout?: number;  // 타임아웃 (밀리초)
  results?: string[];  // 각 분기 결과
}

/** Template 노드 - 빈칸 채우기 (엑셀 치환 스타일) */
export interface TemplateNodeData extends BaseNodeData {
  type: 'template';
  template: string;  // {{name}}, {{date}} 등 변수 포함
  variables: TemplateVariable[];  // 변수 목록
  result?: string;
}

/** 템플릿 변수 */
export interface TemplateVariable {
  key: string;  // 변수명 (name, date 등)
  value: string;  // 기본값 (비워두면 input에서 받음)
  description?: string;  // 설명
}

/** HTML Cleaner 노드 - 태그 청소기 (토큰 절약!) */
export interface HtmlCleanNodeData extends BaseNodeData {
  type: 'htmlclean';
  removeScripts: boolean;  // <script> 제거
  removeStyles: boolean;   // <style> 제거
  removeComments: boolean; // <!-- --> 제거
  keepLinks: boolean;      // <a> href 유지
  keepImages: boolean;     // <img> src 유지
  result?: string;
}

/** Math 노드 - 단순 계산기 (비개발자 친화적!) */
export interface MathNodeData extends BaseNodeData {
  type: 'math';
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'percent' | 'round' | 'floor' | 'ceil' | 'abs';
  value1: string;  // 첫 번째 값 ({{input}} 사용 가능)
  value2?: string; // 두 번째 값 (사칙연산용)
  decimals?: number; // 소수점 자릿수
  result?: string;
}

/** Formula 노드 - 다중 필드 수식 계산 (주식 분석용!) */
export interface FormulaNodeData extends BaseNodeData {
  type: 'formula';
  formulas: FormulaItem[];  // 여러 수식 정의
  inputFields: string[];    // 입력 JSON에서 사용할 필드명 (예: open, high, low, current)
  outputAsJson: boolean;    // 결과를 JSON으로 출력
  result?: string;
}

/** 수식 항목 */
export interface FormulaItem {
  name: string;      // 결과 변수명 (예: highRise)
  formula: string;   // 수식 (예: (high / open - 1) * 100)
  label: string;     // 한글 설명 (예: 고점 상승률)
  decimals?: number; // 소수점 자릿수
}

/** MultiFilter 노드 - 복합 조건 필터 (AND/OR 지원) */
export interface MultiFilterNodeData extends BaseNodeData {
  type: 'multifilter';
  logic: 'AND' | 'OR';  // 조건 결합 방식
  conditions: FilterCondition[];  // 조건 목록
  passThrough: boolean;  // true면 통과하는 항목만, false면 true/false 반환
  result?: string;
}

/** 필터 조건 */
export interface FilterCondition {
  field: string;      // 비교할 필드 (예: highRise)
  operator: '>=' | '<=' | '>' | '<' | '==' | '!=' | 'contains' | 'not-contains';
  value: string;      // 비교값 (숫자 또는 문자열)
  label?: string;     // 조건 설명
}

/** StockAlert 노드 - 주식 급등락 알림 전용 (통합 노드) */
export interface StockAlertNodeData extends BaseNodeData {
  type: 'stockalert';
  // 계산 설정
  openField: string;     // 시가 필드명
  highField: string;     // 장중고가 필드명
  lowField: string;      // 장중저가 필드명
  currentField: string;  // 현재가 필드명
  nameField: string;     // 종목명 필드명
  // 조건 설정
  minHighRise: number;      // 최소 고점 상승률 (%)
  maxDropFromHigh: number;  // 고점 대비 최대 하락폭 (%, 음수)
  minCurrentRise: number;   // 최소 현재 상승률 (%)
  // 출력 설정
  messageTemplate: string;  // 알림 메시지 템플릿
  result?: string;
}

/** 분해된 작업 항목 */
export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  timeEstimate?: string;  // "30분", "2시간" 등
  completed: boolean;
  subTasks?: TaskItem[];
}

/** 모든 노드 데이터 타입의 유니온 */
export type WorkflowNodeData = 
  | InputNodeData 
  | LLMNodeData 
  | TransformNodeData 
  | OutputNodeData
  | ConditionNodeData
  | LoopNodeData
  | ApiNodeData
  | DelayNodeData
  | WebhookNodeData
  | RandomNodeData
  | SliceNodeData
  | DateTimeNodeData
  | FileSaveNodeData
  | TaskBreakdownNodeData
  | StateNodeData
  | AIRouterNodeData
  | ApprovalNodeData
  | NoteNodeData
  | CodeNodeData
  | ParallelNodeData
  | TemplateNodeData
  | HtmlCleanNodeData
  | MathNodeData
  | FormulaNodeData
  | MultiFilterNodeData
  | StockAlertNodeData;

// ============================================
// 워크플로우 구조
// ============================================

/** 워크플로우의 노드 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

/** 노드 간의 연결 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/** 완전한 워크플로우 정의 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 실행 타입
// ============================================

/** 실행 상태 */
export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

/** 토큰 사용량 정보 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** 단일 노드 실행 결과 */
export interface NodeExecutionResult {
  nodeId: string;
  status: ExecutionStatus;
  output?: string;
  error?: string;
  startTime?: number;
  endTime?: number;
  usage?: TokenUsage;
  cost?: number;
}

/** 전체 워크플로우 실행 결과 */
export interface WorkflowExecutionResult {
  workflowId: string;
  status: ExecutionStatus;
  nodeResults: Record<string, NodeExecutionResult>;
  totalCost: number;
  totalTokens: number;
  totalLatency: number;
  startTime: number;
  endTime?: number;
}

// ============================================
// LLM 통신 타입
// ============================================

/** 대화에서의 역할 */
export type MessageRole = 'system' | 'user' | 'assistant';

/** 대화의 단일 메시지 */
export interface LLMMessage {
  role: MessageRole;
  content: string;
}

/** LLM 제공자에 대한 요청 */
export interface LLMRequest {
  provider: LLMProvider;
  model: LLMModel;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

/** LLM 제공자로부터의 응답 */
export interface LLMResponse {
  content: string;
  usage: TokenUsage;
  model: string;
  latency: number;
  cost: number;
}

// ============================================
// 비용 타입
// ============================================

/** 모델 가격 */
export interface ModelCost {
  promptTokenCost: number;     // 1K 토큰당
  completionTokenCost: number; // 1K 토큰당
}

/** 비용 상세 */
export interface CostCalculation {
  promptCost: number;
  completionCost: number;
  totalCost: number;
}
