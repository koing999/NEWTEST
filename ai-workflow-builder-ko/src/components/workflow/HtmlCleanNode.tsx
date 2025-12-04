'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Eraser, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { HtmlCleanNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function HtmlCleanNode({ id, data, selected }: NodeProps<HtmlCleanNodeData>) {
  const { setSelectedNode, nodeResults } = useWorkflowStore();
  const result = nodeResults[id];

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.status === 'running') return <Loader2 size={14} className="animate-spin text-blue-500" />;
    if (result.status === 'success') return <CheckCircle2 size={14} className="text-green-500" />;
    if (result.status === 'error') return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  // 활성화된 옵션 표시
  const activeOptions = [];
  if (data.removeScripts) activeOptions.push('📜 스크립트');
  if (data.removeStyles) activeOptions.push('🎨 스타일');
  if (data.removeComments) activeOptions.push('💬 주석');

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        bg-gradient-to-br from-red-400 to-orange-500 min-w-[200px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-white ring-2 ring-red-500 ring-offset-2' : 'border-red-300/50'}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <Eraser size={16} className="text-white" />
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {data.label || 'HTML 청소기'}
        </span>
        {getStatusIcon()}
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {/* 제거 대상 */}
        <div className="text-xs mb-2">
          <div className="text-white/70 mb-1">🧹 제거 대상:</div>
          <div className="flex flex-wrap gap-1">
            {activeOptions.length > 0 ? (
              activeOptions.map((opt, i) => (
                <span key={i} className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                  {opt}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-white/50">설정 필요</span>
            )}
          </div>
        </div>

        {/* 유지 항목 */}
        <div className="text-xs">
          <div className="text-white/70 mb-1">✅ 유지:</div>
          <div className="flex gap-1">
            {data.keepLinks && <span className="text-[10px] bg-green-500/30 px-1.5 py-0.5 rounded">🔗 링크</span>}
            {data.keepImages && <span className="text-[10px] bg-green-500/30 px-1.5 py-0.5 rounded">🖼️ 이미지</span>}
          </div>
        </div>

        {/* 결과 - 절약된 토큰 표시 */}
        {result?.output && (
          <div className="mt-2 p-2 bg-black/20 rounded text-xs">
            💰 청소 완료! 토큰 절약됨
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-red-300 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-orange-300 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(HtmlCleanNode);
