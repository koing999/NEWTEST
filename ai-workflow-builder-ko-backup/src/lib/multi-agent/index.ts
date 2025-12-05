/**
 * Multi-Agent 모듈
 * 
 * Flowise Supervisor-Worker 패턴을 적용한 멀티 에이전트 시스템:
 * - Supervisor: 작업 분배 및 결과 종합
 * - Workers: 전문 분야별 AI 에이전트
 * - Executor: 워크플로우 통합 실행기
 * 
 * @author AI 워크플로우 빌더 팀
 */

// Supervisor 패턴 코어
export {
  // 클래스
  MultiAgentSupervisor,
  
  // 함수
  executeAgentsParallel,
  getAgentConfig,
  getAvailableAgents,
  formatAgentResult,
  formatMultiAgentResult,
  
  // 상수
  AGENT_CONFIGS,
} from './supervisor';

export type {
  AgentRole,
  AgentConfig,
  SupervisorDecision,
  AgentResult,
  MultiAgentExecutionResult,
} from './supervisor';

// 워크플로우 실행기
export { 
  default as executeMultiAgent,
  executeMultiAgent as runMultiAgent,
} from '../executors/multiagent-executor';

export type {
  MultiAgentExecutorResult,
  MultiAgentExecutorConfig,
} from '../executors/multiagent-executor';
