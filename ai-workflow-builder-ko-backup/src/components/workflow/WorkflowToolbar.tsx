'use client';

import { useState } from 'react';
import {
  Play,
  Square,
  Upload,
  Trash2,
  DollarSign,
  Clock,
  Download,
  Share2,
} from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { formatCost } from '@/utils/cost-calculator';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FileLoadDialog from './FileLoadDialog';

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

  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  const handleSave = () => {
    try {
      const json = saveWorkflow();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('워크플로우가 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다.');
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      loadWorkflow(text);
      toast.success('워크플로우를 불러왔습니다.');
    } catch (error) {
      console.error('불러오기 실패:', error);
      toast.error('파일을 불러오는데 실패했습니다.');
    }
  };

  const handleShare = async () => {
    const json = saveWorkflow();
    try {
      await navigator.clipboard.writeText(json);
      toast.success('워크플로우 설정이 클립보드에 복사되었습니다.');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  const handleClearConfirm = () => {
    clearWorkflow();
    toast.success('초기화되었습니다.');
  };

  const isRunning = executionStatus === 'running';

  return (
    <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <FileLoadDialog
        open={isLoadDialogOpen}
        onOpenChange={setIsLoadDialogOpen}
        onFileSelect={handleFileSelect}
      />

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
            <span className={`font - medium ${executionResult.totalCost === 0 ? 'text-green-600' : 'text-gray-700'} `}>
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
          onClick={() => setIsLoadDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="워크플로우 불러오기"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">불러오기</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="워크플로우 공유(복사)"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">공유</span>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* 초기화 */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="워크플로우 초기화"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">초기화</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>워크플로우를 초기화하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                현재 작업 중인 모든 노드와 설정이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearConfirm} className="bg-red-500 hover:bg-red-600">
                초기화
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
