'use client';

import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  Node as ReactFlowNode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/lib/stores/workflow-store';
import InputNode from './InputNode';
import LLMNode from './LLMNode';
import TransformNode from './TransformNode';
import OutputNode from './OutputNode';
import ConditionNode from './ConditionNode';
import LoopNode from './LoopNode';
import ApiNode from './ApiNode';
import DelayNode from './DelayNode';
import WebhookNode from './WebhookNode';
import RandomNode from './RandomNode';
import SliceNode from './SliceNode';
import DateTimeNode from './DateTimeNode';
import FileSaveNode from './FileSaveNode';
import TaskBreakdownNode from './TaskBreakdownNode';
import StateNode from './StateNode';
import AIRouterNode from './AIRouterNode';
import ApprovalNode from './ApprovalNode';
import NoteNode from './NoteNode';
import CodeNode from './CodeNode';
import ParallelNode from './ParallelNode';
import TemplateNode from './TemplateNode';
import HtmlCleanNode from './HtmlCleanNode';
import MathNode from './MathNode';
import FormulaNode from './FormulaNode';
import MultiFilterNode from './MultiFilterNode';
import StockAlertNode from './StockAlertNode';
import MultiAgentNode from './MultiAgentNode';
import CompareInputNode from './CompareInputNode';
import TableOutputNode from './TableOutputNode';
import ChartNode from './ChartNode';
import IntentParserNode from './IntentParserNode';
import SmartAnalysisNode from './SmartAnalysisNode';
import CustomEdge from './CustomEdge';

// Define custom node types
const nodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  transformNode: TransformNode,
  outputNode: OutputNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  apiNode: ApiNode,
  delayNode: DelayNode,
  webhookNode: WebhookNode,
  randomNode: RandomNode,
  sliceNode: SliceNode,
  datetimeNode: DateTimeNode,
  filesaveNode: FileSaveNode,
  taskbreakdownNode: TaskBreakdownNode,
  stateNode: StateNode,
  airouterNode: AIRouterNode,
  approvalNode: ApprovalNode,
  noteNode: NoteNode,
  codeNode: CodeNode,
  parallelNode: ParallelNode,
  templateNode: TemplateNode,
  htmlcleanNode: HtmlCleanNode,
  mathNode: MathNode,
  formulaNode: FormulaNode,
  multifilterNode: MultiFilterNode,
  stockalertNode: StockAlertNode,
  multiagentNode: MultiAgentNode,
  compareinputNode: CompareInputNode,
  tableoutputNode: TableOutputNode,
  chartNode: ChartNode,
  intentParserNode: IntentParserNode,
  smartanalysisNode: SmartAnalysisNode,
};

// Define custom edge types
const edgeTypes = {
  default: CustomEdge,
};

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useWorkflowStore();

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');

      if (!data || !reactFlowBounds || !reactFlowInstance.current) {
        return;
      }

      const { type, data: nodeData } = JSON.parse(data);

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type.replace('Node', '')}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        edgesUpdatable={true}
        edgesFocusable={true}
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'default',
          style: { strokeWidth: 3 },
          interactionWidth: 20,
        }}
        connectionLineStyle={{ stroke: '#64748b', strokeWidth: 3 }}
        className="bg-gray-50"
      >
        <Background color="#94a3b8" gap={20} />
        <Controls className="!bg-white !border-gray-200 !rounded-lg !shadow-lg" />
        <MiniMap
          className="!bg-white !border-gray-200 !rounded-lg !shadow-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case 'inputNode': return '#10b981';
              case 'llmNode': return '#3b82f6';
              case 'transformNode': return '#f59e0b';
              case 'outputNode': return '#8b5cf6';
              case 'conditionNode': return '#f97316';
              case 'loopNode': return '#06b6d4';
              case 'apiNode': return '#6366f1';
              case 'delayNode': return '#eab308';
              case 'webhookNode': return '#ec4899';
              case 'randomNode': return '#14b8a6';
              case 'sliceNode': return '#f43f5e';
              case 'datetimeNode': return '#8b5cf6';
              case 'filesaveNode': return '#84cc16';
              case 'taskbreakdownNode': return '#6366f1';
              case 'stateNode': return '#0ea5e9';
              case 'airouterNode': return '#a855f7';
              case 'approvalNode': return '#f59e0b';
              case 'noteNode': return '#fbbf24';
              case 'codeNode': return '#22c55e';
              case 'parallelNode': return '#d946ef';
              case 'templateNode': return '#0ea5e9';
              case 'htmlcleanNode': return '#f97316';
              case 'mathNode': return '#10b981';
              case 'formulaNode': return '#8b5cf6';
              case 'multifilterNode': return '#06b6d4';
              case 'stockalertNode': return '#f59e0b';
              case 'multiagentNode': return '#a855f7';
              case 'compareinputNode': return '#06b6d4';
              case 'tableoutputNode': return '#10b981';
              case 'chartNode': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
