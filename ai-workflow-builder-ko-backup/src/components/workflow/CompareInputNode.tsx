'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitCompare, Plus, X } from 'lucide-react';
import { CompareInputNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function CompareInputNode({ id, data, selected }: NodeProps<CompareInputNodeData>) {
  const { setSelectedNode, updateNodeData } = useWorkflowStore();
  const [newCode, setNewCode] = useState('');

  const companies = data.companies || [];

  const addCompany = () => {
    if (newCode.trim() && !companies.includes(newCode.trim())) {
      updateNodeData(id, { companies: [...companies, newCode.trim()] });
      setNewCode('');
    }
  };

  const removeCompany = (code: string) => {
    updateNodeData(id, { companies: companies.filter(c => c !== code) });
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[260px] max-w-[320px]
        bg-gradient-to-br from-cyan-50 to-blue-100
        ${selected ? 'ring-2 ring-cyan-400 border-cyan-500' : 'border-cyan-300'}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <GitCompare size={16} />
          </div>
          <span className="font-bold text-gray-800">
            {data.label || '기업 비교'}
          </span>
        </div>
        <span className="text-xs px-2 py-1 bg-cyan-200 text-cyan-800 rounded-full">
          {companies.length}개
        </span>
      </div>

      {/* 기업코드 입력 */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCompany()}
          placeholder="기업코드 입력 (예: 005930)"
          className="flex-1 px-2 py-1 text-sm border border-cyan-200 rounded focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            addCompany();
          }}
          className="p-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 기업 목록 */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {companies.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-2">
            비교할 기업코드를 추가하세요
          </div>
        ) : (
          companies.map((code, index) => (
            <div
              key={code}
              className="flex items-center justify-between px-2 py-1 bg-white rounded border border-cyan-100"
            >
              <span className="text-sm font-mono text-gray-700">
                {index + 1}. {code}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCompany(code);
                }}
                className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 빠른 추가 버튼 */}
      <div className="mt-3 flex flex-wrap gap-1">
        {['005930', '000660', '035720'].filter(c => !companies.includes(c)).slice(0, 3).map((code) => (
          <button
            key={code}
            onClick={(e) => {
              e.stopPropagation();
              updateNodeData(id, { companies: [...companies, code] });
            }}
            className="text-[10px] px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 transition-colors"
          >
            +{code}
          </button>
        ))}
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(CompareInputNode);
