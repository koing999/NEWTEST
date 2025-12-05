/**
 * 다중 입력 병합 유틸리티
 * 
 * 워크플로우에서 여러 노드의 출력을 AI가 구분할 수 있도록 
 * 구조화된 형식으로 병합합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 */

// ============================================
// 타입 정의
// ============================================

/**
 * 구조화된 입력 아이템
 */
export interface StructuredInputItem {
  /** 소스 노드 ID */
  nodeId: string;
  /** 소스 노드 라벨 */
  label: string;
  /** 출력 데이터 */
  output: string;
  /** 노드 타입 */
  nodeType?: string;
  /** 순서 인덱스 */
  index: number;
}

/**
 * 입력 메타데이터
 */
export interface InputMetadata {
  /** 총 입력 개수 */
  totalInputs: number;
  /** 소스 노드 ID 목록 */
  sourceNodeIds: string[];
  /** 소스 노드 라벨 목록 */
  sourceLabels: string[];
  /** 병합 방식 */
  mergeType: 'structured' | 'simple';
  /** 생성 시각 */
  timestamp: string;
}

/**
 * 병합 옵션
 */
export interface MergeOptions {
  /** 메타데이터 포함 여부 */
  includeMetadata?: boolean;
  /** 구분선 스타일 */
  separatorStyle?: 'simple' | 'double' | 'numbered';
  /** 최대 문자 수 (0이면 무제한) */
  maxLength?: number;
  /** 말줄임 표시 */
  truncateIndicator?: string;
}

// ============================================
// 노드 타입별 이모지
// ============================================

const NODE_EMOJI_MAP: Record<string, string> = {
  input: '📥',
  llm: '🤖',
  transform: '🔄',
  output: '📤',
  condition: '🔀',
  loop: '🔁',
  api: '🌐',
  delay: '⏰',
  webhook: '🔔',
  random: '🎲',
  slice: '✂️',
  datetime: '📅',
  filesave: '💾',
  taskbreakdown: '📋',
  state: '💾',
  airouter: '🧭',
  approval: '✅',
  note: '📝',
  code: '💻',
  parallel: '⚡',
  template: '📄',
  htmlclean: '🧹',
  math: '🔢',
  formula: '📊',
  multifilter: '🔍',
  stockalert: '📈',
  multiagent: '👥',
  compareinput: '⚖️',
  tableoutput: '📋',
  chart: '📊',
  intentparser: '🧠',
  smartanalysis: '🔮',
};

/**
 * 노드 타입에 맞는 이모지 가져오기
 */
export function getNodeEmoji(nodeType?: string): string {
  return nodeType ? (NODE_EMOJI_MAP[nodeType] || '📄') : '📄';
}

// ============================================
// 입력 병합 함수
// ============================================

/**
 * 단일 입력을 구조화된 형식으로 변환
 */
export function formatSingleInput(item: StructuredInputItem): string {
  const emoji = getNodeEmoji(item.nodeType);
  return `${emoji} [자료 ${item.index + 1}: ${item.label}]\n${item.output}`;
}

/**
 * 다중 입력을 구조화된 형식으로 병합
 */
export function mergeMultipleInputs(
  inputs: StructuredInputItem[],
  options: MergeOptions = {}
): string {
  const {
    includeMetadata = true,
    separatorStyle = 'double',
    maxLength = 0,
    truncateIndicator = '...(생략됨)',
  } = options;

  if (inputs.length === 0) {
    return '';
  }

  // 단일 입력
  if (inputs.length === 1) {
    const formatted = formatSingleInput(inputs[0]);
    return applyLengthLimit(formatted, maxLength, truncateIndicator);
  }

  // 구분선 스타일
  const separators: Record<string, string> = {
    simple: '\n\n---\n\n',
    double: '\n\n═══════════════════════════════════\n\n',
    numbered: '', // 번호가 이미 포함됨
  };

  const separator = separators[separatorStyle] || separators.simple;

  // 각 입력 포맷팅
  const formattedInputs = inputs.map(formatSingleInput);

  // 병합
  let merged = formattedInputs.join(separator);

  // 메타데이터 추가
  if (includeMetadata) {
    const metadata: InputMetadata = {
      totalInputs: inputs.length,
      sourceNodeIds: inputs.map(i => i.nodeId),
      sourceLabels: inputs.map(i => i.label),
      mergeType: 'structured',
      timestamp: new Date().toISOString(),
    };
    
    merged = `<!-- INPUT_META: ${JSON.stringify(metadata)} -->\n\n${merged}`;
  }

  return applyLengthLimit(merged, maxLength, truncateIndicator);
}

/**
 * 길이 제한 적용
 */
function applyLengthLimit(
  text: string, 
  maxLength: number, 
  indicator: string
): string {
  if (maxLength <= 0 || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - indicator.length) + indicator;
}

// ============================================
// 입력 메타데이터 파싱
// ============================================

/**
 * 병합된 입력에서 메타데이터 추출
 */
export function parseInputMetadata(input: string): InputMetadata | null {
  const metaMatch = input.match(/<!-- INPUT_META: ({.*?}) -->/);
  if (!metaMatch) return null;
  
  try {
    return JSON.parse(metaMatch[1]) as InputMetadata;
  } catch {
    return null;
  }
}

/**
 * 메타데이터 제거된 순수 입력 반환
 */
export function stripInputMetadata(input: string): string {
  return input.replace(/<!-- INPUT_META: {.*?} -->\n\n?/g, '');
}

/**
 * 다중 입력인지 확인
 */
export function isMultiInput(input: string): boolean {
  const metadata = parseInputMetadata(input);
  return metadata !== null && metadata.totalInputs > 1;
}

/**
 * 입력 개수 가져오기
 */
export function getInputCount(input: string): number {
  const metadata = parseInputMetadata(input);
  return metadata?.totalInputs ?? 1;
}

// ============================================
// AI 프롬프트 빌더
// ============================================

/**
 * 다중 입력용 AI 프롬프트 생성
 */
export function buildMultiInputPrompt(
  input: string,
  basePrompt: string,
  analysisType: string = 'general'
): string {
  const metadata = parseInputMetadata(input);
  
  if (!metadata || metadata.totalInputs <= 1) {
    return basePrompt;
  }

  const sourceInfo = metadata.sourceLabels.map((label, i) => 
    `  - 자료 ${i + 1}: ${label}`
  ).join('\n');

  const multiInputGuide = `
📚 **다중 자료 분석 요청**
총 ${metadata.totalInputs}개의 자료가 입력되었습니다:
${sourceInfo}

분석 시 각 자료를 명확히 구분하여 분석해주세요.
자료 간 비교나 통합 분석이 필요한 경우 종합적인 결론도 제시해주세요.

`;

  return multiInputGuide + basePrompt;
}

// ============================================
// 레거시 호환 함수
// ============================================

/**
 * 기존 코드와의 호환성을 위한 간단한 병합
 * @deprecated mergeMultipleInputs 사용 권장
 */
export function legacyMergeInputs(
  outputs: Array<{ nodeId: string; label: string; output: string; nodeType?: string }>
): string {
  const items: StructuredInputItem[] = outputs.map((o, index) => ({
    ...o,
    index,
  }));
  
  return mergeMultipleInputs(items, { includeMetadata: true });
}

// ============================================
// 내보내기
// ============================================

export default {
  getNodeEmoji,
  formatSingleInput,
  mergeMultipleInputs,
  parseInputMetadata,
  stripInputMetadata,
  isMultiInput,
  getInputCount,
  buildMultiInputPrompt,
  legacyMergeInputs,
};
