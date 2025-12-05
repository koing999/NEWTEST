'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ListTodo, CheckCircle2, Circle, Clock, Flag } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { TaskBreakdownNodeData, TaskItem } from '@/types/workflow';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
};

function TaskBreakdownNode({ id, data, selected }: NodeProps<TaskBreakdownNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const statusColor = {
    idle: 'border-gray-200',
    running: 'border-indigo-400 shadow-lg shadow-indigo-100',
    success: 'border-green-400',
    error: 'border-red-400',
  }[result?.status || 'idle'];

  const styleLabels = {
    'steps': '📋 단계별',
    'checklist': '✅ 체크리스트',
    'mindmap': '🧠 마인드맵',
  };

  // 결과에서 tasks 파싱
  const parseTasks = (): TaskItem[] => {
    if (!data.tasks) return [];
    return data.tasks;
  };

  const tasks = parseTasks();

  return (
    <div
      className={`
        bg-white rounded-xl border-2 ${statusColor}
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
        shadow-md hover:shadow-lg transition-all duration-200
        min-w-[260px] max-w-[320px]
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <ListTodo size={18} />
        <span className="font-medium">{data.label || '작업 분해'}</span>
        {result?.status === 'running' && (
          <div className="ml-auto animate-spin">
            <Circle size={14} className="text-white/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* 스타일 배지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
            {styleLabels[data.breakdownStyle] || '단계별'}
          </span>
          <span className="text-xs text-gray-400">
            최대 {data.maxSteps || 5}단계
          </span>
        </div>

        {/* 실행 전 안내 */}
        {!tasks.length && !result?.status && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">🧠 AI 심층사고 모드</div>
            <div>복잡한 작업을 입력하면 단계별로 분해해드려요</div>
          </div>
        )}

        {/* 실행 중 */}
        {result?.status === 'running' && (
          <div className="text-xs text-indigo-600 bg-indigo-50 p-3 rounded-lg animate-pulse">
            <div className="font-medium">🤔 분석 중...</div>
            <div>작업을 단계별로 쪼개고 있어요</div>
          </div>
        )}

        {/* 결과: 작업 목록 */}
        {tasks.length > 0 && (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {tasks.map((task, index) => (
              <div
                key={task.id || index}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-xs"
              >
                <div className="mt-0.5">
                  {task.completed ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <Circle size={14} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700 flex items-center gap-1">
                    <span className="text-indigo-500">{index + 1}.</span>
                    {task.title}
                    {task.priority && (
                      <Flag size={10} className={priorityColors[task.priority]} />
                    )}
                  </div>
                  {task.description && (
                    <div className="text-gray-500 mt-0.5 truncate">
                      {task.description}
                    </div>
                  )}
                  {task.timeEstimate && (
                    <div className="flex items-center gap-1 text-gray-400 mt-1">
                      <Clock size={10} />
                      {task.timeEstimate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 에러 */}
        {result?.status === 'error' && (
          <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
            ❌ {result.error}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(TaskBreakdownNode);
