/**
 * Workflow Execution API
 * 
 * POST /api/workflow/run
 * Executes a workflow by processing nodes in topological order.
 * 
 * 리팩토링됨: 노드 실행 로직은 /lib/executors/ 에서 관리
 */

import { NextRequest, NextResponse } from 'next/server';
import { Node, Edge } from 'reactflow';
import { 
  WorkflowNodeData, 
  LLMNodeData, 
  InputNodeData, 
  TransformNodeData, 
  ConditionNodeData,
  LoopNodeData,
  ApiNodeData,
  DelayNodeData,
  WebhookNodeData,
  RandomNodeData,
  SliceNodeData,
  DateTimeNodeData,
  FileSaveNodeData,
  TaskBreakdownNodeData,
  StateNodeData,
  AIRouterNodeData,
  ApprovalNodeData,
  CodeNodeData,
  ParallelNodeData,
  TemplateNodeData,
  HtmlCleanNodeData,
  MathNodeData,
  FormulaNodeData,
  MultiFilterNodeData,
  StockAlertNodeData,
  MultiAgentNodeData,
  CompareInputNodeData,
  TableOutputNodeData,
  ChartNodeData,
  NodeExecutionResult,
  WorkflowExecutionResult,
} from '@/types/workflow';
import { callLLM, buildMessages } from '@/lib/providers';

// 분리된 실행기 모듈에서 import
import {
  executeApiCall,
  executeTransform,
  executeRandom,
  executeSlice,
  executeDateTime,
  executeTemplate,
  executeHtmlClean,
  executeMath,
  executeFormula,
  executeMultiFilter,
  executeTaskBreakdown,
  executeAIRouter,
  executeMultiAgent,
  executeIntentParser,
  executeSmartAnalysis,
  executeState,
  executeApproval,
  executeCode,
  executeParallel,
  executeLoop,
  resetLoopState,
  sendWebhook,
  executeFileSave,
  executeStockAlert,
  executeCompareInput,
  executeTableOutput,
  executeChart,
  evaluateCondition,
} from '@/lib/executors';

interface WorkflowRequest {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

/**
 * Get topological order of nodes for execution (Kahn's algorithm)
 */
function getTopologicalOrder(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  });

  edges.forEach(e => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    adjacency.get(e.source)?.push(e.target);
  });

  const queue: string[] = [];
  const result: string[] = [];

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    adjacency.get(nodeId)?.forEach(targetId => {
      const newDegree = (inDegree.get(targetId) || 0) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) queue.push(targetId);
    });
  }

  return result;
}

/**
 * 노드 타입에 따른 이모지를 반환합니다
 */
function getNodeEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    input: '📥',
    llm: '🤖',
    transform: '🔄',
    output: '📤',
    api: '🌐',
    condition: '🔀',
    loop: '🔁',
    parallel: '⚡',
    multiagent: '👥',
    code: '💻',
    formula: '📊',
    state: '💾',
    delay: '⏱️',
    webhook: '🔔',
    filesave: '💾',
    intentparser: '🧠',
    smartanalysis: '🔮',
    taskbreakdown: '📋',
    airouter: '🚦',
    template: '📝',
    htmlclean: '🧹',
    math: '🔢',
    multifilter: '🔍',
    stockalert: '📈',
    compareinput: '⚖️',
    tableoutput: '📊',
    chart: '📉',
    note: '📌',
    approval: '✅',
    random: '🎲',
    slice: '✂️',
    datetime: '📅',
  };
  return emojiMap[type] || '📄';
}

/**
 * Get input value for a node from its connected source nodes
 * 개선: 여러 입력을 구조화된 형태로 병합하여 AI가 구분할 수 있도록 함
 */
function getNodeInput(
  nodeId: string,
  edges: Edge[],
  nodeOutputs: Map<string, string>,
  nodeMap: Map<string, Node<WorkflowNodeData>>
): string {
  const incomingEdges = edges.filter(e => e.target === nodeId);
  
  if (incomingEdges.length === 0) {
    return '';
  }

  // 입력 소스 정보 수집
  const inputs = incomingEdges
    .map((e, index) => {
      const output = nodeOutputs.get(e.source) || '';
      const sourceNode = nodeMap.get(e.source);
      return {
        sourceNodeId: e.source,
        sourceNodeLabel: sourceNode?.data?.label || e.source,
        sourceNodeType: sourceNode?.data?.type || 'unknown',
        content: output,
        index: index + 1,
      };
    })
    .filter(item => item.content);

  // 입력이 1개면 그대로 반환 (구분자 불필요)
  if (inputs.length <= 1) {
    return inputs[0]?.content || '';
  }
  
  // 여러 입력을 구조화된 형태로 병합
  const mergedText = inputs.map((input) => {
    const emoji = getNodeEmoji(input.sourceNodeType);
    const header = `${emoji} [자료 ${input.index}: ${input.sourceNodeLabel}]`;
    const separator = '─'.repeat(40);
    return `${header}\n${separator}\n${input.content}`;
  }).join('\n\n' + '═'.repeat(50) + '\n\n');
  
  // 메타 정보 추가 (JSON 형태로 AI에게 구조 정보 제공)
  const metaInfo = JSON.stringify({
    __multiInput__: true,
    totalSources: inputs.length,
    sources: inputs.map(s => ({
      index: s.index,
      label: s.sourceNodeLabel,
      type: s.sourceNodeType,
    })),
  });
  
  const finalText = `<!-- INPUT_META: ${metaInfo} -->\n\n` +
    `📚 **총 ${inputs.length}개의 자료가 입력되었습니다**\n\n` +
    mergedText;
  
  return finalText;
}

/**
 * Mark downstream nodes as skipped (for condition branching)
 */
function markDownstreamAsSkipped(
  nodeId: string, 
  edges: Edge[], 
  skippedNodes: Set<string>
): void {
  if (skippedNodes.has(nodeId)) return;
  skippedNodes.add(nodeId);
  
  const outgoing = edges.filter(e => e.source === nodeId);
  for (const edge of outgoing) {
    markDownstreamAsSkipped(edge.target, edges, skippedNodes);
  }
}

/**
 * Execute a single node
 */
async function executeNode(
  node: Node<WorkflowNodeData>,
  input: string
): Promise<{ output: string; result: NodeExecutionResult }> {
  const startTime = Date.now();
  const data = node.data;

  try {
    let output = '';
    let usage = undefined;
    let cost = 0;

    switch (data.type) {
      case 'input': {
        const inputData = data as InputNodeData;
        output = inputData.value || '';
        break;
      }

      case 'llm': {
        const llmData = data as LLMNodeData;
        
        // 다중 입력 메타데이터 확인
        const metaMatch = input.match(/<!-- INPUT_META: ({.*?}) -->/);
        let enhancedSystemPrompt = llmData.systemPrompt || '';
        let effectiveMaxTokens = llmData.maxTokens;
        
        if (metaMatch) {
          try {
            const meta = JSON.parse(metaMatch[1]);
            if (meta.__multiInput__ && meta.totalSources > 1) {
              // 다중 입력일 경우 시스템 프롬프트 강화
              enhancedSystemPrompt = `${enhancedSystemPrompt || ''}

## 📚 다중 자료 분석 규칙
- 총 ${meta.totalSources}개의 자료가 입력되었습니다
- 각 자료는 [자료 N: 라벨] 형식으로 구분되어 있습니다
- 각 자료를 명확히 구분하여 분석하세요
- 자료 간 비교/관계를 파악하여 인사이트를 도출하세요
- 종합 결론을 명확히 제시하세요`;
              
              // 다중 입력시 토큰 증가
              effectiveMaxTokens = Math.max(effectiveMaxTokens || 2000, 3000);
            }
          } catch {
            // 메타 파싱 실패시 무시
          }
        }
        
        const messages = buildMessages(
          enhancedSystemPrompt,
          llmData.userPrompt,
          input
        );

        const response = await callLLM({
          provider: llmData.provider,
          model: llmData.model,
          messages,
          temperature: llmData.temperature,
          maxTokens: effectiveMaxTokens,
        });

        output = response.content;
        usage = response.usage;
        cost = response.cost;
        break;
      }

      case 'transform': {
        const transformData = data as TransformNodeData;
        output = executeTransform(transformData, input);
        break;
      }

      case 'output':
        output = input;
        break;

      case 'condition': {
        const conditionData = data as ConditionNodeData;
        const conditionResult = evaluateCondition(conditionData, input);
        output = conditionResult ? 'true' : 'false';
        break;
      }

      case 'loop': {
        const loopData = data as LoopNodeData;
        const loopResult = executeLoop(loopData, input, node.id);
        output = loopResult.output;
        break;
      }

      case 'api': {
        const apiData = data as ApiNodeData;
        const apiResult = await executeApiCall(apiData, input);
        output = apiResult.output;
        break;
      }

      case 'delay': {
        const delayData = data as DelayNodeData;
        await new Promise(resolve => setTimeout(resolve, delayData.delayMs || 1000));
        output = input;
        break;
      }

      case 'webhook': {
        const webhookData = data as WebhookNodeData;
        await sendWebhook(webhookData, input);
        output = input;
        break;
      }

      case 'random': {
        const randomData = data as RandomNodeData;
        output = executeRandom(randomData, input);
        break;
      }

      case 'slice': {
        const sliceData = data as SliceNodeData;
        output = executeSlice(sliceData, input);
        break;
      }

      case 'datetime': {
        const dtData = data as DateTimeNodeData;
        output = executeDateTime(dtData, input);
        break;
      }

      case 'filesave': {
        const fileData = data as FileSaveNodeData;
        output = executeFileSave(fileData, input);
        break;
      }

      case 'taskbreakdown': {
        const taskData = data as TaskBreakdownNodeData;
        const taskResult = await executeTaskBreakdown(taskData, input);
        output = taskResult.output;
        usage = taskResult.usage;
        cost = taskResult.cost;
        break;
      }

      case 'state': {
        const stateData = data as StateNodeData;
        output = executeState(stateData, input);
        break;
      }

      case 'airouter': {
        const routerData = data as AIRouterNodeData;
        const routerResult = await executeAIRouter(routerData, input);
        output = routerResult.output;
        usage = routerResult.usage;
        cost = routerResult.cost;
        break;
      }

      case 'approval': {
        const approvalData = data as ApprovalNodeData;
        const workflowId = `wf-${Date.now()}`;
        const approvalResult = await executeApproval(approvalData, input, node.id, workflowId);
        output = approvalResult.output;
        break;
      }

      case 'note':
        output = input;
        break;

      case 'code': {
        const codeData = data as CodeNodeData;
        output = executeCode(codeData, input);
        break;
      }

      case 'parallel': {
        const parallelData = data as ParallelNodeData;
        output = executeParallel(parallelData, input);
        break;
      }

      case 'template': {
        const templateData = data as TemplateNodeData;
        output = executeTemplate(templateData, input);
        break;
      }

      case 'htmlclean': {
        const htmlCleanData = data as HtmlCleanNodeData;
        output = executeHtmlClean(htmlCleanData, input);
        break;
      }

      case 'math': {
        const mathData = data as MathNodeData;
        output = executeMath(mathData, input);
        break;
      }

      case 'formula': {
        const formulaData = data as FormulaNodeData;
        output = executeFormula(formulaData, input);
        break;
      }

      case 'multifilter': {
        const filterData = data as MultiFilterNodeData;
        output = executeMultiFilter(filterData, input);
        break;
      }

      case 'stockalert': {
        const stockData = data as StockAlertNodeData;
        output = executeStockAlert(stockData, input);
        break;
      }

      case 'multiagent': {
        const multiAgentData = data as MultiAgentNodeData;
        const multiAgentResult = await executeMultiAgent(multiAgentData, input);
        output = multiAgentResult.output;
        usage = multiAgentResult.usage;
        cost = multiAgentResult.cost;
        break;
      }

      case 'compareinput': {
        const compareData = data as CompareInputNodeData;
        output = executeCompareInput(compareData, input);
        break;
      }

      case 'tableoutput': {
        const tableData = data as TableOutputNodeData;
        output = executeTableOutput(tableData, input);
        break;
      }

      case 'chart': {
        const chartData = data as ChartNodeData;
        output = executeChart(chartData, input);
        break;
      }

      case 'intentparser': {
        const intentResult = await executeIntentParser(input);
        output = intentResult.output;
        usage = intentResult.usage;
        cost = intentResult.cost;
        break;
      }

      case 'smartanalysis': {
        const smartResult = await executeSmartAnalysis(input);
        output = smartResult.output;
        usage = smartResult.usage;
        cost = smartResult.cost;
        break;
      }
    }

    const endTime = Date.now();

    return {
      output,
      result: {
        nodeId: node.id,
        status: 'success',
        output,
        startTime,
        endTime,
        usage,
        cost,
      },
    };
  } catch (error) {
    const endTime = Date.now();
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      output: '',
      result: {
        nodeId: node.id,
        status: 'error',
        error: errorMessage,
        startTime,
        endTime,
      },
    };
  }
}

/**
 * POST /api/workflow/run
 * Execute the workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body: WorkflowRequest = await request.json();
    const { nodes, edges } = body;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: 'No nodes provided' },
        { status: 400 }
      );
    }

    // 워크플로우 시작 시 루프 상태 초기화
    resetLoopState();

    // Get execution order
    const executionOrder = getTopologicalOrder(nodes, edges);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Execute nodes in order
    const nodeOutputs = new Map<string, string>();
    const nodeResults: Record<string, NodeExecutionResult> = {};
    let totalCost = 0;
    let totalTokens = 0;
    const startTime = Date.now();

    // Track which nodes should be skipped based on condition results
    const skippedNodes = new Set<string>();

    for (const nodeId of executionOrder) {
      // Skip if this node was marked to be skipped
      if (skippedNodes.has(nodeId)) continue;

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const input = getNodeInput(nodeId, edges, nodeOutputs, nodeMap);
      const { output, result } = await executeNode(node, input);

      nodeOutputs.set(nodeId, output);
      nodeResults[nodeId] = result;

      if (result.usage) {
        totalTokens += result.usage.totalTokens;
      }
      if (result.cost) {
        totalCost += result.cost;
      }

      // Handle condition node branching
      if (node.data.type === 'condition') {
        const conditionResult = output === 'true';
        const outgoingEdges = edges.filter(e => e.source === nodeId);
        
        for (const edge of outgoingEdges) {
          if (conditionResult && edge.sourceHandle === 'false') {
            markDownstreamAsSkipped(edge.target, edges, skippedNodes);
          } else if (!conditionResult && edge.sourceHandle === 'true') {
            markDownstreamAsSkipped(edge.target, edges, skippedNodes);
          }
        }
      }

      // If any node fails, stop execution
      if (result.status === 'error') {
        break;
      }
    }

    const endTime = Date.now();

    // Build execution result
    const executionResult: WorkflowExecutionResult = {
      workflowId: `exec-${Date.now()}`,
      status: Object.values(nodeResults).some(r => r.status === 'error') 
        ? 'error' 
        : 'success',
      nodeResults,
      totalCost,
      totalTokens,
      totalLatency: endTime - startTime,
      startTime,
      endTime,
    };

    return NextResponse.json(executionResult);
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { 
        error: 'Workflow execution failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
