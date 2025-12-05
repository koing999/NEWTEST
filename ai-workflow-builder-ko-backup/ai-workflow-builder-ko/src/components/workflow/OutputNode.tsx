'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileOutput, Copy, Check, Download, Maximize2 } from 'lucide-react';
import { OutputNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function OutputNode({ id, data, selected }: NodeProps<OutputNodeData>) {
  const { setSelectedNode } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 시 캔버스 줌 방지
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    
    const hasScroll = el.scrollHeight > el.clientHeight;
    if (hasScroll) {
      e.stopPropagation();
    }
  }, []);

  // 파일 저장 메타데이터 확인
  const getFileSaveData = useCallback(() => {
    if (!data.result) return null;
    try {
      const parsed = JSON.parse(data.result);
      if (parsed.__filesave__) {
        return parsed;
      }
    } catch {
      // JSON이 아니면 일반 텍스트
    }
    return null;
  }, [data.result]);

  const fileSaveData = getFileSaveData();

  const handleCopy = async () => {
    if (data.result) {
      const content = fileSaveData ? fileSaveData.content : data.result;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!fileSaveData) return;
    
    const blob = new Blob([fileSaveData.content], { type: fileSaveData.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileSaveData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2 min-w-[200px] max-w-[300px]
        bg-gradient-to-br from-purple-50 to-violet-100
        ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-300'}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500 text-white">
            <FileOutput size={14} />
          </div>
          <span className="font-semibold text-purple-800 text-sm">
            {data.label}
          </span>
        </div>
        {data.result && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1 rounded hover:bg-purple-200 transition-colors"
            title="결과 복사"
          >
            {copied ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <Copy size={14} className="text-purple-600" />
            )}
          </button>
        )}
      </div>

      {/* 출력 타입 배지 + 확대 버튼 */}
      <div className="mb-2 flex items-center justify-between">
        <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-200 text-purple-700 rounded">
          {data.outputType === 'text' ? '텍스트' : data.outputType === 'json' ? 'JSON' : '마크다운'}
        </span>
        {data.result && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1 rounded hover:bg-purple-200 transition-colors"
            title={expanded ? "축소" : "확대"}
          >
            <Maximize2 size={12} className="text-purple-600" />
          </button>
        )}
      </div>

      {/* 결과 영역 - 스크롤 시 줌 방지 */}
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className={`bg-white rounded-md border border-purple-200 p-2 min-h-[60px] overflow-auto transition-all duration-200 ${
          expanded ? 'max-h-[400px]' : 'max-h-[150px]'
        }`}
      >
        {data.result ? (
          fileSaveData ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>📄</span>
                <span className="font-mono">{fileSaveData.filename}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-md transition-colors"
              >
                <Download size={14} />
                다운로드
              </button>
              <pre className="text-xs text-gray-500 whitespace-pre-wrap break-words font-mono max-h-[60px] overflow-hidden">
                {fileSaveData.content.slice(0, 200)}{fileSaveData.content.length > 200 ? '...' : ''}
              </pre>
            </div>
          ) : (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
              {data.result}
            </pre>
          )
        ) : (
          <div className="text-xs text-gray-400 italic">
            워크플로우를 실행하면 결과가 표시됩니다...
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(OutputNode);
