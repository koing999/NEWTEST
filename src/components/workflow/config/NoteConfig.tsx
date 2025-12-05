'use client';

import { NoteNodeData } from '@/types/workflow';

interface NoteConfigProps {
  data: NoteNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<NoteNodeData>) => void;
}

const COLORS = [
  { value: 'yellow', label: '노랑', class: 'bg-yellow-200' },
  { value: 'green', label: '초록', class: 'bg-green-200' },
  { value: 'blue', label: '파랑', class: 'bg-blue-200' },
  { value: 'pink', label: '분홍', class: 'bg-pink-200' },
  { value: 'purple', label: '보라', class: 'bg-purple-200' },
];

export function NoteConfig({ data, nodeId, updateNodeData }: NoteConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메모 내용</label>
        <textarea
          value={data.content}
          onChange={(e) => updateNodeData(nodeId, { content: e.target.value })}
          placeholder="워크플로우에 대한 메모를 작성하세요..."
          className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500"
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">배경색</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateNodeData(nodeId, { backgroundColor: opt.value })}
              className={`px-3 py-1 text-xs rounded border-2 ${opt.class} ${
                data.backgroundColor === opt.value 
                  ? 'border-gray-800' 
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-700">
          💡 메모 노드는 실행되지 않아요. 워크플로우 설명용으로만 사용하세요.
        </p>
      </div>
    </div>
  );
}
