/**
 * Transform 관련 노드 실행기
 * Transform, Random, Slice, DateTime, Template, HtmlClean, Math, Formula, MultiFilter 등
 */

import {
  TransformNodeData,
  RandomNodeData,
  SliceNodeData,
  DateTimeNodeData,
  TemplateNodeData,
  HtmlCleanNodeData,
  MathNodeData,
  FormulaNodeData,
  MultiFilterNodeData,
} from '@/types/workflow';

/**
 * Execute data transformation
 */
export function executeTransform(data: TransformNodeData, input: string): string {
  const transformType = data.transformType || 'json-extract';

  switch (transformType) {
    case 'json-extract': {
      try {
        const json = JSON.parse(input);
        const path = (data.config?.jsonPath || '').split('.');
        let result: unknown = json;
        for (const key of path) {
          if (result && typeof result === 'object') {
            result = (result as Record<string, unknown>)[key];
          } else {
            result = undefined;
            break;
          }
        }
        return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      } catch {
        return input;
      }
    }

    case 'json-to-csv': {
      try {
        const json = JSON.parse(input);
        let items: any[] = [];

        // 배열 찾기 (Smart Detection)
        if (Array.isArray(json)) {
          items = json;
        } else if (typeof json === 'object' && json !== null) {
          const candidates = ['list', 'data', 'results', 'items', 'body'];
          for (const key of candidates) {
            if (Array.isArray((json as any)[key])) {
              items = (json as any)[key];
              break;
            }
          }
        }

        if (items.length === 0) return '데이터가 없습니다.';

        // CSV 변환
        const headers = Object.keys(items[0]);
        const csvRows = [
          headers.join(','),
          ...items.map(item =>
            headers.map(header => {
              const val = item[header];
              const str = val === null || val === undefined ? '' : String(val);
              return `"${str.replace(/"/g, '""')}"`; // CSV 이스케이프
            }).join(',')
          )
        ];

        return csvRows.join('\n');
      } catch {
        return 'JSON 파싱 실패';
      }
    }

    case 'text-split': {
      const parts = input.split(data.config?.delimiter || '\n');
      return JSON.stringify(parts.map(p => p.trim()).filter(Boolean));
    }

    case 'regex': {
      const regex = new RegExp(data.config?.pattern || '', 'gm');
      const matches = input.match(regex);
      return JSON.stringify(matches || []);
    }

    default:
      return input;
  }
}

/**
 * Execute random selection
 */
export function executeRandom(data: RandomNodeData, input: string): string {
  const delimiter = data.delimiter || '\n';
  const items = input.split(delimiter).map(s => s.trim()).filter(Boolean);

  if (items.length === 0) {
    return '';
  }

  const count = Math.min(data.count || 1, items.length);
  const results: string[] = [];

  if (data.allowDuplicate) {
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * items.length);
      results.push(items[idx]);
    }
  } else {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    results.push(...shuffled.slice(0, count));
  }

  return results.join(delimiter);
}

/**
 * Execute text slicing
 */
export function executeSlice(data: SliceNodeData, input: string): string {
  const sliceType = data.sliceType || 'chars';
  const start = data.start || 0;
  const end = data.end;

  switch (sliceType) {
    case 'chars':
      return end !== undefined ? input.slice(start, end) : input.slice(start);

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
export function executeDateTime(data: DateTimeNodeData, _input: string): string {
  const timezone = data.timezone || 'Asia/Seoul';
  const now = new Date();

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
 * Execute Template node - 빈칸 채우기
 */
export function executeTemplate(data: TemplateNodeData, input: string): string {
  let template = data.template || '';
  const variables = data.variables || [];

  template = template.replace(/\{\{input\}\}/gi, input);

  let inputObj: Record<string, string> = {};
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === 'object' && parsed !== null) {
      inputObj = parsed as Record<string, string>;
    }
  } catch {
    // JSON이 아니면 무시
  }

  for (const variable of variables) {
    const key = variable.key;
    const value = inputObj[key] || variable.value || '';
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    template = template.replace(regex, value);
  }

  template = template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return inputObj[varName] ?? match;
  });

  return template;
}

/**
 * Execute HTML Clean node - 태그 청소기
 */
export function executeHtmlClean(data: HtmlCleanNodeData, input: string): string {
  let result = input;

  if (data.removeScripts !== false) {
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  if (data.removeStyles !== false) {
    result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }

  if (data.removeComments !== false) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (data.keepLinks) {
    result = result.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '$2 ($1)');
  } else {
    result = result.replace(/<a\b[^>]*>([^<]*)<\/a>/gi, '$1');
  }

  if (data.keepImages) {
    result = result.replace(/<img\s+[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '[이미지: $2] ($1)');
    result = result.replace(/<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '[이미지: $1] ($2)');
    result = result.replace(/<img\s+[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '[이미지] ($1)');
  }

  result = result.replace(/<br\s*\/?>/gi, '\n');
  result = result.replace(/<\/p>/gi, '\n\n');
  result = result.replace(/<\/div>/gi, '\n');
  result = result.replace(/<\/li>/gi, '\n');
  result = result.replace(/<\/tr>/gi, '\n');
  result = result.replace(/<\/h[1-6]>/gi, '\n\n');

  result = result.replace(/<[^>]+>/g, '');

  result = result
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");

  result = result.replace(/[ \t]+/g, ' ');
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
  result = result.trim();

  const originalLength = input.length;
  const cleanedLength = result.length;
  const savedPercent = Math.round((1 - cleanedLength / originalLength) * 100);

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
 * Execute Math node - 단순 계산기
 */
export function executeMath(data: MathNodeData, input: string): string {
  const operation = data.operation || 'add';
  const decimals = data.decimals ?? 2;

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
      if (value2 === 0) throw new Error('0으로 나눌 수 없습니다.');
      result = value1 / value2;
      break;
    case 'percent':
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

  return String(Number(result.toFixed(decimals)));
}

/**
 * Execute Formula node - 다중 필드 수식 계산
 */
export function executeFormula(data: FormulaNodeData, input: string): string {
  const formulas = data.formulas || [];

  let inputData: Record<string, unknown>;
  try {
    inputData = JSON.parse(input);
  } catch {
    throw new Error('Formula 노드는 JSON 입력이 필요합니다.');
  }

  if (Array.isArray(inputData)) {
    const results = inputData.map((item: Record<string, unknown>) => {
      const calculated: Record<string, unknown> = { ...item };

      for (const formula of formulas) {
        try {
          let expr = formula.formula;
          for (const field of data.inputFields || []) {
            const regex = new RegExp(`\\b${field}\\b`, 'g');
            expr = expr.replace(regex, String(item[field] ?? 0));
          }

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
    } catch {
      calculated[formula.name] = 0;
    }
  }

  return JSON.stringify(calculated, null, 2);
}

/**
 * Execute MultiFilter node - 복합 조건 필터
 */
export function executeMultiFilter(data: MultiFilterNodeData, input: string): string {
  const conditions = data.conditions || [];
  const logic = data.logic || 'AND';

  if (conditions.length === 0) {
    return input;
  }

  let inputData: unknown;
  try {
    inputData = JSON.parse(input);
  } catch {
    throw new Error('MultiFilter 노드는 JSON 입력이 필요합니다.');
  }

  const evaluateCondition = (item: Record<string, unknown>, condition: { field: string; operator: string; value: string }): boolean => {
    const fieldValue = item[condition.field];
    const compareValue = condition.value;

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

  const evaluateAllConditions = (item: Record<string, unknown>): boolean => {
    if (logic === 'AND') {
      return conditions.every(c => evaluateCondition(item, c));
    } else {
      return conditions.some(c => evaluateCondition(item, c));
    }
  };

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

  const passed = evaluateAllConditions(inputData as Record<string, unknown>);
  return JSON.stringify({ ...inputData as object, __passed__: passed }, null, 2);
}
