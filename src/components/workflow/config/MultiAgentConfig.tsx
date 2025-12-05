'use client';

import { MultiAgentNodeData } from '@/types/workflow';

interface MultiAgentConfigProps {
  data: MultiAgentNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<MultiAgentNodeData>) => void;
}

type AgentId = 'accountant' | 'ib' | 'mckinsey' | 'planner' | 'jogwajang';

const availableAgents: { id: AgentId; label: string; description: string }[] = [
  { id: 'accountant', label: '🧮 회계사 AI', description: '경력 20년 공인회계사 관점' },
  { id: 'ib', label: '🏦 IB 전문가 AI', description: '투자은행 출신 밸류에이션 전문가' },
  { id: 'mckinsey', label: '🎯 맥킨지 AI', description: '전략 컨설턴트 (7S/6모자)' },
  { id: 'planner', label: '📊 기획자 AI', description: '경력 20년 사업기획 전문가' },
  { id: 'jogwajang', label: '🦥 조과장 AI', description: '결론만! 뭘 사야 돈 버나?' },
];

export function MultiAgentConfig({ data, nodeId, updateNodeData }: MultiAgentConfigProps) {
  const selectedAgents = data.agents || [];

  const toggleAgent = (agentId: AgentId) => {
    if (selectedAgents.includes(agentId)) {
      updateNodeData(nodeId, { agents: selectedAgents.filter(a => a !== agentId) });
    } else {
      updateNodeData(nodeId, { agents: [...selectedAgents, agentId] });
    }
  };

  return (
    <div className="space-y-4">
      {/* 에이전트 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI 전문가 선택 (복수 선택 가능)
        </label>
        <div className="space-y-2">
          {availableAgents.map((agent) => (
            <label
              key={agent.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${selectedAgents.includes(agent.id) 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'}
              `}
            >
              <input
                type="checkbox"
                checked={selectedAgents.includes(agent.id)}
                onChange={() => toggleAgent(agent.id)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-gray-800">{agent.label}</div>
                <div className="text-xs text-gray-500">{agent.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 분석 모드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">분석 모드</label>
        <select
          value={data.analysisMode || 'parallel'}
          onChange={(e) => updateNodeData(nodeId, { analysisMode: e.target.value as 'parallel' | 'sequential' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        >
          <option value="parallel">🚀 병렬 (동시 분석 - 빠름)</option>
          <option value="sequential">📝 순차 (하나씩 분석)</option>
        </select>
      </div>

      {/* 출력 형식 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">출력 형식</label>
        <select
          value={data.outputFormat || 'combined'}
          onChange={(e) => updateNodeData(nodeId, { outputFormat: e.target.value as 'combined' | 'separate' | 'comparison' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        >
          <option value="combined">📄 통합 리포트 (한 문서로)</option>
          <option value="separate">📑 개별 탭 (전문가별 분리)</option>
          <option value="comparison">📊 비교표 (의견 비교)</option>
        </select>
      </div>

      {/* 미리보기 */}
      {selectedAgents.length > 0 && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-xs text-purple-700 font-medium mb-2">
            ✨ 선택된 전문가 ({selectedAgents.length}명)
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedAgents.map((agentId) => {
              const agent = availableAgents.find(a => a.id === agentId);
              return (
                <span key={agentId} className="px-2 py-1 text-xs bg-white rounded-full border border-purple-200">
                  {agent?.label.split(' ')[0]}
                </span>
              );
            })}
          </div>
          <div className="text-[10px] text-purple-600 mt-2">
            💡 선택한 전문가들이 동시에 재무 데이터를 분석합니다
          </div>
        </div>
      )}

      {/* 비용 안내 */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="text-xs text-green-700">
          💰 Groq (Llama 3.3) 사용 - <strong>무료!</strong>
        </div>
        <div className="text-[10px] text-green-600 mt-1">
          {selectedAgents.length}명 × 1 분석 = 약 {selectedAgents.length * 2}초 소요
        </div>
      </div>
    </div>
  );
}
