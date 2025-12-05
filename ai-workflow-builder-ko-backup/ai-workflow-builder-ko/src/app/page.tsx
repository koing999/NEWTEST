'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import WorkflowToolbar from '@/components/workflow/WorkflowToolbar';
import NodeSidebar from '@/components/workflow/NodeSidebar';
import NodeConfigPanel from '@/components/workflow/NodeConfigPanel';
import NovelSidebar from '@/components/novel/NovelSidebar';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { WorkflowExecutionResult } from '@/types/workflow';
import { BookOpen, Workflow } from 'lucide-react';

// React Flow SSR 문제 방지를 위한 동적 임포트
const WorkflowCanvas = dynamic(
  () => import('@/components/workflow/WorkflowCanvas'),
  { ssr: false }
);

type ViewMode = 'workflow' | 'novel';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('workflow');
  
  const {
    nodes,
    edges,
    setExecutionStatus,
    setNodeResult,
    setExecutionResult,
    updateNodeData,
  } = useWorkflowStore();

  const handleRun = useCallback(async () => {
    setExecutionStatus('running');
    
    try {
      // 모든 노드를 실행 중 상태로 변경
      nodes.forEach(node => {
        setNodeResult(node.id, {
          nodeId: node.id,
          status: 'running',
        });
      });

      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || '실행 실패');
      }

      const result: WorkflowExecutionResult = await response.json();

      // 노드 결과 및 데이터 업데이트
      Object.entries(result.nodeResults).forEach(([nodeId, nodeResult]) => {
        setNodeResult(nodeId, nodeResult);
        
        // 결과로 노드 데이터 업데이트
        if (nodeResult.status === 'success' && nodeResult.output) {
          updateNodeData(nodeId, {
            result: nodeResult.output,
            usage: nodeResult.usage,
            cost: nodeResult.cost,
            latency: nodeResult.endTime && nodeResult.startTime 
              ? nodeResult.endTime - nodeResult.startTime 
              : undefined,
          });
        }
      });

      setExecutionResult(result);
      setExecutionStatus(result.status);
    } catch (error) {
      console.error('워크플로우 실행 오류:', error);
      setExecutionStatus('error');
      
      alert(`실행 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [nodes, edges, setExecutionStatus, setNodeResult, setExecutionResult, updateNodeData]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 툴바 */}
      <div className="flex items-center">
        {/* 모드 토글 */}
        <div className="h-14 bg-white border-b border-r border-gray-200 px-2 flex items-center gap-1">
          <button
            onClick={() => setViewMode('workflow')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'workflow'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="워크플로우 모드"
          >
            <Workflow size={16} />
            <span className="hidden md:inline">워크플로우</span>
          </button>
          <button
            onClick={() => setViewMode('novel')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'novel'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="소설 작성 모드"
          >
            <BookOpen size={16} />
            <span className="hidden md:inline">소설 작성</span>
          </button>
        </div>
        
        <div className="flex-1">
          <WorkflowToolbar onRun={handleRun} />
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 모드에 따라 변경 */}
        {viewMode === 'workflow' ? (
          <NodeSidebar />
        ) : (
          <NovelSidebar />
        )}
        
        {/* 캔버스 */}
        <WorkflowCanvas />
        
        {/* 오른쪽 사이드바 - 노드 설정 */}
        <NodeConfigPanel />
      </div>
    </div>
  );
}
