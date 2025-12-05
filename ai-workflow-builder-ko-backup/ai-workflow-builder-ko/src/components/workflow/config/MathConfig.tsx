'use client';

import { MathNodeData } from '@/types/workflow';

interface MathConfigProps {
  data: MathNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<MathNodeData>) => void;
}

const OPERATIONS = [
  { value: 'add', label: '➕ 더하기', symbol: '+' },
  { value: 'subtract', label: '➖ 빼기', symbol: '-' },
  { value: 'multiply', label: '✖️ 곱하기', symbol: '×' },
  { value: 'divide', label: '➗ 나누기', symbol: '÷' },
  { value: 'percent', label: '💯 백분율', symbol: '%' },
  { value: 'round', label: '🔄 반올림', symbol: '≈' },
  { value: 'floor', label: '⬇️ 내림', symbol: '⌊⌋' },
  { value: 'ceil', label: '⬆️ 올림', symbol: '⌈⌉' },
  { value: 'abs', label: '📐 절대값', symbol: '|x|' },
];

export function MathConfig({ data, nodeId, updateNodeData }: MathConfigProps) {
  const selectedOp = OPERATIONS.find(op => op.value === data.operation) || OPERATIONS[0];
  const needsSecondValue = ['add', 'subtract', 'multiply', 'divide', 'percent'].includes(data.operation);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">연산</label>
        <select
          value={data.operation}
          onChange={(e) => updateNodeData(nodeId, { operation: e.target.value as MathNodeData['operation'] })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        >
          {OPERATIONS.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">값 1</label>
        <input
          type="text"
          value={data.value1}
          onChange={(e) => updateNodeData(nodeId, { value1: e.target.value })}
          placeholder="숫자 또는 {{input}}"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code>으로 이전 노드 결과 사용
        </p>
      </div>

      {needsSecondValue && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">값 2</label>
          <input
            type="text"
            value={data.value2 || ''}
            onChange={(e) => updateNodeData(nodeId, { value2: e.target.value })}
            placeholder="숫자"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">소수점 자릿수</label>
        <input
          type="number"
          value={data.decimals ?? 2}
          onChange={(e) => updateNodeData(nodeId, { decimals: parseInt(e.target.value) })}
          min={0}
          max={10}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 미리보기 */}
      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-xs text-emerald-700 font-medium mb-1">📐 연산 미리보기</p>
        <p className="text-sm text-emerald-800 font-mono">
          {data.value1 || '값1'} {selectedOp.symbol} {needsSecondValue ? (data.value2 || '값2') : ''} = ?
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-700 font-medium">💡 활용 예시</p>
        <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
          <li>• 주가 등락률: (현재가 - 시가) ÷ 시가 × 100</li>
          <li>• 할인가 계산: 원가 × (1 - 할인율)</li>
          <li>• 합계 계산: A + B + C</li>
        </ul>
      </div>
    </div>
  );
}
