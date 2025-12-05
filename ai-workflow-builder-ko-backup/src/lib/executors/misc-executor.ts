/**
 * 기타 노드 실행기
 * State, Approval, Code, Parallel, Loop, Webhook, FileSave, StockAlert, CompareInput, TableOutput, Chart 등
 */

import {
  StateNodeData,
  ApprovalNodeData,
  CodeNodeData,
  ParallelNodeData,
  LoopNodeData,
  WebhookNodeData,
  FileSaveNodeData,
  StockAlertNodeData,
  CompareInputNodeData,
  TableOutputNodeData,
  ChartNodeData,
  ConditionNodeData,
} from '@/types/workflow';

// 전역 Flow State (실행 중 공유)
export const flowState: Record<string, unknown> = {};

// Loop State (반복 상태 관리)
export const loopState: Map<string, {
  currentIndex: number;
  maxIterations: number;
  items: string[];
  results: string[];
  startTime: number;
}> = new Map();

/**
 * Execute State node - Flow State 관리
 */
export function executeState(data: StateNodeData, input: string): string {
  const operation = data.operation || 'init';
  const variables = data.variables || [];

  switch (operation) {
    case 'init': {
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
      const results: Record<string, unknown> = {};
      variables.forEach(v => {
        results[v.key] = flowState[v.key] ?? null;
      });
      return JSON.stringify(results, null, 2);
    }

    case 'set': {
      variables.forEach(v => {
        const value = v.value === '{{input}}' ? input : v.value;
        flowState[v.key] = value;
      });
      return JSON.stringify({ __state__: 'updated', flowState });
    }

    case 'update': {
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
 * Execute Approval node - Human-in-the-Loop (Telegram 지원!)
 */
export async function executeApproval(
  data: ApprovalNodeData, 
  input: string,
  nodeId: string,
  workflowId: string
): Promise<{ output: string; waitForApproval: boolean }> {
  const result = data.result || 'pending';
  
  // 이미 승인/거부된 경우
  if (result === 'approved') {
    return {
      output: JSON.stringify({
        __approval__: true,
        status: 'approved',
        message: data.message,
        userInput: data.userInput || '',
        originalInput: input,
      }, null, 2),
      waitForApproval: false,
    };
  } else if (result === 'rejected') {
    return {
      output: JSON.stringify({
        __approval__: true,
        status: 'rejected',
        message: data.message,
        userInput: data.userInput || '',
        originalInput: input,
      }, null, 2),
      waitForApproval: false,
    };
  }
  
  // Telegram 승인 요청
  if (data.useTelegram && data.telegramBotToken && data.telegramChatId) {
    try {
      const approvalId = `${workflowId}-${nodeId}-${Date.now()}`;
      
      // 승인 요청 저장 (나중에 콜백으로 처리)
      pendingApprovals.set(approvalId, {
        nodeId,
        workflowId,
        status: 'pending',
        createdAt: Date.now(),
      });
      
      // Telegram 메시지 전송
      const telegramMessage = `🔔 **승인 요청**

📋 ${data.message || '워크플로우 승인이 필요합니다'}

📝 **입력 데이터:**
\`\`\`
${input.slice(0, 500)}${input.length > 500 ? '...' : ''}
\`\`\`

🔑 승인 ID: \`${approvalId}\``;

      const response = await fetch(
        `https://api.telegram.org/bot${data.telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: data.telegramChatId,
            text: telegramMessage,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: `✅ ${data.approveLabel || '승인'}`, callback_data: `APPROVE|${approvalId}` },
                { text: `❌ ${data.rejectLabel || '거부'}`, callback_data: `REJECT|${approvalId}` },
              ]],
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Telegram API 오류: ${error}`);
      }

      return {
        output: JSON.stringify({
          __approval__: true,
          status: 'waiting_telegram',
          approvalId,
          message: 'Telegram으로 승인 요청을 보냈습니다. 승인/거부를 기다리는 중...',
          telegramSent: true,
          originalInput: input,
        }, null, 2),
        waitForApproval: true,
      };
    } catch (error) {
      return {
        output: JSON.stringify({
          __approval__: true,
          status: 'error',
          error: `Telegram 전송 실패: ${error instanceof Error ? error.message : String(error)}`,
          originalInput: input,
        }, null, 2),
        waitForApproval: false,
      };
    }
  }
  
  // 기본 (Telegram 미사용) - UI에서 처리
  return {
    output: JSON.stringify({
      __approval__: true,
      status: 'pending',
      message: data.message,
      showInput: data.showInput,
      approveLabel: data.approveLabel,
      rejectLabel: data.rejectLabel,
      originalInput: input,
    }, null, 2),
    waitForApproval: false,
  };
}

// 대기 중인 승인 요청 저장소
export const pendingApprovals = new Map<string, {
  nodeId: string;
  workflowId: string;
  status: 'pending' | 'approved' | 'rejected';
  userInput?: string;
  createdAt: number;
}>();

/**
 * Telegram 콜백 처리 - 승인/거부 결과 업데이트
 */
export function handleTelegramCallback(
  approvalId: string, 
  action: 'APPROVE' | 'REJECT',
  userInput?: string
): { success: boolean; message: string } {
  const approval = pendingApprovals.get(approvalId);
  
  if (!approval) {
    return { success: false, message: '승인 요청을 찾을 수 없습니다.' };
  }
  
  if (approval.status !== 'pending') {
    return { success: false, message: '이미 처리된 요청입니다.' };
  }
  
  approval.status = action === 'APPROVE' ? 'approved' : 'rejected';
  approval.userInput = userInput;
  pendingApprovals.set(approvalId, approval);
  
  return { 
    success: true, 
    message: action === 'APPROVE' ? '✅ 승인되었습니다!' : '❌ 거부되었습니다.' 
  };
}

/**
 * 승인 상태 확인
 */
export function getApprovalStatus(approvalId: string): {
  status: 'pending' | 'approved' | 'rejected' | 'not_found';
  userInput?: string;
} {
  const approval = pendingApprovals.get(approvalId);
  
  if (!approval) {
    return { status: 'not_found' };
  }
  
  return {
    status: approval.status,
    userInput: approval.userInput,
  };
}

/**
 * Execute Code node - JavaScript 코드 실행
 */
export function executeCode(data: CodeNodeData, input: string): string {
  const code = data.code || '';
  
  if (!code.trim()) {
    return input;
  }

  try {
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
      $state: flowState,
    };

    const fn = new Function(
      'input',
      ...Object.keys(allowedGlobals),
      `"use strict";
      ${code}`
    );

    const result = fn(input, ...Object.values(allowedGlobals));
    
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
 * Execute Parallel node - 병렬 실행 (진짜 병렬!)
 * 입력을 여러 브랜치로 분기하고 결과를 병합
 */
export function executeParallel(data: ParallelNodeData, input: string): string {
  const branches = data.branches || 2;
  const mergeStrategy = data.mergeStrategy || 'all';
  
  // 입력 데이터를 각 브랜치에 복사
  const branchInputs: string[] = Array(branches).fill(input);
  
  return JSON.stringify({
    __parallel__: true,
    branches,
    mergeStrategy,
    branchInputs,
    status: 'ready',
    message: `${branches}개 브랜치로 분기 준비 완료. 병합 전략: ${mergeStrategy}`,
  }, null, 2);
}

/**
 * Execute Loop node - 진짜 반복 실행!
 * count: 지정 횟수만큼 반복
 * foreach: 입력을 구분자로 나눠서 각각 실행
 * while: 조건이 참인 동안 반복 (최대 횟수 제한)
 */
export function executeLoop(
  data: LoopNodeData, 
  input: string,
  nodeId: string
): { output: string; shouldContinue: boolean; isComplete: boolean } {
  const loopType = data.loopType || 'count';
  const maxIterations = Math.min(data.maxIterations || 10, 100); // 최대 100회 제한
  const delimiter = data.delimiter || '\n';
  const TIMEOUT_MS = 30000; // 30초 타임아웃
  
  // 루프 상태 초기화 또는 가져오기
  let state = loopState.get(nodeId);
  
  if (!state) {
    // 첫 실행 - 초기화
    let items: string[] = [];
    
    if (loopType === 'foreach') {
      // foreach: 입력을 나눠서 배열로
      items = input.split(delimiter).map(s => s.trim()).filter(Boolean);
    } else {
      // count/while: 입력을 그대로 사용
      items = Array(maxIterations).fill(input);
    }
    
    state = {
      currentIndex: 0,
      maxIterations: loopType === 'foreach' ? items.length : maxIterations,
      items,
      results: [],
      startTime: Date.now(),
    };
    loopState.set(nodeId, state);
  }
  
  // 타임아웃 체크
  if (Date.now() - state.startTime > TIMEOUT_MS) {
    const finalResults = state.results;
    loopState.delete(nodeId);
    
    return {
      output: JSON.stringify({
        __loop__: true,
        status: 'timeout',
        message: `⏰ 타임아웃! ${state.currentIndex}회 실행 후 중단됨`,
        completedIterations: state.currentIndex,
        maxIterations: state.maxIterations,
        results: finalResults,
      }, null, 2),
      shouldContinue: false,
      isComplete: true,
    };
  }
  
  // 현재 반복 실행
  const currentItem = state.items[state.currentIndex] || input;
  
  // while 타입: 조건 체크
  if (loopType === 'while' && data.condition) {
    try {
      const conditionResult = evaluateLoopCondition(data.condition, input, state.currentIndex);
      if (!conditionResult) {
        // 조건 불만족 - 루프 종료
        const finalResults = state.results;
        loopState.delete(nodeId);
        
        return {
          output: JSON.stringify({
            __loop__: true,
            status: 'complete',
            message: `✅ 조건 불만족으로 ${state.currentIndex}회 실행 후 종료`,
            completedIterations: state.currentIndex,
            results: finalResults,
          }, null, 2),
          shouldContinue: false,
          isComplete: true,
        };
      }
    } catch {
      // 조건 평가 실패 시 계속 진행
    }
  }
  
  // 결과 저장
  state.results.push(currentItem);
  state.currentIndex++;
  
  // 완료 체크
  if (state.currentIndex >= state.maxIterations) {
    const finalResults = state.results;
    loopState.delete(nodeId);
    
    return {
      output: JSON.stringify({
        __loop__: true,
        status: 'complete',
        message: `✅ ${state.maxIterations}회 반복 완료!`,
        completedIterations: state.maxIterations,
        results: finalResults,
        // foreach의 경우 각 항목 결과를 병합
        mergedOutput: loopType === 'foreach' ? finalResults.join('\n\n---\n\n') : finalResults[finalResults.length - 1],
      }, null, 2),
      shouldContinue: false,
      isComplete: true,
    };
  }
  
  // 계속 반복
  return {
    output: JSON.stringify({
      __loop__: true,
      status: 'iterating',
      currentIndex: state.currentIndex,
      maxIterations: state.maxIterations,
      progress: `${state.currentIndex}/${state.maxIterations}`,
      currentItem,
      message: `🔄 ${state.currentIndex}번째 반복 중...`,
    }, null, 2),
    shouldContinue: true,
    isComplete: false,
  };
}

/**
 * 루프 조건 평가 (while용)
 */
function evaluateLoopCondition(condition: string, input: string, index: number): boolean {
  try {
    // 간단한 조건 평가
    const ctx = {
      input,
      index,
      length: input.length,
      isEmpty: input.trim() === '',
      isNotEmpty: input.trim() !== '',
    };
    
    // 위험한 코드 방지
    if (condition.includes('while') || condition.includes('for') || condition.includes('function')) {
      return false;
    }
    
    const fn = new Function('ctx', `with(ctx) { return ${condition}; }`);
    return Boolean(fn(ctx));
  } catch {
    return false;
  }
}

/**
 * 루프 상태 초기화 (워크플로우 시작 시 호출)
 */
export function resetLoopState(): void {
  loopState.clear();
}

/**
 * Send webhook notification
 */
export async function sendWebhook(data: WebhookNodeData, input: string): Promise<void> {
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
 * Execute FileSave node - 파일 저장 (브라우저 다운로드 트리거!)
 */
export function executeFileSave(data: FileSaveNodeData, input: string): string {
  const filename = data.filename || 'output';
  const fileType = data.fileType || 'json';
  const appendDate = data.appendDate !== false;
  
  const date = appendDate ? `_${new Date().toISOString().slice(0, 10)}` : '';
  const fullFilename = `${filename}${date}.${fileType}`;
  
  let content: string;
  let mimeType: string;
  
  switch (fileType) {
    case 'json':
      mimeType = 'application/json';
      try {
        const parsed = JSON.parse(input);
        content = JSON.stringify(parsed, null, 2);
      } catch {
        content = JSON.stringify({ data: input }, null, 2);
      }
      break;
    
    case 'csv': {
      mimeType = 'text/csv';
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const headers = Object.keys(parsed[0]);
          const rows = parsed.map((row: Record<string, unknown>) => 
            headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
          );
          content = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // BOM for Excel
        } else {
          content = input;
        }
      } catch {
        content = input;
      }
      break;
    }
    
    case 'md':
      mimeType = 'text/markdown';
      content = input;
      break;
    
    case 'txt':
    default:
      mimeType = 'text/plain';
      content = input;
      break;
  }
  
  // Base64로 인코딩하여 클라이언트에서 다운로드 가능하게
  const base64Content = Buffer.from(content, 'utf-8').toString('base64');
  
  return JSON.stringify({
    __filesave__: true,
    filename: fullFilename,
    content,
    base64: base64Content,
    mimeType,
    size: content.length,
    type: fileType,
    // 클라이언트에서 이 데이터로 다운로드 트리거 가능
    downloadUrl: `data:${mimeType};base64,${base64Content}`,
  }, null, 2);
}

/**
 * Execute StockAlert node - 주식 급등락 알림
 */
export function executeStockAlert(data: StockAlertNodeData, input: string): string {
  let inputData: unknown;
  try {
    inputData = JSON.parse(input);
  } catch {
    throw new Error('StockAlert 노드는 JSON 입력이 필요합니다.');
  }
  
  const openField = data.openField || 'open';
  const highField = data.highField || 'high';
  const lowField = data.lowField || 'low';
  const currentField = data.currentField || 'current';
  const nameField = data.nameField || 'name';
  
  const minHighRise = data.minHighRise ?? 18;
  const maxDropFromHigh = data.maxDropFromHigh ?? -8;
  const minCurrentRise = data.minCurrentRise ?? 13;
  
  const analyzeStock = (stock: Record<string, unknown>) => {
    const open = Number(stock[openField]) || 0;
    const high = Number(stock[highField]) || 0;
    const low = Number(stock[lowField]) || 0;
    const current = Number(stock[currentField]) || 0;
    const name = String(stock[nameField] || '알 수 없음');
    
    if (open === 0) return null;
    
    const highRise = ((high / open) - 1) * 100;
    const maxDrop = ((low / high) - 1) * 100;
    const currentRise = ((current / open) - 1) * 100;
    
    const passed = highRise >= minHighRise && 
                   maxDrop <= maxDropFromHigh && 
                   currentRise >= minCurrentRise;
    
    if (!passed) return null;
    
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
 * Execute CompareInput node - 기업 비교 입력
 */
export function executeCompareInput(data: CompareInputNodeData, _input: string): string {
  const companies = data.companies || [];
  
  if (companies.length === 0) {
    return JSON.stringify({
      __compareinput__: true,
      error: '비교할 기업이 없습니다.',
      companies: [],
    });
  }

  return JSON.stringify({
    __compareinput__: true,
    companies,
    compareType: data.compareType || 'financial',
    message: `${companies.length}개 기업 비교: ${companies.join(', ')}`,
  }, null, 2);
}

/**
 * 테이블 값 포맷팅 헬퍼
 */
function formatTableValue(value: unknown, format: string): string {
  if (value === null || value === undefined) return '-';
  
  if (typeof value === 'number') {
    if (format === 'korean') {
      if (Math.abs(value) >= 1e12) {
        return `${(value / 1e12).toFixed(1)}조`;
      } else if (Math.abs(value) >= 1e8) {
        return `${(value / 1e8).toFixed(1)}억`;
      } else if (Math.abs(value) >= 1e4) {
        return `${(value / 1e4).toFixed(1)}만`;
      }
      return value.toLocaleString('ko-KR');
    }
    return value.toLocaleString();
  }
  
  return String(value);
}

/**
 * Execute TableOutput node - JSON을 HTML 표 형식으로 변환
 */
export function executeTableOutput(data: TableOutputNodeData, input: string): string {
  try {
    let parsedInput: unknown;
    
    try {
      parsedInput = JSON.parse(input);
    } catch {
      return JSON.stringify({
        __table__: true,
        error: '표로 변환할 수 없는 데이터입니다.',
        raw: input,
      });
    }

    // 스타일 정의
    const styles: Record<string, { header: string; cell: string; table: string }> = {
      default: {
        table: 'border-collapse: collapse; width: 100%; font-family: -apple-system, BlinkMacSystemFont, sans-serif;',
        header: 'background: #4F46E5; color: white; padding: 12px 16px; text-align: left; font-weight: 600;',
        cell: 'border-bottom: 1px solid #E5E7EB; padding: 12px 16px;',
      },
      compact: {
        table: 'border-collapse: collapse; width: 100%; font-size: 13px;',
        header: 'background: #F3F4F6; color: #374151; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #D1D5DB;',
        cell: 'border-bottom: 1px solid #E5E7EB; padding: 8px 12px;',
      },
      striped: {
        table: 'border-collapse: collapse; width: 100%;',
        header: 'background: #1F2937; color: white; padding: 12px 16px; text-align: left;',
        cell: 'padding: 12px 16px;',
      },
    };

    const style = styles[data.tableStyle || 'default'] || styles.default;

    const generateHtml = (headers: string[], rows: string[][], title?: string): string => {
      const headerHtml = headers
        .map(h => `<th style="${style.header}">${h}</th>`)
        .join('');
      
      const rowsHtml = rows
        .map((row, i) => {
          const rowStyle = data.tableStyle === 'striped' && i % 2 === 1 
            ? 'background: #F9FAFB;' 
            : '';
          const cellsHtml = row.map((cell, j) => {
            const align = data.numberAlign && !isNaN(Number(cell.replace(/[^0-9.-]/g, ''))) 
              ? 'text-align: right;' 
              : '';
            // 변화 표시기
            let indicator = '';
            if (data.showChangeIndicator && typeof cell === 'string') {
              if (cell.includes('-') || cell.startsWith('-')) {
                indicator = ' style="color: #EF4444;"';
              } else if (parseFloat(cell.replace(/[^0-9.-]/g, '')) > 0) {
                indicator = ' style="color: #10B981;"';
              }
            }
            return `<td style="${style.cell}${align}"${indicator}>${cell}</td>`;
          }).join('');
          return `<tr style="${rowStyle}">${cellsHtml}</tr>`;
        })
        .join('');

      return `
<div style="overflow-x: auto;">
  ${title ? `<h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">${title}</h3>` : ''}
  <table style="${style.table}">
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</div>`;
    };

    if (Array.isArray(parsedInput) && parsedInput.length > 0) {
      const headers = Object.keys(parsedInput[0] as Record<string, unknown>);
      const rows = parsedInput.map((item: Record<string, unknown>) => 
        headers.map(h => formatTableValue(item[h], data.numberFormat || 'korean'))
      );

      const html = generateHtml(headers, rows, data.label);

      return JSON.stringify({
        __table__: true,
        html,
        title: data.label || '데이터 테이블',
        headers,
        rows,
        rowCount: rows.length,
        style: data.tableStyle || 'default',
      }, null, 2);
    }

    if (typeof parsedInput === 'object' && parsedInput !== null) {
      const obj = parsedInput as Record<string, unknown>;
      const headers = ['항목', '값'];
      const rows = Object.entries(obj).map(([key, value]) => [
        key,
        formatTableValue(value, data.numberFormat || 'korean'),
      ]);

      const html = generateHtml(headers, rows, data.label);

      return JSON.stringify({
        __table__: true,
        html,
        title: data.label || '데이터 테이블',
        headers,
        rows,
        rowCount: rows.length,
        style: data.tableStyle || 'default',
      }, null, 2);
    }

    return JSON.stringify({
      __table__: true,
      error: '표로 변환할 수 없는 데이터 형식입니다.',
      raw: input,
    });
  } catch (error) {
    return JSON.stringify({
      __table__: true,
      error: `테이블 변환 실패: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/**
 * Execute Chart node - JSON을 Chart.js 호환 차트 데이터로 변환
 */
export function executeChart(data: ChartNodeData, input: string): string {
  try {
    let parsedInput: unknown;
    
    try {
      parsedInput = JSON.parse(input);
    } catch {
      return JSON.stringify({
        __chart__: true,
        error: '차트로 변환할 수 없는 데이터입니다.',
      });
    }

    // 색상 테마 정의
    const colorThemes: Record<string, string[]> = {
      default: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
      warm: ['#EF4444', '#F97316', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7', '#FFFBEB'],
      cool: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF', '#EEF2FF', '#F5F3FF'],
      mono: ['#111827', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
    };

    const colors = colorThemes[data.colorTheme || 'default'] || colorThemes.default;

    if (Array.isArray(parsedInput) && parsedInput.length > 0) {
      const firstItem = parsedInput[0] as Record<string, unknown>;
      const keys = Object.keys(firstItem);
      
      const labelField = data.labelField || keys.find(k => typeof firstItem[k] === 'string') || keys[0];
      const valueField = data.valueField || keys.find(k => typeof firstItem[k] === 'number') || keys[1];

      const labels = parsedInput.map((item: Record<string, unknown>) => String(item[labelField] || ''));
      const values = parsedInput.map((item: Record<string, unknown>) => Number(item[valueField]) || 0);

      // Chart.js 호환 설정 생성
      const chartConfig = {
        type: data.chartType || 'bar',
        data: {
          labels,
          datasets: [{
            label: data.chartTitle || valueField,
            data: values,
            backgroundColor: data.chartType === 'line' ? colors[0] + '33' : colors.slice(0, values.length),
            borderColor: data.chartType === 'line' ? colors[0] : colors.slice(0, values.length),
            borderWidth: data.chartType === 'line' ? 2 : 1,
            fill: data.chartType === 'line',
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: data.showLegend !== false,
              position: 'top' as const,
            },
            title: {
              display: true,
              text: data.chartTitle || data.label || '차트',
              font: { size: 16, weight: 'bold' as const },
            },
            datalabels: data.showValues ? {
              display: true,
              anchor: 'end' as const,
              align: 'top' as const,
            } : { display: false },
          },
          scales: data.chartType !== 'pie' && data.chartType !== 'doughnut' ? {
            y: {
              beginAtZero: true,
              grid: { display: data.showGrid !== false },
            },
            x: {
              grid: { display: false },
            },
          } : undefined,
        },
      };

      return JSON.stringify({
        __chart__: true,
        chartConfig,
        // 요약 데이터
        summary: {
          total: values.reduce((a, b) => a + b, 0),
          average: values.reduce((a, b) => a + b, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
          count: values.length,
        },
        // 원본 데이터
        rawData: { labels, values },
      }, null, 2);
    }

    return JSON.stringify({
      __chart__: true,
      error: '차트로 변환할 수 없는 데이터 형식입니다.',
    });
  } catch (error) {
    return JSON.stringify({
      __chart__: true,
      error: `차트 변환 실패: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/**
 * Evaluate condition for condition nodes
 */
export function evaluateCondition(data: ConditionNodeData, input: string): boolean {
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
