'use client';

import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { nodeResults } = useWorkflowStore();
  
  // 소스 노드의 실행 상태 확인
  const sourceResult = nodeResults[source];
  const targetResult = nodeResults[target];
  
  // 상태에 따른 색상
  let strokeColor = '#94a3b8'; // 기본: 회색
  let isAnimated = false;
  let glowEffect = false;
  
  if (sourceResult?.status === 'running') {
    // 실행 중: 노란색 + 애니메이션
    strokeColor = '#eab308';
    isAnimated = true;
  } else if (sourceResult?.status === 'success') {
    // 성공: 초록색 + 글로우
    strokeColor = '#22c55e';
    glowEffect = true;
    
    if (targetResult?.status === 'running') {
      // 데이터가 다음 노드로 전달 중
      isAnimated = true;
    }
  } else if (sourceResult?.status === 'error') {
    // 에러: 빨간색
    strokeColor = '#ef4444';
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* 글로우 효과 (성공 시) */}
      {glowEffect && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={8}
          strokeOpacity={0.3}
          className="animate-pulse"
        />
      )}
      
      {/* 메인 엣지 */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        style={style}
        markerEnd={markerEnd}
        className={isAnimated ? 'animate-flow' : ''}
      />
      
      {/* 데이터 흐름 애니메이션 (점) */}
      {isAnimated && (
        <circle r={4} fill={strokeColor}>
          <animateMotion dur="1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      
      {/* 연결 상태 표시 */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {sourceResult?.status === 'success' && (
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-once">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {sourceResult?.status === 'running' && (
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-spin">
              <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-1.5" />
            </div>
          )}
          {sourceResult?.status === 'error' && (
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
