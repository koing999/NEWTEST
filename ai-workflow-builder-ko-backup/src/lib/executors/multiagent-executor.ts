/**
 * Multi-Agent 노드 실행기 (Executor)
 * 
 * Supervisor-Worker 패턴을 사용하여 여러 AI 에이전트를 
 * 오케스트레이션하고 결과를 종합합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { MultiAgentNodeData, LLMProvider, LLMModel, LLMMessage } from '@/types/workflow';
import { 
  MultiAgentSupervisor, 
  executeAgentsParallel,
  AgentRole,
  AGENT_CONFIGS,
  formatMultiAgentResult,
  formatAgentResult,
  AgentResult,
  MultiAgentExecutionResult,
} from '@/lib/multi-agent/supervisor';

// ============================================
// 타입 정의
// ============================================

export interface MultiAgentExecutorResult {
  success: boolean;
  output: string;
  structuredResult?: MultiAgentExecutionResult;
  agentResults?: AgentResult[];
  error?: string;
  cost?: number;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  executionTime?: number;
}

export interface MultiAgentExecutorConfig {
  analysisMode: 'parallel' | 'sequential' | 'supervisor';
  outputFormat: 'combined' | 'separate' | 'comparison';
  maxIterations?: number;
  onAgentStart?: (agent: AgentRole) => void;
  onAgentComplete?: (result: AgentResult) => void;
  onProgress?: (progress: number, message: string) => void;
}

// ============================================
// LLM 호출 함수 타입
// ============================================

type LLMCallFunction = (
  provider: LLMProvider,
  model: LLMModel,
  messages: LLMMessage[]
) => Promise<{ content: string; usage?: any }>;

// ============================================
// Multi-Agent 실행기
// ============================================

export async function executeMultiAgent(
  input: string,
  nodeData: MultiAgentNodeData,
  callLLM: LLMCallFunction,
  config?: Partial<MultiAgentExecutorConfig>
): Promise<MultiAgentExecutorResult> {
  const startTime = Date.now();
  
  // 기본 설정
  const analysisMode = (nodeData.analysisMode || config?.analysisMode || 'parallel') as 'parallel' | 'sequential' | 'supervisor';
  const outputFormat = nodeData.outputFormat || config?.outputFormat || 'combined';
  const selectedAgents = (nodeData.agents || []) as AgentRole[];
  const maxIterations = config?.maxIterations || 10;

  // 에이전트 선택 검증
  if (selectedAgents.length === 0) {
    return {
      success: false,
      output: '',
      error: '최소 1개 이상의 에이전트를 선택해주세요.',
      executionTime: Date.now() - startTime,
    };
  }

  try {
    let result: MultiAgentExecutorResult;

    switch (analysisMode) {
      case 'supervisor':
        result = await executeSupervisorMode(
          input, 
          selectedAgents, 
          callLLM, 
          maxIterations,
          outputFormat,
          config
        );
        break;
      
      case 'sequential':
        result = await executeSequentialMode(
          input, 
          selectedAgents, 
          callLLM, 
          outputFormat,
          config
        );
        break;
      
      case 'parallel':
      default:
        result = await executeParallelMode(
          input, 
          selectedAgents, 
          callLLM, 
          outputFormat,
          config
        );
        break;
    }

    result.executionTime = Date.now() - startTime;
    return result;

  } catch (error) {
    return {
      success: false,
      output: '',
      error: `Multi-Agent 실행 오류: ${error}`,
      executionTime: Date.now() - startTime,
    };
  }
}

// ============================================
// Supervisor 모드 실행
// ============================================

async function executeSupervisorMode(
  input: string,
  agents: AgentRole[],
  callLLM: LLMCallFunction,
  maxIterations: number,
  outputFormat: string,
  config?: Partial<MultiAgentExecutorConfig>
): Promise<MultiAgentExecutorResult> {
  const supervisor = new MultiAgentSupervisor(callLLM, maxIterations);
  
  config?.onProgress?.(0, '🧑‍💼 조과장이 작업을 분석 중...');
  
  const result = await supervisor.execute(input, agents);
  
  // 진행 상황 콜백
  result.results.forEach((r, i) => {
    config?.onAgentComplete?.(r);
    config?.onProgress?.((i + 1) / result.results.length * 100, 
      `${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name} 완료`);
  });

  const output = formatOutput(result.results, result.finalSummary, outputFormat);

  return {
    success: true,
    output,
    structuredResult: result,
    agentResults: result.results,
    cost: result.totalCost,
    tokens: {
      input: 0, // Supervisor 모드에서는 개별 토큰 추적 어려움
      output: 0,
      total: result.totalTokens,
    },
  };
}

// ============================================
// 병렬 모드 실행
// ============================================

async function executeParallelMode(
  input: string,
  agents: AgentRole[],
  callLLM: LLMCallFunction,
  outputFormat: string,
  config?: Partial<MultiAgentExecutorConfig>
): Promise<MultiAgentExecutorResult> {
  config?.onProgress?.(0, '⚡ 에이전트 병렬 실행 중...');
  
  // 각 에이전트 시작 알림
  agents.forEach(agent => config?.onAgentStart?.(agent));
  
  const results = await executeAgentsParallel(input, agents, callLLM);
  
  // 완료 알림
  results.forEach((r, i) => {
    config?.onAgentComplete?.(r);
    config?.onProgress?.((i + 1) / results.length * 100, 
      `${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name} 완료`);
  });

  // 종합 요약 생성
  const summary = await generateCombinedSummary(input, results, callLLM);
  const output = formatOutput(results, summary, outputFormat);

  // 토큰 및 비용 계산
  const totalTokens = results.reduce((acc, r) => acc + (r.usage?.totalTokens || 0), 0);

  return {
    success: true,
    output,
    agentResults: results,
    cost: totalTokens * 0.00001,
    tokens: {
      input: results.reduce((acc, r) => acc + (r.usage?.promptTokens || 0), 0),
      output: results.reduce((acc, r) => acc + (r.usage?.completionTokens || 0), 0),
      total: totalTokens,
    },
  };
}

// ============================================
// 순차 모드 실행
// ============================================

async function executeSequentialMode(
  input: string,
  agents: AgentRole[],
  callLLM: LLMCallFunction,
  outputFormat: string,
  config?: Partial<MultiAgentExecutorConfig>
): Promise<MultiAgentExecutorResult> {
  const results: AgentResult[] = [];
  let totalTokens = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const agentConfig = AGENT_CONFIGS[agent];
    
    config?.onAgentStart?.(agent);
    config?.onProgress?.(
      (i / agents.length) * 100, 
      `${agentConfig.emoji} ${agentConfig.name} 분석 중...`
    );

    // 이전 결과를 컨텍스트로 전달
    const context = results.length > 0
      ? `\n\n[이전 분석 결과]\n${results.map(r => 
          `${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}:\n${r.output.slice(0, 500)}...`
        ).join('\n\n')}`
      : '';

    const startTime = Date.now();
    
    try {
      const response = await callLLM(
        agentConfig.provider,
        agentConfig.model,
        [
          { role: 'system', content: agentConfig.systemPrompt },
          { role: 'user', content: `${input}${context}` },
        ]
      );

      const result: AgentResult = {
        agent,
        output: response.content,
        usage: response.usage,
        latency: Date.now() - startTime,
      };

      results.push(result);
      config?.onAgentComplete?.(result);

      if (response.usage) {
        totalTokens += response.usage.totalTokens || 0;
        totalInputTokens += response.usage.promptTokens || 0;
        totalOutputTokens += response.usage.completionTokens || 0;
      }
    } catch (error) {
      results.push({
        agent,
        output: `오류 발생: ${error}`,
        latency: Date.now() - startTime,
      });
    }
  }

  config?.onProgress?.(100, '분석 완료!');

  // 종합 요약 생성
  const summary = await generateCombinedSummary(input, results, callLLM);
  const output = formatOutput(results, summary, outputFormat);

  return {
    success: true,
    output,
    agentResults: results,
    cost: totalTokens * 0.00001,
    tokens: {
      input: totalInputTokens,
      output: totalOutputTokens,
      total: totalTokens,
    },
  };
}

// ============================================
// 종합 요약 생성
// ============================================

async function generateCombinedSummary(
  input: string,
  results: AgentResult[],
  callLLM: LLMCallFunction
): Promise<string> {
  if (results.length === 0) {
    return '분석 결과가 없습니다.';
  }

  try {
    const response = await callLLM(
      'groq',
      'meta-llama/llama-4-maverick-17b-128e-instruct',
      [
        { 
          role: 'system', 
          content: `당신은 여러 전문가의 분석 결과를 종합하여 간결하고 명확한 요약을 작성합니다.

핵심 인사이트만 추출하여 3-5개의 핵심 포인트로 정리해주세요.
각 포인트는 명확하고 실행 가능한 통찰이어야 합니다.`
        },
        {
          role: 'user',
          content: `원본 질문: ${input}

전문가 분석 결과:
${results.map(r => `
[${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}]
${r.output.slice(0, 800)}
`).join('\n---\n')}

위 분석들의 핵심을 요약해주세요.`
        }
      ]
    );

    return response.content;
  } catch (error) {
    // 에러 시 기본 요약
    return `**종합 분석 결과**\n\n` + 
      results.map(r => 
        `• ${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}: ${r.output.slice(0, 150)}...`
      ).join('\n');
  }
}

// ============================================
// 출력 포맷팅
// ============================================

function formatOutput(
  results: AgentResult[], 
  summary: string, 
  format: string
): string {
  switch (format) {
    case 'separate':
      return results.map(r => formatAgentResult(r)).join('\n\n---\n\n');
    
    case 'comparison':
      return formatComparisonOutput(results, summary);
    
    case 'combined':
    default:
      return formatCombinedOutput(results, summary);
  }
}

function formatCombinedOutput(results: AgentResult[], summary: string): string {
  let output = '# 🤖 AI 멀티 에이전트 분석 결과\n\n';
  
  // 참여 에이전트
  output += '**분석 참여**: ' + 
    results.map(r => `${AGENT_CONFIGS[r.agent].emoji}`).join(' ') + '\n\n';
  
  // 요약
  output += '## 📋 핵심 요약\n\n';
  output += summary + '\n\n';
  
  // 상세 분석
  output += '---\n\n## 📊 상세 분석\n\n';
  for (const r of results) {
    output += `### ${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}\n\n`;
    output += r.output + '\n\n';
  }
  
  return output;
}

function formatComparisonOutput(results: AgentResult[], summary: string): string {
  let output = '# 📊 에이전트별 분석 비교\n\n';
  
  // 비교 테이블 (마크다운)
  output += '| 항목 | ' + results.map(r => AGENT_CONFIGS[r.agent].emoji).join(' | ') + ' |\n';
  output += '|---' + '|---'.repeat(results.length) + '|\n';
  
  // 각 에이전트 요약 (첫 100자)
  output += '| 핵심 의견 | ' + 
    results.map(r => r.output.slice(0, 100).replace(/\n/g, ' ') + '...').join(' | ') + ' |\n';
  
  output += '\n---\n\n';
  
  // 종합 의견
  output += '## 🎯 종합 분석\n\n' + summary + '\n\n';
  
  // 상세 내용
  output += '---\n\n## 📝 각 에이전트 상세 분석\n\n';
  for (const r of results) {
    output += `<details>\n<summary>${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}</summary>\n\n`;
    output += r.output + '\n\n</details>\n\n';
  }
  
  return output;
}

// ============================================
// 기본 내보내기
// ============================================

export default executeMultiAgent;

export { 
  AGENT_CONFIGS,
  formatAgentResult,
  formatMultiAgentResult,
};
