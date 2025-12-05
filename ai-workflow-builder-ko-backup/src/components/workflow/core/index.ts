/**
 * Core 워크플로우 컴포넌트 모듈
 * 
 * n8n/Activepieces 패턴을 적용한 통합 컴포넌트들:
 * - UnifiedNode: 모든 노드 타입의 통합 렌더러
 * - NodeInputHandler: 통합 설정 패널
 * - CanvasControls: 캔버스 컨트롤 및 단축키
 * 
 * @author AI 워크플로우 빌더 팀
 */

// 통합 노드 컴포넌트
export { 
  default as UnifiedNode, 
  UnifiedNode as UnifiedNodeComponent,
  NODE_CATEGORIES, 
  CATEGORY_STYLES 
} from './UnifiedNode';
export type { NodeCategory } from './UnifiedNode';

// 통합 입력 핸들러
export { default as NodeInputHandler, NODE_INPUT_FIELDS } from './NodeInputHandler';
export type { InputFieldConfig, InputFieldType } from './NodeInputHandler';

// 캔버스 컨트롤
export { 
  default as CanvasControls, 
  CanvasMinimap, 
  useKeyboardShortcuts,
  KEYBOARD_SHORTCUTS,
} from './CanvasControls';

// 카테고리별 렌더러
export { 
  getCategoryRenderer, 
  getNodeCategory, 
  getNodeTypesByCategory,
  CategoryContent 
} from '../nodes/getCategoryRenderer';
