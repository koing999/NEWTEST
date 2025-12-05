'use client';

import { X, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { NodeType, WorkflowNodeData } from '@/types/workflow';
import { getNodeIcon, getNodeColor } from './config/nodeMetadata';

// 노드별 설정 컴포넌트 임포트
import {
  LLMConfig,
  InputConfig,
  TransformConfig,
  OutputConfig,
  ConditionConfig,
  LoopConfig,
  ApiConfig,
  DelayConfig,
  WebhookConfig,
  RandomConfig,
  SliceConfig,
  DateTimeConfig,
  FileSaveConfig,
  TaskBreakdownConfig,
  StateConfig,
  AIRouterConfig,
  ApprovalConfig,
  NoteConfig,
  CodeConfig,
  ParallelConfig,
  TemplateConfig,
  HtmlCleanConfig,
  MathConfig,
  FormulaConfig,
  MultiFilterConfig,
  StockAlertConfig,
} from './config';

// 노드 타입별 설정 컴포넌트 매핑
const CONFIG_COMPONENTS: Record<NodeType, React.ComponentType<ConfigProps> | null> = {
  input: InputConfig as React.ComponentType<ConfigProps>,
  llm: LLMConfig as React.ComponentType<ConfigProps>,
  transform: TransformConfig as React.ComponentType<ConfigProps>,
  output: OutputConfig as React.ComponentType<ConfigProps>,
  condition: ConditionConfig as React.ComponentType<ConfigProps>,
  loop: LoopConfig as React.ComponentType<ConfigProps>,
  api: ApiConfig as React.ComponentType<ConfigProps>,
  delay: DelayConfig as React.ComponentType<ConfigProps>,
  webhook: WebhookConfig as React.ComponentType<ConfigProps>,
  random: RandomConfig as React.ComponentType<ConfigProps>,
  slice: SliceConfig as React.ComponentType<ConfigProps>,
  datetime: DateTimeConfig as React.ComponentType<ConfigProps>,
  filesave: FileSaveConfig as React.ComponentType<ConfigProps>,
  taskbreakdown: TaskBreakdownConfig as React.ComponentType<ConfigProps>,
  state: StateConfig as React.ComponentType<ConfigProps>,
  airouter: AIRouterConfig as React.ComponentType<ConfigProps>,
  approval: ApprovalConfig as React.ComponentType<ConfigProps>,
  note: NoteConfig as React.ComponentType<ConfigProps>,
  code: CodeConfig as React.ComponentType<ConfigProps>,
  parallel: ParallelConfig as React.ComponentType<ConfigProps>,
  template: TemplateConfig as React.ComponentType<ConfigProps>,
  htmlclean: HtmlCleanConfig as React.ComponentType<ConfigProps>,
  math: MathConfig as React.ComponentType<ConfigProps>,
  formula: FormulaConfig as React.ComponentType<ConfigProps>,
  multifilter: MultiFilterConfig as React.ComponentType<ConfigProps>,
  stockalert: StockAlertConfig as React.ComponentType<ConfigProps>,
};

interface ConfigProps {
  data: WorkflowNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
}

export default function NodeConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNode, updateNodeData, deleteNode } = useWorkflowStore();
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">👆</div>
          <div className="text-sm">노드를 선택해서 설정하세요</div>
        </div>
      </div>
    );
  }

  const data = selectedNode.data;
  const nodeType = data.type as NodeType;
  const ConfigComponent = CONFIG_COMPONENTS[nodeType];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${getNodeColor(nodeType)} text-white`}>
            {getNodeIcon(nodeType)}
          </div>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          />
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* 설정 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {ConfigComponent ? (
          <ConfigComponent
            data={data}
            nodeId={selectedNode.id}
            updateNodeData={updateNodeData}
          />
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">이 노드 타입은 설정이 필요없어요</p>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          <span>노드 삭제</span>
        </button>
      </div>
    </div>
  );
}
