'use client';

/**
 * 카테고리별 렌더러 선택 유틸리티
 * 
 * 노드 타입에 따라 적절한 콘텐츠 렌더러를 반환합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { NodeType } from '@/types/workflow';
import { NODE_CATEGORIES, NodeCategory } from '../core/UnifiedNode';
import { AINodeContent } from './AINodeContent';
import { ExternalNodeContent } from './ExternalNodeContent';
import { ControlNodeContent } from './ControlNodeContent';
import { DataNodeContent } from './DataNodeContent';
import { FinanceNodeContent } from './FinanceNodeContent';
import { IONodeContent } from './IONodeContent';

// ============================================
// 타입 정의
// ============================================

interface NodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: any;
    error?: string;
    [key: string]: any;
  };
}

type ContentRenderer = React.ComponentType<NodeContentProps>;

// ============================================
// 카테고리별 렌더러 매핑
// ============================================

const CATEGORY_RENDERERS: Record<NodeCategory, ContentRenderer> = {
  ai: AINodeContent,
  external: ExternalNodeContent,
  control: ControlNodeContent,
  data: DataNodeContent,
  finance: FinanceNodeContent,
  io: IONodeContent,
  other: IONodeContent, // Note 노드는 IO 렌더러에서 처리
};

// ============================================
// 메인 함수
// ============================================

/**
 * 노드 타입에 따라 적절한 콘텐츠 렌더러를 반환합니다.
 * 
 * @param nodeType - 노드 타입
 * @returns 카테고리에 맞는 콘텐츠 렌더러 컴포넌트
 */
export function getCategoryRenderer(nodeType: NodeType): ContentRenderer {
  const category = NODE_CATEGORIES[nodeType] || 'other';
  return CATEGORY_RENDERERS[category];
}

/**
 * 노드 타입의 카테고리를 반환합니다.
 * 
 * @param nodeType - 노드 타입
 * @returns 노드 카테고리
 */
export function getNodeCategory(nodeType: NodeType): NodeCategory {
  return NODE_CATEGORIES[nodeType] || 'other';
}

/**
 * 모든 노드 타입을 카테고리별로 그룹화합니다.
 * 
 * @returns 카테고리별 노드 타입 배열
 */
export function getNodeTypesByCategory(): Record<NodeCategory, NodeType[]> {
  const result: Record<NodeCategory, NodeType[]> = {
    ai: [],
    external: [],
    control: [],
    data: [],
    finance: [],
    io: [],
    other: [],
  };

  Object.entries(NODE_CATEGORIES).forEach(([nodeType, category]) => {
    result[category].push(nodeType as NodeType);
  });

  return result;
}

// ============================================
// 콘텐츠 렌더러 래퍼 컴포넌트
// ============================================

/**
 * 노드 타입에 따라 적절한 콘텐츠를 렌더링하는 래퍼 컴포넌트
 */
export function CategoryContent({ nodeType, data, nodeResult }: NodeContentProps) {
  const Renderer = getCategoryRenderer(nodeType);
  return <Renderer nodeType={nodeType} data={data} nodeResult={nodeResult} />;
}

export default getCategoryRenderer;
