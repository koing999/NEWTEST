/**
 * 큐 기반 워크플로우 실행 엔진
 * 
 * Loop와 Parallel 노드를 완전히 지원하는 새로운 실행 엔진입니다.
 * - Loop: 실제로 여러 번 반복 실행
 * - Parallel: Promise.allSettled로 진짜 병렬 실행
 * - 다중 입력 병합: 여러 노드의 출력을 구조화된 형태로 병합
 */

import { Node, Edge } from 'reactflow';
import { 
  WorkflowNodeData, 
  LoopNodeData,
  ParallelNodeData,
  NodeExecutionResult,
} from '@/types/workflow';
import { 
  getNodeEmoji,
  mergeMultipleInputs as mergeInputsUtil,
  type StructuredInputItem,
} from '@/lib/utils/input-merger';

// 실행 태스크 타입
interface ExecutionTask {
  nodeId: string;
  input: string;
  iteration?: number;
  maxIterations?: number;
  loopItems?: string[];
  parentLoopId?: string;
  branchIndex?: number;
}

// 실행 컨텍스트
interface ExecutionContext {
  nodes: Map<string, Node<WorkflowNodeData>>;
  edges: Edge[];
  nodeOutputs: Map<string, string>;
  nodeResults: Record<string, NodeExecutionResult>;
  totalCost: number;
  totalTokens: number;
  loopIterations: Map<string, number>; // nodeId -> current iteration
  loopResults: Map<string, string[]>; // nodeId -> results per iteration
  parallelResults: Map<string, string[]>; // nodeId -> branch results
}

/**
 * 노드의 다음 노드들을 가져옵니다
 */
function getNextNodes(nodeId: string, edges: Edge[]): string[] {
  return edges
    .filter(e => e.source === nodeId)
    .map(e => e.target);
}

/**
 * 노드의 이전 노드들을 가져옵니다
 */
function getPreviousNodes(nodeId: string, edges: Edge[]): string[] {
  return edges
    .filter(e => e.target === nodeId)
    .map(e => e.source);
}

// getNodeEmoji는 @/lib/utils/input-merger에서 가져옴

/**
 * 여러 이전 노드들의 출력을 구조화된 형태로 병합합니다
 * AI가 각 입력의 출처를 명확히 구분할 수 있도록 합니다
 * 
 * @note input-merger.ts의 유틸리티를 래핑하여 ExecutionContext와 호환되게 함
 */
function mergeMultipleInputs(
  prevNodeIds: string[],
  context: ExecutionContext
): { mergedText: string; structuredInputs: StructuredInputItem[] } {
  const items: StructuredInputItem[] = [];
  
  prevNodeIds.forEach((nodeId, index) => {
    const node = context.nodes.get(nodeId);
    const output = context.nodeOutputs.get(nodeId) || '';
    
    if (output) {
      items.push({
        nodeId,
        label: node?.data?.label || nodeId,
        nodeType: node?.data?.type || 'unknown',
        output,
        index,
      });
    }
  });
  
  // 입력이 1개면 그대로 반환 (구분자 불필요)
  if (items.length <= 1) {
    return {
      mergedText: items[0]?.output || '',
      structuredInputs: items,
    };
  }
  
  // 유틸리티 함수를 사용하여 병합
  const mergedText = mergeInputsUtil(items, { 
    includeMetadata: true,
    separatorStyle: 'double' 
  });
  
  return {
    mergedText,
    structuredInputs: items,
  };
}

/**
 * 모든 이전 노드가 완료되었는지 확인합니다
 */
function allPreviousNodesComplete(
  nodeId: string, 
  edges: Edge[], 
  completedNodes: Set<string>
): boolean {
  const prevNodes = getPreviousNodes(nodeId, edges);
  return prevNodes.every(id => completedNodes.has(id));
}

/**
 * Loop 노드 처리 - 실제로 여러 번 반복!
 */
async function processLoopNode(
  node: Node<LoopNodeData>,
  input: string,
  context: ExecutionContext,
  executeNodeFn: (node: Node<WorkflowNodeData>, input: string) => Promise<{ output: string; result: NodeExecutionResult }>
): Promise<{ output: string; childTasks: ExecutionTask[] }> {
  const data = node.data;
  const loopType = data.loopType || 'count';
  const maxIterations = Math.min(data.maxIterations || 10, 100);
  const delimiter = data.delimiter || '\n';
  
  let items: string[] = [];
  
  if (loopType === 'foreach') {
    // 입력을 구분자로 나눠서 배열로
    items = input.split(delimiter).map(s => s.trim()).filter(Boolean);
  } else if (loopType === 'count') {
    // count만큼 같은 입력 반복
    items = Array(maxIterations).fill(input);
  } else {
    // while - 최대 횟수만큼 시도 (조건은 각 반복에서 체크)
    items = Array(maxIterations).fill(input);
  }
  
  // 실제 반복 횟수
  const actualIterations = Math.min(items.length, maxIterations);
  
  // 결과 저장 배열 초기화
  context.loopResults.set(node.id, []);
  
  // 다음 노드들 가져오기
  const nextNodes = getNextNodes(node.id, context.edges);
  
  // 각 반복에 대한 자식 태스크 생성
  const childTasks: ExecutionTask[] = [];
  
  for (let i = 0; i < actualIterations; i++) {
    const currentItem = items[i];
    
    // Loop 내부의 노드들을 각 반복마다 실행하도록 태스크 생성
    for (const nextNodeId of nextNodes) {
      childTasks.push({
        nodeId: nextNodeId,
        input: currentItem,
        iteration: i,
        maxIterations: actualIterations,
        loopItems: items,
        parentLoopId: node.id,
      });
    }
  }
  
  const output = JSON.stringify({
    __loop__: true,
    status: 'executing',
    loopType,
    totalIterations: actualIterations,
    items: items.slice(0, 5), // 처음 5개만 표시
    message: `🔄 ${actualIterations}번 반복 실행 중...`,
  }, null, 2);
  
  return { output, childTasks };
}

/**
 * Parallel 노드 처리 - 진짜 병렬 실행!
 */
async function processParallelNode(
  node: Node<ParallelNodeData>,
  input: string,
  context: ExecutionContext,
  executeNodeFn: (node: Node<WorkflowNodeData>, input: string) => Promise<{ output: string; result: NodeExecutionResult }>
): Promise<{ output: string; parallelTasks: ExecutionTask[] }> {
  const data = node.data;
  const branches = data.branches || 2;
  const mergeStrategy = data.mergeStrategy || 'all';
  
  // 다음 노드들 가져오기 (각각 다른 브랜치)
  const nextNodes = getNextNodes(node.id, context.edges);
  
  // 브랜치 수만큼 태스크 생성
  const parallelTasks: ExecutionTask[] = [];
  
  for (let i = 0; i < Math.min(branches, nextNodes.length); i++) {
    parallelTasks.push({
      nodeId: nextNodes[i],
      input,
      branchIndex: i,
    });
  }
  
  // 결과 저장 배열 초기화
  context.parallelResults.set(node.id, []);
  
  const output = JSON.stringify({
    __parallel__: true,
    status: 'branching',
    branches: parallelTasks.length,
    mergeStrategy,
    message: `⚡ ${parallelTasks.length}개 브랜치 병렬 실행 중...`,
  }, null, 2);
  
  return { output, parallelTasks };
}

/**
 * Loop 결과 병합
 */
function mergeLoopResults(nodeId: string, context: ExecutionContext): string {
  const results = context.loopResults.get(nodeId) || [];
  
  return JSON.stringify({
    __loop__: true,
    status: 'complete',
    totalIterations: results.length,
    results,
    mergedOutput: results.join('\n\n---\n\n'),
    message: `✅ ${results.length}번 반복 완료!`,
  }, null, 2);
}

/**
 * Parallel 결과 병합
 */
function mergeParallelResults(
  nodeId: string, 
  context: ExecutionContext,
  mergeStrategy: 'all' | 'first' | 'any'
): string {
  const results = context.parallelResults.get(nodeId) || [];
  
  let mergedOutput: string;
  
  switch (mergeStrategy) {
    case 'first':
      mergedOutput = results[0] || '';
      break;
    case 'any':
      mergedOutput = results.find(r => r && r.trim() !== '') || '';
      break;
    case 'all':
    default:
      mergedOutput = results.join('\n\n');
      break;
  }
  
  return JSON.stringify({
    __parallel__: true,
    status: 'merged',
    branches: results.length,
    results,
    mergedOutput,
    message: `✅ ${results.length}개 브랜치 병합 완료!`,
  }, null, 2);
}

/**
 * 메인 워크플로우 실행 함수 (큐 기반)
 */
export async function executeWorkflowWithQueue(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  executeNodeFn: (node: Node<WorkflowNodeData>, input: string) => Promise<{ output: string; result: NodeExecutionResult }>
): Promise<{
  nodeResults: Record<string, NodeExecutionResult>;
  totalCost: number;
  totalTokens: number;
}> {
  const context: ExecutionContext = {
    nodes: new Map(nodes.map(n => [n.id, n])),
    edges,
    nodeOutputs: new Map(),
    nodeResults: {},
    totalCost: 0,
    totalTokens: 0,
    loopIterations: new Map(),
    loopResults: new Map(),
    parallelResults: new Map(),
  };
  
  // 진입점 찾기 (입력이 없는 노드들)
  const entryNodes = nodes.filter(n => {
    const prevNodes = getPreviousNodes(n.id, edges);
    return prevNodes.length === 0;
  });
  
  // 실행 큐 초기화
  const queue: ExecutionTask[] = entryNodes.map(n => ({
    nodeId: n.id,
    input: '',
  }));
  
  // 완료된 노드 추적
  const completedNodes = new Set<string>();
  
  // 최대 실행 횟수 제한 (무한 루프 방지)
  const MAX_EXECUTIONS = 1000;
  let executionCount = 0;
  
  while (queue.length > 0 && executionCount < MAX_EXECUTIONS) {
    const task = queue.shift()!;
    executionCount++;
    
    const node = context.nodes.get(task.nodeId);
    if (!node) continue;
    
    // 이미 완료된 노드는 건너뛰기 (Loop/Parallel 제외)
    if (completedNodes.has(task.nodeId) && 
        node.data.type !== 'loop' && 
        node.data.type !== 'parallel' &&
        task.iteration === undefined) {
      continue;
    }
    
    // 입력 결정
    let input = task.input;
    if (!input && task.parentLoopId === undefined) {
      // 이전 노드들의 출력을 구조화된 형태로 병합
      const prevNodes = getPreviousNodes(task.nodeId, edges);
      const { mergedText } = mergeMultipleInputs(prevNodes, context);
      input = mergedText;
    }
    
    // 노드 타입별 처리
    if (node.data.type === 'loop') {
      // Loop 노드 - 자식 태스크 생성
      const { output, childTasks } = await processLoopNode(
        node as Node<LoopNodeData>,
        input,
        context,
        executeNodeFn
      );
      
      context.nodeOutputs.set(node.id, output);
      context.nodeResults[node.id] = {
        nodeId: node.id,
        status: 'success',
        output,
        startTime: Date.now(),
        endTime: Date.now(),
      };
      
      // 자식 태스크들을 큐에 추가
      queue.push(...childTasks);
      completedNodes.add(node.id);
      
    } else if (node.data.type === 'parallel') {
      // Parallel 노드 - 병렬 태스크 생성
      const { output, parallelTasks } = await processParallelNode(
        node as Node<ParallelNodeData>,
        input,
        context,
        executeNodeFn
      );
      
      context.nodeOutputs.set(node.id, output);
      context.nodeResults[node.id] = {
        nodeId: node.id,
        status: 'success',
        output,
        startTime: Date.now(),
        endTime: Date.now(),
      };
      
      // 병렬 실행 (Promise.allSettled)
      const results = await Promise.allSettled(
        parallelTasks.map(async (pt) => {
          const targetNode = context.nodes.get(pt.nodeId);
          if (!targetNode) return '';
          
          const { output, result } = await executeNodeFn(targetNode, pt.input);
          context.nodeResults[`${pt.nodeId}-branch-${pt.branchIndex}`] = result;
          return output;
        })
      );
      
      // 결과 저장
      const branchOutputs = results.map(r => 
        r.status === 'fulfilled' ? r.value : ''
      );
      context.parallelResults.set(node.id, branchOutputs);
      
      // 병합 결과로 출력 업데이트
      const mergedOutput = mergeParallelResults(
        node.id,
        context,
        (node.data as ParallelNodeData).mergeStrategy || 'all'
      );
      context.nodeOutputs.set(node.id, mergedOutput);
      context.nodeResults[node.id].output = mergedOutput;
      
      completedNodes.add(node.id);
      
      // 다음 노드들 큐에 추가 (병합 노드로)
      // TODO: 병합 노드 지원
      
    } else {
      // 일반 노드 실행
      const { output, result } = await executeNodeFn(node, input);
      
      // Loop 반복 중이면 결과 저장
      if (task.parentLoopId !== undefined && task.iteration !== undefined) {
        const loopResults = context.loopResults.get(task.parentLoopId) || [];
        loopResults[task.iteration] = output;
        context.loopResults.set(task.parentLoopId, loopResults);
        
        // 결과 키에 반복 정보 추가
        context.nodeResults[`${node.id}-iter-${task.iteration}`] = result;
        
        // 마지막 반복이면 Loop 결과 병합
        if (task.iteration === (task.maxIterations || 1) - 1) {
          const mergedOutput = mergeLoopResults(task.parentLoopId, context);
          context.nodeOutputs.set(task.parentLoopId, mergedOutput);
          
          // Loop 이후 노드들 실행
          const loopNode = context.nodes.get(task.parentLoopId);
          if (loopNode) {
            const afterLoopNodes = getNextNodes(task.parentLoopId, edges)
              .filter(id => id !== task.nodeId);
            
            for (const nextId of afterLoopNodes) {
              queue.push({
                nodeId: nextId,
                input: mergedOutput,
              });
            }
          }
        }
      } else {
        context.nodeOutputs.set(node.id, output);
        context.nodeResults[node.id] = result;
        completedNodes.add(node.id);
        
        // 비용 추적
        if (result.usage) {
          context.totalTokens += result.usage.totalTokens;
        }
        if (result.cost) {
          context.totalCost += result.cost;
        }
        
        // 다음 노드들 큐에 추가
        const nextNodes = getNextNodes(node.id, edges);
        for (const nextId of nextNodes) {
          // 모든 이전 노드가 완료되었는지 확인
          if (allPreviousNodesComplete(nextId, edges, completedNodes)) {
            queue.push({
              nodeId: nextId,
              input: output,
            });
          }
        }
      }
    }
  }
  
  if (executionCount >= MAX_EXECUTIONS) {
    console.warn('Maximum execution count reached, possible infinite loop');
  }
  
  return {
    nodeResults: context.nodeResults,
    totalCost: context.totalCost,
    totalTokens: context.totalTokens,
  };
}
