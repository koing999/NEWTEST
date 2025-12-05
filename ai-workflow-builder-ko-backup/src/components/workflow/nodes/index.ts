/**
 * 카테고리별 노드 렌더러 모듈
 * 
 * n8n/Activepieces 패턴 적용:
 * - AI 노드 (LLM, MultiAgent, AIRouter 등)
 * - 외부 연동 노드 (API, Webhook, Code)
 * - 제어 흐름 노드 (Condition, Loop, Parallel)
 * - 데이터 처리 노드 (Transform, Template, Math)
 * - 금융 특화 노드 (StockAlert, Chart, Table)
 * - 입출력 노드 (Input, Output, FileSave)
 * 
 * @author AI 워크플로우 빌더 팀
 */

// 카테고리별 콘텐츠 렌더러
export { AINodeContent } from './AINodeContent';
export { ExternalNodeContent } from './ExternalNodeContent';
export { ControlNodeContent } from './ControlNodeContent';
export { DataNodeContent } from './DataNodeContent';
export { FinanceNodeContent } from './FinanceNodeContent';
export { IONodeContent } from './IONodeContent';

// 렌더러 선택 유틸리티
export { getCategoryRenderer } from './getCategoryRenderer';
