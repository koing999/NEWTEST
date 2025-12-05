/**
 * AI 관련 노드 실행기
 * IntentParser, MultiAgent, TaskBreakdown, AIRouter, SmartAnalysis 등
 * 
 * 개선사항:
 * - 다중 입력 소스 구분 기능 추가
 * - AI가 각 자료의 출처를 명확히 인식할 수 있도록 프롬프트 강화
 */

import { callLLM, buildMessages } from '@/lib/providers';
import {
  TaskBreakdownNodeData,
  AIRouterNodeData,
  MultiAgentNodeData,
  TaskItem,
} from '@/types/workflow';
import { executeApiCall } from './api-executor';

interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * 입력에서 다중 소스 메타데이터를 파싱합니다
 */
interface InputSourceMeta {
  __multiInput__: boolean;
  totalSources: number;
  sources: Array<{
    index: number;
    label: string;
    type: string;
  }>;
}

/**
 * 입력에서 다중 입력 메타데이터를 추출합니다
 */
function parseInputMeta(input: string): InputSourceMeta | null {
  const metaMatch = input.match(/<!-- INPUT_META: ({.*?}) -->/);
  if (metaMatch) {
    try {
      return JSON.parse(metaMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * 다중 입력을 위한 강화된 프롬프트를 생성합니다
 */
function buildMultiInputPrompt(input: string, agentName: string): string {
  const meta = parseInputMeta(input);
  
  if (meta && meta.__multiInput__ && meta.totalSources > 1) {
    const sourceList = meta.sources
      .map(s => `  ${s.index}. ${s.label} (${s.type})`)
      .join('\n');
    
    return `## 📚 분석 대상 자료 (총 ${meta.totalSources}개)

아래 ${meta.totalSources}개의 자료가 입력되었습니다:
${sourceList}

⚠️ **분석 지침**:
1. 각 자료를 [자료 N: 라벨] 형식으로 구분해서 분석하세요
2. 자료 간 비교/관계를 분석해주세요
3. 종합 결론을 제시해주세요

---

${input}

---

[${agentName} 분석 결과]`;
  }
  
  // 단일 입력인 경우
  return `다음 데이터를 분석해주세요:\n\n${input}\n\n[${agentName} 분석 결과]`;
}

/**
 * Execute task breakdown using AI (AI 심층사고 모드)
 */
export async function executeTaskBreakdown(
  data: TaskBreakdownNodeData, 
  input: string
): Promise<{ output: string; tasks: TaskItem[]; usage?: LLMUsage; cost: number }> {
  const stylePrompts: Record<string, string> = {
    steps: '순서대로 실행해야 하는 단계별 작업 목록으로 분해해주세요. 각 단계는 이전 단계가 완료된 후 실행됩니다.',
    checklist: '병렬로 수행할 수 있는 체크리스트 형태로 분해해주세요. 순서에 상관없이 완료할 수 있는 항목들입니다.',
    mindmap: '계층 구조를 가진 마인드맵 형태로 분해해주세요. 주요 카테고리 아래 세부 작업들을 배치합니다.',
  };

  const systemPrompt = `당신은 복잡한 작업을 체계적으로 분해하는 전문가입니다.
사용자의 작업을 분석하여 실행 가능한 단계들로 나눠주세요.

응답은 반드시 아래 JSON 형식으로만 출력하세요:
{
  "tasks": [
    {
      "id": "1",
      "title": "작업 제목",
      "description": "작업에 대한 간단한 설명",
      ${data.includePriority ? '"priority": "high" | "medium" | "low",' : ''}
      ${data.includeTimeEstimate ? '"timeEstimate": "예상 소요시간 (예: 30분, 2시간)",' : ''}
      "completed": false,
      "subTasks": []
    }
  ],
  "summary": "전체 작업에 대한 한 줄 요약"
}

규칙:
- 최대 ${data.maxSteps || 5}개의 주요 단계로 분해
- ${stylePrompts[data.breakdownStyle] || stylePrompts.steps}
- 각 단계는 구체적이고 실행 가능해야 합니다
- 한국어로 작성하세요
${data.customPrompt ? `- 추가 지시사항: ${data.customPrompt}` : ''}`;

  const userPrompt = `다음 작업을 분해해주세요:

${input}`;

  try {
    const response = await callLLM({
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: buildMessages(systemPrompt, userPrompt, ''),
      temperature: 0.3,
      maxTokens: 2000,
    });

    let tasks: TaskItem[] = [];
    let summary = '';
    
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        tasks = parsed.tasks || [];
        summary = parsed.summary || '';
        
        tasks = tasks.map((task, index) => ({
          ...task,
          id: task.id || `task-${index + 1}`,
          completed: false,
        }));
      }
    } catch {
      const lines = response.content.split('\n').filter(Boolean);
      tasks = lines.slice(0, data.maxSteps || 5).map((line, index) => ({
        id: `task-${index + 1}`,
        title: line.replace(/^[\d\.\-\*]+\s*/, '').trim(),
        completed: false,
      }));
    }

    const output = JSON.stringify({
      __taskbreakdown__: true,
      tasks,
      summary,
      style: data.breakdownStyle,
    }, null, 2);

    return {
      output,
      tasks,
      usage: response.usage,
      cost: response.cost,
    };
  } catch (error) {
    throw new Error(`작업 분해 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Execute AI Router - AI 의도 분류
 */
export async function executeAIRouter(
  data: AIRouterNodeData, 
  input: string
): Promise<{ output: string; selectedScenario: string; usage?: LLMUsage; cost: number }> {
  const scenarios = data.scenarios || [];
  
  if (scenarios.length === 0) {
    throw new Error('라우팅할 시나리오가 없습니다.');
  }

  const systemPrompt = `당신은 사용자 요청을 분류하는 전문가입니다.
주어진 요청을 분석하여 가장 적합한 카테고리를 선택하세요.

가능한 카테고리:
${scenarios.map((s, i) => `${i + 1}. ${s.name}: ${s.description}`).join('\n')}

지시사항: ${data.instruction || '요청을 분석하여 가장 적합한 카테고리를 선택하세요.'}

반드시 아래 JSON 형식으로만 응답하세요:
{"selected": "카테고리ID", "confidence": 0.95, "reason": "선택 이유"}`;

  const userPrompt = `다음 요청을 분류해주세요:

"${input}"

카테고리 ID 목록: ${scenarios.map(s => s.id).join(', ')}`;

  try {
    const response = await callLLM({
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: buildMessages(systemPrompt, userPrompt, ''),
      temperature: 0.1,
      maxTokens: 500,
    });

    let selectedScenario = scenarios[0].id;
    let confidence = 0;
    let reason = '';

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        selectedScenario = parsed.selected || scenarios[0].id;
        confidence = parsed.confidence || 0;
        reason = parsed.reason || '';
      }
    } catch {
      // JSON 파싱 실패 시 첫 번째 시나리오 선택
    }

    const output = JSON.stringify({
      __airouter__: true,
      selectedScenario,
      confidence,
      reason,
      allScenarios: scenarios.map(s => s.id),
    }, null, 2);

    return {
      output,
      selectedScenario,
      usage: response.usage,
      cost: response.cost,
    };
  } catch (error) {
    throw new Error(`AI 라우팅 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 다중 AI 에이전트 실행 - 여러 전문가가 동시 분석
 */
export async function executeMultiAgent(
  data: MultiAgentNodeData, 
  input: string
): Promise<{ output: string; usage?: LLMUsage; cost: number }> {
  const agents = data.agents || [];
  
  if (agents.length === 0) {
    throw new Error('분석할 AI 전문가를 선택해주세요.');
  }

  const agentPrompts: Record<string, { name: string; system: string; emoji: string }> = {
    accountant: {
      name: '회계사',
      emoji: '🧮',
      system: `당신은 경력 20년의 공인회계사입니다. 빅4 출신으로 재무제표 분석의 전문가입니다.
핵심 분석: 현금흐름 건전성, 분식회계 징후, 이자보상배율, 재고자산 회전율
결론은 반드시 "투자 적합/부적합 + 이유"로 마무리하세요.`,
    },
    ib: {
      name: 'IB전문가',
      emoji: '🏦',
      system: `당신은 경력 20년의 투자은행(IB) 전문가입니다. 골드만삭스 출신입니다.
핵심 분석: 밸류에이션(PER/PBR/EV), 동종업계 멀티플 비교, M&A 가능성
결론은 반드시 "목표 주가 + 투자 의견"으로 마무리하세요.`,
    },
    mckinsey: {
      name: '맥킨지',
      emoji: '🎯',
      system: `당신은 맥킨지 출신 전략 컨설턴트입니다. 7S 프레임워크의 대가입니다.
핵심 분석: 경쟁우위(Moat), 산업구조(5 Forces), 실행력 평가
결론은 반드시 "전략적 시사점 + So What?"으로 마무리하세요.`,
    },
    planner: {
      name: '기획자',
      emoji: '📊',
      system: `당신은 경력 20년의 사업기획 전문가입니다. 대기업 전략기획실 출신입니다.
핵심 분석: TAM/SAM/SOM 시장규모, 사업모델 지속가능성, 3년 성장 로드맵
결론은 반드시 "사업성 점수(5점 만점) + 핵심 이유"로 마무리하세요.`,
    },
    jogwajang: {
      name: '조과장',
      emoji: '🦥',
      system: `당신은 "일 안하는 조과장" AI입니다. 핵심만 콕콕 짚어줍니다.
어려운 말 NO, 결론만 OK. 솔직하고 직설적으로 말해주세요.
결론은 반드시 "사? 말아? + 이유 한줄"로 마무리하세요.`,
    },
  };

  const results: Record<string, string> = {};
  const totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let totalCost = 0;

  // 다중 입력 메타데이터 확인
  const inputMeta = parseInputMeta(input);
  const isMultiInput = inputMeta && inputMeta.__multiInput__ && inputMeta.totalSources > 1;

  const executeAgent = async (agentId: string) => {
    const agent = agentPrompts[agentId];
    if (!agent) return;

    // 다중 입력인 경우 강화된 시스템 프롬프트 사용
    const enhancedSystemPrompt = isMultiInput 
      ? `${agent.system}\n\n## 다중 자료 분석 규칙\n- 각 자료를 명확히 구분하여 분석하세요\n- 자료 간 비교/관계를 파악하세요\n- 종합 결론을 명확히 제시하세요`
      : agent.system;

    // 다중 입력용 강화된 프롬프트 생성
    const userPrompt = buildMultiInputPrompt(input, agent.name);

    const response = await callLLM({
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: buildMessages(
        enhancedSystemPrompt,
        userPrompt,
        ''
      ),
      temperature: 0.4,
      maxTokens: isMultiInput ? 2500 : 1500, // 다중 입력시 토큰 증가
    });

    // 다중 입력 결과 포맷팅
    const analysisHeader = isMultiInput 
      ? `${agent.emoji} **${agent.name} 분석** (📚 ${inputMeta.totalSources}개 자료 기반)`
      : `${agent.emoji} **${agent.name} 분석**`;

    results[agentId] = `${analysisHeader}\n\n${response.content}`;
    totalUsage.promptTokens += response.usage.promptTokens;
    totalUsage.completionTokens += response.usage.completionTokens;
    totalUsage.totalTokens += response.usage.totalTokens;
    totalCost += response.cost;
  };

  if (data.analysisMode === 'parallel') {
    await Promise.all(agents.map(executeAgent));
  } else {
    for (const agentId of agents) {
      await executeAgent(agentId);
    }
  }

  let output: string;

  // 다중 입력 요약 정보
  const inputSummary = isMultiInput 
    ? `\n\n---\n📚 **분석 기반 자료**: ${inputMeta.sources.map(s => s.label).join(', ')} (총 ${inputMeta.totalSources}개)`
    : '';

  if (data.outputFormat === 'combined') {
    output = agents.map(a => results[a]).join('\n\n---\n\n') + inputSummary;
  } else if (data.outputFormat === 'comparison') {
    output = JSON.stringify({
      __multiagent__: true,
      format: 'comparison',
      inputMeta: isMultiInput ? inputMeta : null,
      agents: agents.map(a => ({
        id: a,
        name: agentPrompts[a]?.name,
        emoji: agentPrompts[a]?.emoji,
        analysis: results[a],
      })),
    }, null, 2);
  } else {
    output = JSON.stringify({
      __multiagent__: true,
      format: 'separate',
      inputMeta: isMultiInput ? inputMeta : null,
      results,
    }, null, 2);
  }

  return {
    output,
    usage: totalUsage,
    cost: totalCost,
  };
}

/**
 * 🧠 의도 파서 실행 - 사람 말을 AI가 이해할 수 있게 번역
 */
export async function executeIntentParser(
  input: string
): Promise<{ output: string; usage?: LLMUsage; cost: number }> {
  
  const systemPrompt = `당신은 "통역사 AI"입니다. 
사용자의 자연어 요청을 분석하여 적절한 API 호출과 AI 분석에 필요한 구조화된 형식으로 변환합니다.

## 지원하는 요청 유형

1. **재무/공시 분석 (DART)**: 재무제표, 공시, 배당 정보
2. **국내 주식**: 현재가, 시세, 급등주, 거래량
3. **해외 주식**: 미국 주식 시세 (애플, 테슬라 등)
4. **뉴스**: 키워드 뉴스 검색
5. **날씨**: 도시별 날씨 정보
6. **일반 질문**: 그 외 AI가 직접 답변할 수 있는 질문

## 응답 형식 (반드시 JSON으로만 응답)

{
  "requestType": "dart | stock-kr | stock-us | news | weather | general",
  "company": "회사명 (주식/재무 관련시)",
  "stockCode": "종목코드 (알면)",
  "ticker": "미국 주식 티커 (AAPL, TSLA 등)",
  "keyword": "검색 키워드 (뉴스용)",
  "city": "도시명 (날씨용)",
  "subType": "세부 유형",
  "analysisType": "분석유형",
  "focusAreas": ["집중 분석 영역"],
  "timeRange": "기간",
  "outputFormat": "출력 형식",
  "specificQuestion": "구체적 질문",
  "contextForAI": "AI에게 전달할 분석 지시사항"
}`;

  const userPrompt = `다음 사용자 요청을 분석해주세요:

"${input}"`;

  try {
    const response = await callLLM({
      provider: 'groq',
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: buildMessages(systemPrompt, userPrompt, ''),
      temperature: 0.2,
      maxTokens: 1000,
    });

    let parsed;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { requestType: 'general', contextForAI: input };
      }
    } catch {
      parsed = { requestType: 'general', contextForAI: input };
    }

    const output = JSON.stringify({
      __intentparser__: true,
      ...parsed,
    }, null, 2);

    return {
      output,
      usage: response.usage,
      cost: response.cost,
    };
  } catch (error) {
    throw new Error(`의도 분석 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 🔮 스마트 분석 실행 - 통역사 + API + AI 한방에!
 */
export async function executeSmartAnalysis(
  input: string
): Promise<{ output: string; usage?: LLMUsage; cost: number }> {
  let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let totalCost = 0;

  // 1단계: 의도 분석
  const intentResult = await executeIntentParser(input);
  totalUsage.promptTokens += intentResult.usage?.promptTokens || 0;
  totalUsage.completionTokens += intentResult.usage?.completionTokens || 0;
  totalUsage.totalTokens += intentResult.usage?.totalTokens || 0;
  totalCost += intentResult.cost;

  let parsedIntent;
  try {
    parsedIntent = JSON.parse(intentResult.output);
  } catch {
    parsedIntent = { requestType: 'general' };
  }

  // 2단계: API 호출 (필요한 경우)
  let apiResult = '';
  if (parsedIntent.requestType !== 'general') {
    try {
      // API 노드 데이터 구성
      const apiData = {
        type: 'api' as const,
        label: 'API',
        preset: parsedIntent.requestType as 'dart' | 'stock-kr' | 'stock-us' | 'news' | 'weather' | 'custom',
        method: 'GET' as const,
        url: '',
        presetConfig: {
          reportType: parsedIntent.subType || 'financial',
        },
      };

      const apiResponse = await executeApiCall(apiData, intentResult.output);
      apiResult = apiResponse.output;
    } catch (error) {
      apiResult = `API 호출 실패: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // 3단계: AI 분석
  const analysisPrompt = parsedIntent.contextForAI || '데이터를 분석하고 핵심 인사이트를 제공해주세요.';
  
  const analysisResponse = await callLLM({
    provider: 'groq',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    messages: buildMessages(
      `당신은 "일 안하는 조과장" AI입니다. 핵심만 콕콕 짚어줍니다.
어려운 말은 쉽게, 결론부터 말해주세요.`,
      `${analysisPrompt}

데이터:
${apiResult || input}`,
      ''
    ),
    temperature: 0.4,
    maxTokens: 2000,
  });

  totalUsage.promptTokens += analysisResponse.usage.promptTokens;
  totalUsage.completionTokens += analysisResponse.usage.completionTokens;
  totalUsage.totalTokens += analysisResponse.usage.totalTokens;
  totalCost += analysisResponse.cost;

  const output = JSON.stringify({
    __smartanalysis__: true,
    intent: parsedIntent,
    apiData: apiResult ? '데이터 수집 완료' : null,
    analysis: analysisResponse.content,
  }, null, 2);

  return {
    output,
    usage: totalUsage,
    cost: totalCost,
  };
}
