// lib/workflow/engine.ts
import { UnifiedNodeData } from './types';

export type Node = {
  id: string;
  data: UnifiedNodeData;
};

export type Edge = {
  source: string;
  target: string;
};

// 실제 실행 함수들
const triggerNode = async (node: Node) => {
  console.log(`🚀 [트리거] ${node.data.label} 시작`);
  await new Promise(r => setTimeout(r, 800));
  console.log(`✅ [트리거] 완료`);
  return { success: true, output: "트리거 데이터" };
};

const agentNode = async (node: Node, input: any) => {
  console.log(`🤖 [에이전트] ${node.data.label} 실행 중... 입력:`, input);
  await new Promise(r => setTimeout(r, 1500));
  const result = `AI가 처리한 결과: ${input} + 추가 분석`;
  console.log(`✅ [에이전트] 완료 →`, result);
  return { success: true, output: result };
};

const outputNode = async (node: Node, input: any) => {
  console.log(`📤 [출력] ${node.data.label} → 최종 결과 출력`);
  console.log(`\n🎉 최종 결과:\n${JSON.stringify(input, null, 2)}\n`);
  alert("워크플로우 실행 완료! 콘솔 확인하세요 🔥");
};

// Multi-Agent Supervisor (실제 순서대로 실행)
export const runWorkflow = async (nodes: Node[], edges: Edge[]) => {
  console.clear();
  console.log("🚀 워크플로우 실행 시작\n");

  const graph = new Map<string, string[]>();
  edges.forEach(e => {
    if (!graph.has(e.source)) graph.set(e.source, []);
    graph.get(e.source)!.push(e.target);
  });

  let currentOutput: any = null;
  let currentNodeId = "1"; // 항상 1번부터 시작

  while (currentNodeId) {
    const node = nodes.find(n => n.id === currentNodeId)!;
    let result;

    if (node.data.type === 'trigger') {
      result = await triggerNode(node);
    } else if (node.data.type === 'agent') {
      result = await agentNode(node, currentOutput);
    } else if (node.data.type === 'output') {
      result = await outputNode(node, currentOutput);
    }

    currentOutput = result?.output;
    const nextIds = graph.get(currentNodeId) || [];
    currentNodeId = nextIds[0] || "";
  }

  console.log("🎉 워크플로우 전체 실행 완료!");
};
