/**
 * Workflow Execution API
 * 
 * POST /api/workflow/run
 * Executes a workflow by processing nodes in topological order.
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
  NoteNodeData,
  CodeNodeData,
  ParallelNodeData,
  TemplateNodeData,
  HtmlCleanNodeData,
  MathNodeData,
  FormulaNodeData,
  MultiFilterNodeData,
  StockAlertNodeData,
  TaskItem,
  NodeExecutionResult,
  WorkflowExecutionResult,
} from '@/types/workflow';
import { callLLM, buildMessages } from '@/lib/providers';
import { createSafeId } from '@/utils/id';

interface WorkflowRequest {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

/**
 * Get topological order of nodes for execution
 */
function getTopologicalOrder(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  });

  // Build graph
  edges.forEach(e => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    adjacency.get(e.source)?.push(e.target);
  });

  // Kahn's algorithm
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
 * Get input value for a node from its connected source nodes
 */
function getNodeInput(
  nodeId: string,
  edges: Edge[],
  nodeOutputs: Map<string, string>
): string {
  const incomingEdges = edges.filter(e => e.target === nodeId);
  
  if (incomingEdges.length === 0) {
    return '';
  }

  // Combine inputs from all sources
  const inputs = incomingEdges
    .map(e => nodeOutputs.get(e.source) || '')
    .filter(Boolean);

  return inputs.join('\n\n');
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
        const messages = buildMessages(
          llmData.systemPrompt,
          llmData.userPrompt,
          input
        );

        const response = await callLLM({
          provider: llmData.provider,
          model: llmData.model,
          messages,
          temperature: llmData.temperature,
          maxTokens: llmData.maxTokens,
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

      case 'output': {
        // Output nodes just pass through the input
        output = input;
        break;
      }

      case 'condition': {
        const conditionData = data as ConditionNodeData;
        const conditionResult = evaluateCondition(conditionData, input);
        output = conditionResult ? 'true' : 'false';
        break;
      }

      case 'loop': {
        // Loop is handled specially in the main execution flow
        // TODO: Implement proper loop execution
        output = input;
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
        output = input;  // 그냥 통과
        break;
      }

      case 'webhook': {
        const webhookData = data as WebhookNodeData;
        await sendWebhook(webhookData, input);
        output = input;  // 그냥 통과
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
        output = executeApproval(approvalData, input);
        break;
      }

      case 'note': {
        // Note 노드는 실행되지 않음 - 그냥 통과
        output = input;
        break;
      }

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
 * Send webhook notification
 */
async function sendWebhook(data: WebhookNodeData, input: string): Promise<void> {
  if (!data.webhookUrl) {
    throw new Error('Webhook URL이 필요합니다.');
  }

  const message = (data.messageTemplate || '{{input}}').replace(/\{\{input\}\}/g, input);

  let body: Record<string, unknown>;
  
  if (data.webhookType === 'slack') {
    body = {
      text: message,
      username: data.username || '🦥 조과장',
      icon_emoji: data.iconEmoji || ':sloth:',
    };
  } else if (data.webhookType === 'discord') {
    body = {
      content: message,
      username: data.username || '🦥 조과장',
    };
  } else {
    // 커스텀
    body = { message, input };
  }

  const response = await fetch(data.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Webhook 전송 실패: ${response.status}`);
  }
}

/**
 * Execute API call for API nodes
 */
async function executeApiCall(data: ApiNodeData, input: string): Promise<{ output: string; statusCode?: number }> {
  const preset = data.preset || 'custom';
  
  // 입력값으로 변수 치환
  const replaceInput = (str: string) => str.replace(/\{\{input\}\}/g, input.trim());
  
  let url = '';
  let method = data.method || 'GET';
  let headers: Record<string, string> = {};
  let body: string | undefined;

  switch (preset) {
    case 'dart': {
      // DART API - 환경변수 또는 사용자 입력
      const apiKey = data.presetConfig?.dartApiKey || process.env.DART_API_KEY || '';
      const corpCode = replaceInput(data.presetConfig?.corpCode || input.trim());
      const reportType = data.presetConfig?.reportType || 'disclosure';
      
      if (!apiKey) {
        throw new Error('DART API 키가 필요합니다.');
      }
      
      // DART API 엔드포인트
      if (reportType === 'disclosure') {
        // 최근 공시
        url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${apiKey}&corp_code=${corpCode}&page_count=10`;
      } else if (reportType === 'financial') {
        // 재무제표 (최근 사업보고서)
        const year = new Date().getFullYear() - 1;
        url = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011`;
      } else if (reportType === 'dividend') {
        // 배당
        url = `https://opendart.fss.or.kr/api/alotMatter.json?crtfc_key=${apiKey}&corp_code=${corpCode}`;
      }
      break;
    }

    case 'stock-kr': {
      // 한국 주식 (네이버 금융 또는 KRX)
      const stockCode = replaceInput(data.presetConfig?.stockCode || input.trim());
      // 네이버 금융 API (비공식)
      url = `https://m.stock.naver.com/api/stock/${stockCode}/basic`;
      break;
    }

    case 'stock-us': {
      // 미국 주식 (Yahoo Finance)
      const symbol = replaceInput(data.presetConfig?.stockCode || input.trim());
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
      break;
    }

    case 'news': {
      // 뉴스 검색 (네이버 뉴스 또는 구글 뉴스 RSS)
      const query = encodeURIComponent(replaceInput(data.presetConfig?.query || input.trim()));
      // 구글 뉴스 RSS
      url = `https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`;
      break;
    }

    case 'weather': {
      // 날씨 (wttr.in - 무료)
      const city = encodeURIComponent(replaceInput(data.presetConfig?.city || input.trim() || 'Seoul'));
      url = `https://wttr.in/${city}?format=j1`;
      break;
    }

    case 'custom':
    default: {
      url = replaceInput(data.url || '');
      method = data.method || 'GET';
      headers = data.headers || {};
      body = data.body ? replaceInput(data.body) : undefined;
      break;
    }
  }

  if (!url) {
    throw new Error('API URL이 필요합니다.');
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    
    let output: string;
    if (contentType.includes('application/json')) {
      const json = await response.json();
      output = JSON.stringify(json, null, 2);
    } else if (contentType.includes('xml') || contentType.includes('rss')) {
      // RSS/XML은 텍스트로
      output = await response.text();
    } else {
      output = await response.text();
    }

    return {
      output,
      statusCode: response.status,
    };
  } catch (error) {
    throw new Error(`API 호출 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  
  // Recursively mark all downstream nodes
  const outgoing = edges.filter(e => e.source === nodeId);
  for (const edge of outgoing) {
    markDownstreamAsSkipped(edge.target, edges, skippedNodes);
  }
}

/**
 * Evaluate condition for condition nodes
 */
function evaluateCondition(data: ConditionNodeData, input: string): boolean {
  const value = data.conditionValue || '';
  const compareInput = data.caseSensitive ? input : input.toLowerCase();
  const compareValue = data.caseSensitive ? value : value.toLowerCase();

  switch (data.conditionType) {
    case 'contains':
      return compareInput.includes(compareValue);
    
    case 'equals':
      return compareInput === compareValue;
    
    case 'greater': {
      const numInput = parseFloat(input);
      const numValue = parseFloat(value);
      return !isNaN(numInput) && !isNaN(numValue) && numInput > numValue;
    }
    
    case 'less': {
      const numInput = parseFloat(input);
      const numValue = parseFloat(value);
      return !isNaN(numInput) && !isNaN(numValue) && numInput < numValue;
    }
    
    case 'regex': {
      try {
        const regex = new RegExp(value);
        return regex.test(input);
      } catch {
        return false;
      }
    }
    
    case 'empty':
      return input.trim() === '';
    
    case 'not-empty':
      return input.trim() !== '';
    
    default:
      return false;
  }
}

/**
 * Execute random selection
 */
function executeRandom(data: RandomNodeData, input: string): string {
  const delimiter = data.delimiter || '\n';
  const items = input.split(delimiter).map(s => s.trim()).filter(Boolean);
  
  if (items.length === 0) {
    return '';
  }

  const count = Math.min(data.count || 1, items.length);
  const results: string[] = [];

  if (data.allowDuplicate) {
    // 중복 허용
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * items.length);
      results.push(items[idx]);
    }
  } else {
    // 중복 불허 (셔플 후 선택)
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    results.push(...shuffled.slice(0, count));
  }

  return results.join(delimiter);
}

/**
 * Execute text slicing
 */
function executeSlice(data: SliceNodeData, input: string): string {
  const sliceType = data.sliceType || 'chars';
  const start = data.start || 0;
  const end = data.end;

  switch (sliceType) {
    case 'chars': {
      return end !== undefined ? input.slice(start, end) : input.slice(start);
    }
    
    case 'words': {
      const words = input.split(/\s+/).filter(Boolean);
      const sliced = end !== undefined ? words.slice(start, end) : words.slice(start);
      return sliced.join(' ');
    }
    
    case 'lines': {
      const lines = input.split('\n');
      const sliced = end !== undefined ? lines.slice(start, end) : lines.slice(start);
      return sliced.join('\n');
    }
    
    case 'tokens': {
      // 토큰 수 추정 (평균 4글자 = 1토큰)
      const estimatedChars = (end !== undefined ? end - start : input.length) * 4;
      const startChars = start * 4;
      return input.slice(startChars, end !== undefined ? startChars + estimatedChars : undefined);
    }
    
    default:
      return input;
  }
}

/**
 * Execute datetime formatting
 */
function executeDateTime(data: DateTimeNodeData, _input: string): string {
  const timezone = data.timezone || 'Asia/Seoul';
  const now = new Date();
  
  // 시간대 적용
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  switch (data.format) {
    case 'full':
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    
    case 'date':
      return `${year}-${month}-${day}`;
    
    case 'time':
      return `${hour}:${minute}:${second}`;
    
    case 'iso':
      return now.toISOString();
    
    case 'custom': {
      let result = data.customFormat || 'YYYY-MM-DD';
      result = result.replace('YYYY', year);
      result = result.replace('MM', month);
      result = result.replace('DD', day);
      result = result.replace('HH', hour);
      result = result.replace('mm', minute);
      result = result.replace('ss', second);
      return result;
    }
    
    default:
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}

/**
 * Execute task breakdown using AI (AI 심층사고 모드)
 */
async function executeTaskBreakdown(
  data: TaskBreakdownNodeData, 
  input: string
): Promise<{ output: string; tasks: TaskItem[]; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; cost: number }> {
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
    // Groq 무료 모델 사용 (빠르고 무료!)
    const response = await callLLM({
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      messages: buildMessages(systemPrompt, userPrompt, ''),
      temperature: 0.3,  // 일관된 결과를 위해 낮은 온도
      maxTokens: 2000,
    });

    // JSON 파싱
    let tasks: TaskItem[] = [];
    let summary = '';
    
    try {
      // JSON 블록 추출
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        tasks = parsed.tasks || [];
        summary = parsed.summary || '';
        
        // ID 보정
        tasks = tasks.map((task, index) => ({
          ...task,
          id: task.id || `task-${index + 1}`,
          completed: false,
        }));
      }
    } catch {
      // JSON 파싱 실패 시 텍스트 기반 파싱 시도
      const lines = response.content.split('\n').filter(Boolean);
      tasks = lines.slice(0, data.maxSteps || 5).map((line, index) => ({
        id: `task-${index + 1}`,
        title: line.replace(/^[\d\.\-\*]+\s*/, '').trim(),
        completed: false,
      }));
    }

    // 출력 포맷팅
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

// 전역 Flow State (실행 중 공유)
const flowState: Record<string, unknown> = {};

/**
 * Execute State node - Flow State 관리 (Flowise 스타일)
 */
function executeState(data: StateNodeData, input: string): string {
  const operation = data.operation || 'init';
  const variables = data.variables || [];

  switch (operation) {
    case 'init': {
      // 변수 초기화
      variables.forEach(v => {
        let value: unknown = v.value;
        if (v.type === 'number') value = parseFloat(v.value) || 0;
        else if (v.type === 'boolean') value = v.value === 'true';
        else if (v.type === 'json') {
          try { value = JSON.parse(v.value); } catch { value = {}; }
        }
        flowState[v.key] = value;
      });
      return JSON.stringify({ __state__: 'initialized', variables: Object.keys(flowState) });
    }

    case 'get': {
      // 값 읽기
      const results: Record<string, unknown> = {};
      variables.forEach(v => {
        results[v.key] = flowState[v.key] ?? null;
      });
      return JSON.stringify(results, null, 2);
    }

    case 'set': {
      // 값 설정 (입력값 또는 변수값)
      variables.forEach(v => {
        const value = v.value === '{{input}}' ? input : v.value;
        flowState[v.key] = value;
      });
      return JSON.stringify({ __state__: 'updated', flowState });
    }

    case 'update': {
      // 기존 값에 추가/수정
      variables.forEach(v => {
        const currentValue = flowState[v.key];
        const newValue = v.value === '{{input}}' ? input : v.value;
        
        if (Array.isArray(currentValue)) {
          flowState[v.key] = [...currentValue, newValue];
        } else if (typeof currentValue === 'string') {
          flowState[v.key] = currentValue + newValue;
        } else {
          flowState[v.key] = newValue;
        }
      });
      return JSON.stringify({ __state__: 'updated', flowState });
    }

    default:
      return input;
  }
}

/**
 * Execute AI Router - AI 의도 분류 (Flowise 스타일)
 */
async function executeAIRouter(
  data: AIRouterNodeData, 
  input: string
): Promise<{ output: string; selectedScenario: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; cost: number }> {
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
      model: 'llama-3.3-70b-versatile',
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
 * Execute Approval node - Human-in-the-Loop (Flowise 스타일)
 */
function executeApproval(data: ApprovalNodeData, input: string): string {
  // 실제 구현에서는 웹소켓이나 폴링으로 사용자 응답을 기다려야 함
  // 현재는 시뮬레이션: 자동 승인
  
  const result = data.result || 'pending';
  
  if (result === 'approved') {
    return JSON.stringify({
      __approval__: true,
      status: 'approved',
      message: data.message,
      userInput: data.userInput || '',
      originalInput: input,
    }, null, 2);
  } else if (result === 'rejected') {
    return JSON.stringify({
      __approval__: true,
      status: 'rejected',
      message: data.message,
      userInput: data.userInput || '',
      originalInput: input,
    }, null, 2);
  }
  
  // 대기 중 (클라이언트에서 처리)
  return JSON.stringify({
    __approval__: true,
    status: 'pending',
    message: data.message,
    showInput: data.showInput,
    approveLabel: data.approveLabel,
    rejectLabel: data.rejectLabel,
    originalInput: input,
  }, null, 2);
}

/**
 * Execute Code node - JavaScript 코드 실행 (Dify/Langflow 스타일)
 */
function executeCode(data: CodeNodeData, input: string): string {
  const code = data.code || '';
  
  if (!code.trim()) {
    return input;
  }

  try {
    // 안전한 환경에서 코드 실행 (제한된 기능)
    // 실제 프로덕션에서는 샌드박스나 VM을 사용해야 함
    
    // 사용 가능한 내장 함수들
    const allowedGlobals = {
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      $state: flowState,  // Flow State 접근
    };

    // Function 생성자를 사용하여 코드 실행
    const fn = new Function(
      'input',
      ...Object.keys(allowedGlobals),
      `"use strict";
      ${code}`
    );

    const result = fn(input, ...Object.values(allowedGlobals));
    
    // 결과 변환
    if (result === undefined || result === null) {
      return '';
    } else if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    } else {
      return String(result);
    }
  } catch (error) {
    throw new Error(`코드 실행 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Execute Parallel node - 병렬 실행 (Dify 스타일)
 * Note: 실제 병렬 실행은 클라이언트에서 처리해야 함
 */
function executeParallel(data: ParallelNodeData, input: string): string {
  const branches = data.branches || 2;
  const mergeStrategy = data.mergeStrategy || 'all';
  
  // 이 노드는 분기점 역할만 함
  // 실제 병렬 실행 및 병합은 워크플로우 실행 엔진에서 처리해야 함
  
  return JSON.stringify({
    __parallel__: true,
    branches,
    mergeStrategy,
    input,
    status: 'branching',
    message: `입력을 ${branches}개 분기로 나눕니다. 병합 전략: ${mergeStrategy}`,
  }, null, 2);
}

/**
 * Execute Template node - 빈칸 채우기 (엑셀 치환 스타일)
 * {{변수}} 형식으로 템플릿의 변수를 치환합니다
 */
function executeTemplate(data: TemplateNodeData, input: string): string {
  let template = data.template || '';
  const variables = data.variables || [];
  
  // 먼저 {{input}}을 치환
  template = template.replace(/\{\{input\}\}/gi, input);
  
  // 입력이 JSON인 경우 파싱 시도
  let inputObj: Record<string, string> = {};
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === 'object' && parsed !== null) {
      inputObj = parsed as Record<string, string>;
    }
  } catch {
    // JSON이 아니면 무시
  }
  
  // 정의된 변수들 치환
  for (const variable of variables) {
    const key = variable.key;
    // 우선순위: 입력 JSON > 변수 기본값 > 빈 문자열
    const value = inputObj[key] || variable.value || '';
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    template = template.replace(regex, value);
  }
  
  // 남은 {{변수}} 패턴 처리 (입력 JSON에서 찾기)
  template = template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return inputObj[varName] ?? match;
  });
  
  return template;
}

/**
 * Execute HTML Clean node - 태그 청소기 (토큰 절약!)
 * HTML 태그를 제거하고 순수 텍스트만 추출합니다
 */
function executeHtmlClean(data: HtmlCleanNodeData, input: string): string {
  let result = input;
  
  // 1. <script> 태그 제거 (내용 포함)
  if (data.removeScripts !== false) {
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  // 2. <style> 태그 제거 (내용 포함)
  if (data.removeStyles !== false) {
    result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }
  
  // 3. HTML 주석 제거
  if (data.removeComments !== false) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }
  
  // 4. 링크 처리
  if (data.keepLinks) {
    // <a href="...">텍스트</a> -> 텍스트 (URL)
    result = result.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '$2 ($1)');
  } else {
    result = result.replace(/<a\b[^>]*>([^<]*)<\/a>/gi, '$1');
  }
  
  // 5. 이미지 처리
  if (data.keepImages) {
    // <img src="..." alt="..."> -> [이미지: alt] (src)
    result = result.replace(/<img\s+[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '[이미지: $2] ($1)');
    result = result.replace(/<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '[이미지: $1] ($2)');
    result = result.replace(/<img\s+[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '[이미지] ($1)');
  }
  
  // 6. 특수 태그 처리 (줄바꿈 유지)
  result = result.replace(/<br\s*\/?>/gi, '\n');
  result = result.replace(/<\/p>/gi, '\n\n');
  result = result.replace(/<\/div>/gi, '\n');
  result = result.replace(/<\/li>/gi, '\n');
  result = result.replace(/<\/tr>/gi, '\n');
  result = result.replace(/<\/h[1-6]>/gi, '\n\n');
  
  // 7. 나머지 모든 HTML 태그 제거
  result = result.replace(/<[^>]+>/g, '');
  
  // 8. HTML 엔티티 디코딩
  result = result
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
  
  // 9. 연속 공백 및 줄바꿈 정리
  result = result.replace(/[ \t]+/g, ' ');  // 연속 공백을 하나로
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');  // 3줄 이상 줄바꿈을 2줄로
  result = result.trim();
  
  // 토큰 절약량 계산
  const originalLength = input.length;
  const cleanedLength = result.length;
  const savedPercent = Math.round((1 - cleanedLength / originalLength) * 100);
  
  // 메타데이터 추가
  return JSON.stringify({
    __htmlclean__: true,
    text: result,
    stats: {
      original: originalLength,
      cleaned: cleanedLength,
      savedPercent: Math.max(0, savedPercent),
    },
  }, null, 2);
}

/**
 * Execute Math node - 단순 계산기 (비개발자 친화적!)
 * 기본적인 사칙연산 및 수학 함수를 제공합니다
 */
function executeMath(data: MathNodeData, input: string): string {
  const operation = data.operation || 'add';
  const decimals = data.decimals ?? 2;
  
  // {{input}} 치환
  const parseValue = (val: string | undefined): number => {
    if (!val) return 0;
    const replaced = val.replace(/\{\{input\}\}/gi, input);
    const num = parseFloat(replaced);
    return isNaN(num) ? 0 : num;
  };
  
  const value1 = parseValue(data.value1);
  const value2 = parseValue(data.value2);
  
  let result: number;
  
  switch (operation) {
    case 'add':
      result = value1 + value2;
      break;
    case 'subtract':
      result = value1 - value2;
      break;
    case 'multiply':
      result = value1 * value2;
      break;
    case 'divide':
      if (value2 === 0) {
        throw new Error('0으로 나눌 수 없습니다.');
      }
      result = value1 / value2;
      break;
    case 'percent':
      // value1의 value2% 계산
      result = value1 * (value2 / 100);
      break;
    case 'round':
      result = Math.round(value1 * Math.pow(10, decimals)) / Math.pow(10, decimals);
      break;
    case 'floor':
      result = Math.floor(value1 * Math.pow(10, decimals)) / Math.pow(10, decimals);
      break;
    case 'ceil':
      result = Math.ceil(value1 * Math.pow(10, decimals)) / Math.pow(10, decimals);
      break;
    case 'abs':
      result = Math.abs(value1);
      break;
    default:
      result = value1;
  }
  
  // 소수점 처리
  const formattedResult = Number(result.toFixed(decimals));
  
  return String(formattedResult);
}

/**
 * Execute Formula node - 다중 필드 수식 계산 (주식 분석용!)
 * JSON 입력에서 여러 필드를 사용해 복잡한 수식을 계산합니다
 */
function executeFormula(data: FormulaNodeData, input: string): string {
  const formulas = data.formulas || [];
  
  // 입력 파싱
  let inputData: Record<string, unknown>;
  try {
    inputData = JSON.parse(input);
  } catch {
    throw new Error('Formula 노드는 JSON 입력이 필요합니다.');
  }
  
  // 배열인 경우 각 항목에 대해 수식 계산
  if (Array.isArray(inputData)) {
    const results = inputData.map((item: Record<string, unknown>) => {
      const calculated: Record<string, unknown> = { ...item };
      
      for (const formula of formulas) {
        try {
          // 수식에서 필드 치환
          let expr = formula.formula;
          for (const field of data.inputFields || []) {
            const regex = new RegExp(`\\b${field}\\b`, 'g');
            expr = expr.replace(regex, String(item[field] ?? 0));
          }
          
          // 안전한 수식 평가
          const result = Function(`"use strict"; return (${expr})`)();
          const decimals = formula.decimals ?? 2;
          calculated[formula.name] = Number(Number(result).toFixed(decimals));
        } catch (e) {
          calculated[formula.name] = 0;
          calculated[`${formula.name}_error`] = String(e);
        }
      }
      
      return calculated;
    });
    
    return JSON.stringify(results, null, 2);
  }
  
  // 단일 객체인 경우
  const calculated: Record<string, unknown> = { ...inputData };
  
  for (const formula of formulas) {
    try {
      let expr = formula.formula;
      for (const field of data.inputFields || []) {
        const regex = new RegExp(`\\b${field}\\b`, 'g');
        expr = expr.replace(regex, String(inputData[field] ?? 0));
      }
      
      const result = Function(`"use strict"; return (${expr})`)();
      const decimals = formula.decimals ?? 2;
      calculated[formula.name] = Number(Number(result).toFixed(decimals));
    } catch (e) {
      calculated[formula.name] = 0;
    }
  }
  
  return JSON.stringify(calculated, null, 2);
}

/**
 * Execute MultiFilter node - 복합 조건 필터 (AND/OR 지원)
 * 여러 조건을 AND 또는 OR로 결합하여 필터링합니다
 */
function executeMultiFilter(data: MultiFilterNodeData, input: string): string {
  const conditions = data.conditions || [];
  const logic = data.logic || 'AND';
  
  if (conditions.length === 0) {
    return input; // 조건 없으면 그대로 통과
  }
  
  // 입력 파싱
  let inputData: unknown;
  try {
    inputData = JSON.parse(input);
  } catch {
    throw new Error('MultiFilter 노드는 JSON 입력이 필요합니다.');
  }
  
  // 단일 조건 평가 함수
  const evaluateCondition = (item: Record<string, unknown>, condition: { field: string; operator: string; value: string }): boolean => {
    const fieldValue = item[condition.field];
    const compareValue = condition.value;
    
    // 숫자 비교
    const numField = parseFloat(String(fieldValue));
    const numCompare = parseFloat(compareValue);
    
    switch (condition.operator) {
      case '>=': return !isNaN(numField) && numField >= numCompare;
      case '<=': return !isNaN(numField) && numField <= numCompare;
      case '>': return !isNaN(numField) && numField > numCompare;
      case '<': return !isNaN(numField) && numField < numCompare;
      case '==': return String(fieldValue) === compareValue || numField === numCompare;
      case '!=': return String(fieldValue) !== compareValue && numField !== numCompare;
      case 'contains': return String(fieldValue).includes(compareValue);
      case 'not-contains': return !String(fieldValue).includes(compareValue);
      default: return false;
    }
  };
  
  // 모든 조건 평가
  const evaluateAllConditions = (item: Record<string, unknown>): boolean => {
    if (logic === 'AND') {
      return conditions.every(c => evaluateCondition(item, c));
    } else {
      return conditions.some(c => evaluateCondition(item, c));
    }
  };
  
  // 배열인 경우 필터링
  if (Array.isArray(inputData)) {
    if (data.passThrough) {
      const filtered = inputData.filter((item: Record<string, unknown>) => evaluateAllConditions(item));
      return JSON.stringify(filtered, null, 2);
    } else {
      const results = inputData.map((item: Record<string, unknown>) => ({
        ...item,
        __passed__: evaluateAllConditions(item),
      }));
      return JSON.stringify(results, null, 2);
    }
  }
  
  // 단일 객체인 경우
  const passed = evaluateAllConditions(inputData as Record<string, unknown>);
  
  if (data.passThrough) {
    return passed ? input : JSON.stringify({ __passed__: false, __filtered__: true });
  }
  
  return JSON.stringify({
    ...(inputData as Record<string, unknown>),
    __passed__: passed,
  }, null, 2);
}

/**
 * Execute StockAlert node - 주식 급등락 알림 전용 노드
 * 급등 → 조정 → 회복 패턴을 감지하여 알림을 생성합니다
 */
function executeStockAlert(data: StockAlertNodeData, input: string): string {
  // 입력 파싱
  let inputData: unknown;
  try {
    inputData = JSON.parse(input);
  } catch {
    throw new Error('StockAlert 노드는 JSON 입력이 필요합니다.');
  }
  
  // 필드명 설정
  const openField = data.openField || 'open';
  const highField = data.highField || 'high';
  const lowField = data.lowField || 'low';
  const currentField = data.currentField || 'current';
  const nameField = data.nameField || 'name';
  
  // 조건 설정
  const minHighRise = data.minHighRise ?? 18;
  const maxDropFromHigh = data.maxDropFromHigh ?? -8;
  const minCurrentRise = data.minCurrentRise ?? 13;
  
  // 단일 종목 분석 함수
  const analyzeStock = (stock: Record<string, unknown>) => {
    const open = Number(stock[openField]) || 0;
    const high = Number(stock[highField]) || 0;
    const low = Number(stock[lowField]) || 0;
    const current = Number(stock[currentField]) || 0;
    const name = String(stock[nameField] || '알 수 없음');
    
    if (open === 0) return null;
    
    // 계산
    const highRise = ((high / open) - 1) * 100;
    const maxDrop = ((low / high) - 1) * 100;
    const currentRise = ((current / open) - 1) * 100;
    
    // 조건 확인
    const passed = highRise >= minHighRise && 
                   maxDrop <= maxDropFromHigh && 
                   currentRise >= minCurrentRise;
    
    if (!passed) return null;
    
    // 메시지 생성
    let message = data.messageTemplate || '{{name}} | 고점 {{highRise}}% → 저점 {{maxDrop}}% → 현재 {{currentRise}}%';
    message = message
      .replace(/\{\{name\}\}/gi, name)
      .replace(/\{\{highRise\}\}/gi, highRise.toFixed(1))
      .replace(/\{\{maxDrop\}\}/gi, maxDrop.toFixed(1))
      .replace(/\{\{currentRise\}\}/gi, currentRise.toFixed(1));
    
    return {
      name,
      open,
      high,
      low,
      current,
      highRise: Number(highRise.toFixed(2)),
      maxDrop: Number(maxDrop.toFixed(2)),
      currentRise: Number(currentRise.toFixed(2)),
      message,
    };
  };
  
  // 배열인 경우
  if (Array.isArray(inputData)) {
    const alerts = inputData
      .map((stock: Record<string, unknown>) => analyzeStock(stock))
      .filter(Boolean);
    
    return JSON.stringify({
      __stockalert__: true,
      matchedCount: alerts.length,
      totalCount: inputData.length,
      alerts,
      messages: alerts.map((a: { message: string } | null) => a?.message),
    }, null, 2);
  }
  
  // 단일 객체인 경우
  const result = analyzeStock(inputData as Record<string, unknown>);
  
  if (result) {
    return JSON.stringify({
      __stockalert__: true,
      matched: true,
      ...result,
    }, null, 2);
  }
  
  return JSON.stringify({
    __stockalert__: true,
    matched: false,
    message: '조건에 맞는 패턴이 없습니다.',
  }, null, 2);
}

/**
 * Execute file save (returns metadata for client-side download)
 */
function executeFileSave(data: FileSaveNodeData, input: string): string {
  const filename = data.filename || 'output';
  const fileType = data.fileType || 'txt';
  
  let finalFilename = filename;
  if (data.appendDate) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    finalFilename = `${filename}_${dateStr}`;
  }
  
  // 파일 타입에 따른 처리
  let content = input;
  let mimeType = 'text/plain';
  
  switch (fileType) {
    case 'json':
      try {
        // JSON 포맷 정리
        const parsed = JSON.parse(input);
        content = JSON.stringify(parsed, null, 2);
      } catch {
        // JSON 파싱 실패 시 원본 유지
      }
      mimeType = 'application/json';
      break;
    
    case 'csv':
      // 간단한 텍스트 -> CSV 변환
      // 줄바꿈으로 행 구분, 탭/쉼표로 열 구분
      mimeType = 'text/csv';
      break;
    
    case 'md':
      mimeType = 'text/markdown';
      break;
    
    default:
      mimeType = 'text/plain';
  }

  // 메타데이터를 JSON으로 반환 (클라이언트에서 다운로드 처리)
  return JSON.stringify({
    __filesave__: true,
    filename: `${finalFilename}.${fileType}`,
    mimeType,
    content: content,
  });
}

/**
 * Execute transform operations
 */
function executeTransform(data: TransformNodeData, input: string): string {
  switch (data.transformType) {
    case 'json-extract': {
      try {
        const json = JSON.parse(input) as Record<string, unknown>;
        const path = data.config?.jsonPath || '$';
        // Simple path extraction (supports $.key.subkey format)
        const keys = path.replace(/^\$\.?/, '').split('.').filter(Boolean);
        let result: unknown = json;
        for (const key of keys) {
          if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
            result = (result as Record<string, unknown>)[key];
          } else {
            result = undefined;
          }
        }
        return typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result ?? '');
      } catch {
        return input;
      }
    }

    case 'text-split': {
      const delimiter = data.config?.delimiter || '\n';
      const parts = input.split(delimiter);
      return JSON.stringify(parts, null, 2);
    }

    case 'regex': {
      try {
        const pattern = data.config?.pattern || '';
        const regex = new RegExp(pattern, 'g');
        const matches = input.match(regex);
        return JSON.stringify(matches || [], null, 2);
      } catch {
        return input;
      }
    }

    case 'template': {
      const template = data.config?.template || '{{input}}';
      return template.replace(/\{\{input\}\}/g, input);
    }

    default:
      return input;
  }
}

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

      const input = getNodeInput(nodeId, edges, nodeOutputs);
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
          // If condition is true, skip nodes connected to 'false' handle
          // If condition is false, skip nodes connected to 'true' handle
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
      workflowId: createSafeId('exec'),
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
