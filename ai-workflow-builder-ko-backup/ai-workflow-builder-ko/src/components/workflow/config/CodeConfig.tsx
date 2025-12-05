'use client';

import { CodeNodeData } from '@/types/workflow';

interface CodeConfigProps {
  data: CodeNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<CodeNodeData>) => void;
}

export function CodeConfig({ data, nodeId, updateNodeData }: CodeConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">JavaScript 코드</label>
        <textarea
          value={data.code}
          onChange={(e) => updateNodeData(nodeId, { code: e.target.value })}
          placeholder={`// input 변수로 이전 노드 결과 사용
// $state.get/set으로 상태 관리
// return으로 결과 반환

const data = JSON.parse(input);
return data.result;`}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono resize-none bg-gray-900 text-green-400 focus:ring-2 focus:ring-green-500"
          rows={10}
        />
      </div>

      <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
        <p className="text-xs text-green-700 font-medium">📌 사용 가능한 변수</p>
        <ul className="text-xs text-green-700 space-y-1">
          <li><code className="bg-green-100 px-1 rounded">input</code> - 이전 노드의 출력값</li>
          <li><code className="bg-green-100 px-1 rounded">$state.get(key)</code> - 상태 변수 읽기</li>
          <li><code className="bg-green-100 px-1 rounded">$state.set(key, value)</code> - 상태 변수 쓰기</li>
          <li><code className="bg-green-100 px-1 rounded">return</code> - 결과 반환</li>
        </ul>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
        <p className="text-xs text-gray-700 font-medium">💡 예제</p>
        <pre className="text-[10px] text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">{`// JSON 파싱 후 특정 필드 추출
const data = JSON.parse(input);
return data.items.map(i => i.name).join(', ');

// 텍스트 처리
return input.toUpperCase().trim();

// 상태 활용
const count = $state.get('count') || 0;
$state.set('count', count + 1);
return \`처리 횟수: \${count + 1}\`;`}</pre>
      </div>
    </div>
  );
}
