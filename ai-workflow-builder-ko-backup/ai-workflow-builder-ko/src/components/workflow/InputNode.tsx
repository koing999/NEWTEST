'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type } from 'lucide-react';
import { InputNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function InputNode({ id, data, selected }: NodeProps<InputNodeData>) {
  const { updateNodeData, setSelectedNode } = useWorkflowStore();
  const [localValue, setLocalValue] = useState(data.value || '');
  const isComposingRef = useRef(false);

  // data.value가 외부에서 변경되면 localValue 동기화
  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalValue(data.value || '');
    }
  }, [data.value]);

  // 한글 조합 시작
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  // 한글 조합 완료
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposingRef.current = false;
    updateNodeData(id, { value: e.currentTarget.value });
  };

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // 한글 조합 중이 아닐 때만 store 업데이트
    if (!isComposingRef.current) {
      updateNodeData(id, { value: newValue });
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2 min-w-[200px] max-w-[280px]
        bg-gradient-to-br from-emerald-50 to-green-100
        ${selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-300'}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-emerald-500 text-white">
          <Type size={14} />
        </div>
        <span className="font-semibold text-emerald-800 text-sm">
          {data.label}
        </span>
      </div>

      {/* 입력 영역 */}
      <textarea
        value={localValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={data.placeholder || '텍스트를 입력하세요...'}
        className="
          w-full p-2 rounded-md border border-emerald-200
          text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300
          bg-white placeholder:text-gray-400
        "
        rows={3}
        onClick={(e) => e.stopPropagation()}
      />

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(InputNode);
