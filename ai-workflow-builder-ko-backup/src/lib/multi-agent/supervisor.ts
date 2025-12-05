/**
 * Multi-Agent Supervisor 패턴 (Flowise 스타일)
 * 
 * 조과장(Supervisor)이 여러 전문가(Workers)를 관리하고
 * 작업을 분배하며 결과를 종합합니다.
 * 
 * Workers:
 * - 회계사 (Accountant): 재무제표 분석
 * - IB 전문가 (IB Expert): 투자 분석
 * - 맥킨지 컨설턴트 (McKinsey): 전략 분석
 * - 기획자 (Planner): 작업 계획
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { LLMProvider, LLMModel, LLMMessage } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

export type AgentRole = 'supervisor' | 'accountant' | 'ib' | 'mckinsey' | 'planner' | 'jogwajang';

export interface AgentConfig {
  role: AgentRole;
  name: string;
  emoji: string;
  description: string;
  systemPrompt: string;
  specialties: string[];
  provider: LLMProvider;
  model: LLMModel;
}

export interface SupervisorDecision {
  nextAgent: AgentRole | 'FINISH';
  reason: string;
  taskDescription?: string;
}

export interface AgentResult {
  agent: AgentRole;
  output: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency?: number;
}

export interface MultiAgentExecutionResult {
  results: AgentResult[];
  finalSummary: string;
  totalTokens: number;
  totalCost: number;
  executionPath: AgentRole[];
}

// ============================================
// 에이전트 설정
// ============================================

export const AGENT_CONFIGS: Record<AgentRole, AgentConfig> = {
  supervisor: {
    role: 'supervisor',
    name: '조과장 (총괄)',
    emoji: '🧑‍💼',
    description: '여러 전문가를 관리하고 작업을 분배하는 총괄 관리자',
    systemPrompt: `당신은 "조과장"입니다. 여러 전문가 AI를 관리하는 총괄 관리자 역할을 합니다.

당신의 역할:
1. 사용자 요청을 분석하고 적절한 전문가에게 작업을 분배
2. 전문가들의 결과를 검토하고 다음 단계 결정
3. 최종 결과를 종합하여 사용자에게 전달

다음 전문가들을 관리합니다:
- accountant (회계사): 재무제표, 회계, 숫자 분석
- ib (IB 전문가): 투자, 가치평가, M&A
- mckinsey (맥킨지 컨설턴트): 전략, 시장 분석
- planner (기획자): 계획, 단계별 실행

응답 형식 (JSON):
{
  "nextAgent": "accountant" | "ib" | "mckinsey" | "planner" | "FINISH",
  "reason": "선택 이유",
  "taskDescription": "해당 전문가에게 전달할 구체적인 작업 지시"
}

FINISH는 모든 분석이 완료되어 사용자에게 결과를 전달할 준비가 되었을 때만 선택하세요.`,
    specialties: ['작업 분배', '결과 종합', '품질 관리'],
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  },

  jogwajang: {
    role: 'jogwajang',
    name: '조과장',
    emoji: '🧑‍💼',
    description: '사내 대출금리 정책 전문가',
    systemPrompt: `당신은 "조과장"입니다. 30년 경력의 사내 대출금리 정책 전문가입니다.

🧑‍💼 캐릭터 설정:
- 30년차 여신전문 과장
- 따뜻하지만 원칙주의적
- "~요" 체를 사용하며 친근하게 설명
- 복잡한 금융 용어를 쉽게 풀어서 설명
- 실무 경험에 기반한 실용적 조언

💰 전문 분야:
1. 신용평가 및 등급 산정
2. 담보대출 금리 산정
3. 리스크 관리 및 부실채권 예방
4. 여신 심사 기준 및 프로세스
5. 금융 규제 및 컴플라이언스

🎯 응답 원칙:
- 항상 근거와 규정을 함께 설명
- 실무 사례를 들어 이해하기 쉽게
- 위험 요소는 반드시 언급
- 판단이 어려운 경우 상위 결재 권고`,
    specialties: ['대출 금리', '신용평가', '담보 평가', '리스크 관리'],
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  },

  accountant: {
    role: 'accountant',
    name: '회계사 AI',
    emoji: '📊',
    description: '재무제표 분석 및 회계 전문가',
    systemPrompt: `당신은 공인회계사입니다. 재무제표를 정밀하게 분석합니다.

📊 전문 분야:
1. 재무제표 분석 (재무상태표, 손익계산서, 현금흐름표)
2. 재무비율 분석 (수익성, 안정성, 성장성)
3. 회계 기준 해석 (K-IFRS, K-GAAP)
4. 분기별 실적 비교 분석
5. 이상 징후 탐지

🎯 분석 원칙:
- 숫자는 반드시 근거와 함께 제시
- 전년 대비, 전분기 대비 변화 명시
- 업계 평균과 비교
- 숨은 리스크 식별
- 보수적 관점 유지

📝 응답 형식:
1. 핵심 요약 (3줄)
2. 주요 재무지표 분석
3. 전년대비 변화
4. 주의 사항
5. 결론`,
    specialties: ['재무제표', '비율분석', '회계감사', '실적분석'],
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  },

  ib: {
    role: 'ib',
    name: 'IB 전문가 AI',
    emoji: '💼',
    description: '투자은행 및 기업가치 평가 전문가',
    systemPrompt: `당신은 골드만삭스 출신 IB 전문가입니다. 기업 가치평가와 투자 분석을 전문으로 합니다.

💼 전문 분야:
1. 기업가치평가 (DCF, Comparable, M&A)
2. IPO 및 상장 분석
3. 인수합병 타당성 검토
4. 자본구조 최적화
5. 투자 리스크 분석

🎯 분석 관점:
- 시장 가치 vs 내재 가치
- 성장 잠재력 평가
- 시너지 효과 분석
- Exit 전략 검토
- 거래 구조 설계

📝 응답 형식:
1. 투자 요약 (Investment Thesis)
2. 밸류에이션 분석
3. 리스크 요인
4. 기회 요인
5. 투자 권고`,
    specialties: ['가치평가', 'M&A', 'IPO', '투자분석'],
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  },

  mckinsey: {
    role: 'mckinsey',
    name: '맥킨지 컨설턴트 AI',
    emoji: '📈',
    description: '전략 컨설팅 및 시장 분석 전문가',
    systemPrompt: `당신은 맥킨지 출신 전략 컨설턴트입니다. MECE 원칙으로 구조화된 분석을 제공합니다.

📈 전문 분야:
1. 시장 분석 (TAM/SAM/SOM)
2. 경쟁 분석 (Porter's 5 Forces)
3. 전략 프레임워크 (BCG Matrix, SWOT)
4. 성장 전략 수립
5. 운영 효율화

🎯 분석 원칙:
- MECE (Mutually Exclusive, Collectively Exhaustive)
- Hypothesis-driven approach
- Data-driven insights
- "So what?" 관점 유지
- Actionable recommendations

📝 응답 형식:
1. Executive Summary
2. 현황 분석 (Situation)
3. 문제점/기회 (Complication)
4. 질문 프레임 (Question)
5. 전략적 제언 (Answer)`,
    specialties: ['전략', '시장분석', '경쟁분석', '성장전략'],
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  },

  planner: {
    role: 'planner',
    name: '기획자 AI',
    emoji: '📋',
    description: '프로젝트 기획 및 실행 계획 전문가',
    systemPrompt: `당신은 프로젝트 기획 전문가입니다. 복잡한 작업을 단계별로 분해하고 실행 계획을 수립합니다.

📋 전문 분야:
1. 프로젝트 계획 수립
2. 작업 분해 구조 (WBS)
3. 일정 관리 (Gantt Chart)
4. 리스크 관리
5. 자원 배분

🎯 기획 원칙:
- SMART 목표 설정
- 단계별 마일스톤 정의
- 의존성 관계 파악
- 버퍼 시간 확보
- 측정 가능한 성과 지표

📝 응답 형식:
1. 목표 정의
2. 단계별 계획
3. 소요 시간/자원
4. 리스크 및 대응
5. 성공 지표`,
    specialties: ['기획', '일정관리', 'WBS', '리스크관리'],
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  },
};

// ============================================
// Supervisor 클래스
// ============================================

export class MultiAgentSupervisor {
  private maxIterations: number;
  private callLLM: (
    provider: LLMProvider,
    model: LLMModel,
    messages: LLMMessage[]
  ) => Promise<{ content: string; usage?: any }>;

  constructor(
    callLLM: (
      provider: LLMProvider,
      model: LLMModel,
      messages: LLMMessage[]
    ) => Promise<{ content: string; usage?: any }>,
    maxIterations: number = 10
  ) {
    this.callLLM = callLLM;
    this.maxIterations = maxIterations;
  }

  /**
   * Supervisor가 다음 에이전트를 결정
   */
  async decideNextAgent(
    userInput: string,
    previousResults: AgentResult[],
    availableAgents: AgentRole[]
  ): Promise<SupervisorDecision> {
    const supervisorConfig = AGENT_CONFIGS.supervisor;
    
    // 이전 결과 요약
    const previousResultsSummary = previousResults.length > 0
      ? previousResults.map(r => 
          `[${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}]\n${r.output.slice(0, 500)}...`
        ).join('\n\n')
      : '(아직 없음)';

    const messages: LLMMessage[] = [
      { role: 'system', content: supervisorConfig.systemPrompt },
      { 
        role: 'user', 
        content: `사용자 요청: ${userInput}

사용 가능한 전문가: ${availableAgents.join(', ')}

이전 분석 결과:
${previousResultsSummary}

다음으로 어떤 전문가에게 작업을 맡길지 결정해주세요.
모든 필요한 분석이 완료되었다면 FINISH를 선택하세요.

JSON 형식으로 응답해주세요:
{
  "nextAgent": "에이전트명 또는 FINISH",
  "reason": "선택 이유",
  "taskDescription": "전문가에게 전달할 작업 지시"
}`
      }
    ];

    try {
      const response = await this.callLLM(
        supervisorConfig.provider,
        supervisorConfig.model,
        messages
      );

      // JSON 파싱
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as SupervisorDecision;
      }

      // JSON 파싱 실패 시 기본값
      return {
        nextAgent: 'FINISH',
        reason: '응답 파싱 실패',
      };
    } catch (error) {
      console.error('Supervisor decision error:', error);
      return {
        nextAgent: 'FINISH',
        reason: `오류 발생: ${error}`,
      };
    }
  }

  /**
   * 특정 에이전트 실행
   */
  async executeAgent(
    agent: AgentRole,
    userInput: string,
    taskDescription: string,
    previousResults: AgentResult[]
  ): Promise<AgentResult> {
    const agentConfig = AGENT_CONFIGS[agent];
    
    // 컨텍스트 구성
    const context = previousResults.length > 0
      ? `\n\n[이전 분석 결과]\n${previousResults.map(r => 
          `${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}:\n${r.output.slice(0, 300)}...`
        ).join('\n\n')}`
      : '';

    const messages: LLMMessage[] = [
      { role: 'system', content: agentConfig.systemPrompt },
      { 
        role: 'user', 
        content: `작업 지시: ${taskDescription}

원본 요청: ${userInput}
${context}

위 작업을 분석하고 결과를 제공해주세요.`
      }
    ];

    const startTime = Date.now();

    try {
      const response = await this.callLLM(
        agentConfig.provider,
        agentConfig.model,
        messages
      );

      return {
        agent,
        output: response.content,
        usage: response.usage,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        agent,
        output: `오류 발생: ${error}`,
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * 전체 Multi-Agent 워크플로우 실행
   */
  async execute(
    userInput: string,
    selectedAgents: AgentRole[] = ['accountant', 'ib', 'mckinsey']
  ): Promise<MultiAgentExecutionResult> {
    const results: AgentResult[] = [];
    const executionPath: AgentRole[] = [];
    let totalTokens = 0;
    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;

      // Supervisor 결정
      const decision = await this.decideNextAgent(userInput, results, selectedAgents);
      
      if (decision.nextAgent === 'FINISH') {
        break;
      }

      // 선택된 에이전트가 유효한지 확인
      if (!selectedAgents.includes(decision.nextAgent as AgentRole)) {
        console.warn(`Invalid agent selected: ${decision.nextAgent}`);
        break;
      }

      // 에이전트 실행
      const agentResult = await this.executeAgent(
        decision.nextAgent as AgentRole,
        userInput,
        decision.taskDescription || userInput,
        results
      );

      results.push(agentResult);
      executionPath.push(decision.nextAgent as AgentRole);
      
      if (agentResult.usage) {
        totalTokens += agentResult.usage.totalTokens || 0;
      }
    }

    // 최종 요약 생성
    const finalSummary = await this.generateFinalSummary(userInput, results);

    return {
      results,
      finalSummary,
      totalTokens,
      totalCost: totalTokens * 0.00001, // 대략적인 비용 추정
      executionPath,
    };
  }

  /**
   * 최종 결과 요약 생성
   */
  private async generateFinalSummary(
    userInput: string,
    results: AgentResult[]
  ): Promise<string> {
    if (results.length === 0) {
      return '분석 결과가 없습니다.';
    }

    const supervisorConfig = AGENT_CONFIGS.supervisor;
    
    const messages: LLMMessage[] = [
      { 
        role: 'system', 
        content: `당신은 여러 전문가의 분석 결과를 종합하여 최종 보고서를 작성하는 총괄 관리자입니다.

각 전문가의 분석을 통합하여:
1. 핵심 인사이트 요약
2. 공통된 의견과 상충되는 의견 정리
3. 종합적인 결론 및 제언
4. 추가 검토가 필요한 사항

명확하고 구조화된 최종 보고서를 작성하세요.`
      },
      {
        role: 'user',
        content: `원본 요청: ${userInput}

전문가 분석 결과:
${results.map(r => `
### ${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}
${r.output}
`).join('\n---\n')}

위 분석들을 종합하여 최종 보고서를 작성해주세요.`
      }
    ];

    try {
      const response = await this.callLLM(
        supervisorConfig.provider,
        supervisorConfig.model,
        messages
      );

      return response.content;
    } catch (error) {
      // 에러 발생 시 기본 요약
      return results.map(r => 
        `## ${AGENT_CONFIGS[r.agent].emoji} ${AGENT_CONFIGS[r.agent].name}\n${r.output}`
      ).join('\n\n---\n\n');
    }
  }
}

// ============================================
// 단순 병렬 실행 함수 (Supervisor 없이)
// ============================================

export async function executeAgentsParallel(
  userInput: string,
  selectedAgents: AgentRole[],
  callLLM: (
    provider: LLMProvider,
    model: LLMModel,
    messages: LLMMessage[]
  ) => Promise<{ content: string; usage?: any }>
): Promise<AgentResult[]> {
  const promises = selectedAgents.map(async (agent) => {
    const config = AGENT_CONFIGS[agent];
    const startTime = Date.now();

    try {
      const response = await callLLM(
        config.provider,
        config.model,
        [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: userInput },
        ]
      );

      return {
        agent,
        output: response.content,
        usage: response.usage,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        agent,
        output: `오류 발생: ${error}`,
        latency: Date.now() - startTime,
      };
    }
  });

  return Promise.all(promises);
}

// ============================================
// 편의 함수들
// ============================================

export function getAgentConfig(role: AgentRole): AgentConfig {
  return AGENT_CONFIGS[role];
}

export function getAvailableAgents(): AgentRole[] {
  return Object.keys(AGENT_CONFIGS).filter(
    role => role !== 'supervisor'
  ) as AgentRole[];
}

export function formatAgentResult(result: AgentResult): string {
  const config = AGENT_CONFIGS[result.agent];
  return `${config.emoji} **${config.name}**\n\n${result.output}`;
}

export function formatMultiAgentResult(result: MultiAgentExecutionResult): string {
  let output = '# 🧑‍💼 Multi-Agent 분석 결과\n\n';
  
  // 실행 경로
  output += `**분석 순서**: ${result.executionPath.map(a => AGENT_CONFIGS[a].emoji).join(' → ')}\n\n`;
  
  // 각 에이전트 결과
  output += '---\n\n## 📋 개별 분석 결과\n\n';
  for (const r of result.results) {
    output += formatAgentResult(r) + '\n\n---\n\n';
  }
  
  // 최종 요약
  output += '## 📝 최종 종합 보고서\n\n';
  output += result.finalSummary;
  
  // 통계
  output += `\n\n---\n\n**총 토큰**: ${result.totalTokens} | **예상 비용**: $${result.totalCost.toFixed(4)}`;
  
  return output;
}
