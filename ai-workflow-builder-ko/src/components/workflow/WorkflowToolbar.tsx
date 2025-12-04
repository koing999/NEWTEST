'use client';

import { useState } from 'react';
import { 
  Play, 
  Square, 
  Save, 
  Upload, 
  Trash2, 
  Loader2,
  DollarSign,
  Clock,
  Zap,
  Download,
} from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { formatCost } from '@/utils/cost-calculator';

interface WorkflowToolbarProps {
  onRun: () => Promise<void>;
}

export default function WorkflowToolbar({ onRun }: WorkflowToolbarProps) {
  const {
    workflowName,
    setWorkflowName,
    executionStatus,
    executionResult,
    saveWorkflow,
    loadWorkflow,
    clearWorkflow,
    resetExecution,
  } = useWorkflowStore();

  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleSave = () => {
    const json = saveWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        loadWorkflow(text);
      }
    };
    input.click();
  };

  const isRunning = executionStatus === 'running';

  return (
    <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      {/* 왼쪽 - 로고 + 워크플로우 이름 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" title="시키면 합니다. 알아서는 안 합니다.">🦥</span>
          <span className="font-bold text-gray-700 hidden sm:inline">조과장</span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* 가운데 - 실행 통계 */}
      {executionResult && (
        <div className="flex items-center gap-6 px-4 py-1.5 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {(executionResult.totalLatency / 1000).toFixed(2)}초
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">토큰:</span>
            <span className="font-medium text-gray-700">
              {executionResult.totalTokens.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className={`font-medium ${executionResult.totalCost === 0 ? 'text-green-600' : 'text-gray-700'}`}>
              {formatCost(executionResult.totalCost)}
            </span>
          </div>
        </div>
      )}

      {/* 오른쪽 - 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 파일 작업 */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="워크플로우 저장"
        >
          <Download size={16} />
          <span className="hidden sm:inline">저장</span>
        </button>
        
        <button
          onClick={handleLoad}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="워크플로우 불러오기"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">불러오기</span>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* 초기화 */}
        <button
          onClick={() => {
            if (confirm('워크플로우를 초기화할까요? 되돌릴 수 없습니다.')) {
              clearWorkflow();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="워크플로우 초기화"
        >
          <Trash2 size={16} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* 실행/중지 버튼 */}
        {isRunning ? (
          <button
            onClick={resetExecution}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            <Square size={16} />
            <span>그만해</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Play size={16} />
            <span>시켜!</span>
          </button>
        )}
      </div>
    </div>
  );
}
