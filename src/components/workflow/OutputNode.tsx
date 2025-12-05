'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileOutput, Copy, Check, Download, Maximize2, BarChart3, Table } from 'lucide-react';
import { OutputNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

// Chart.js 타입 (동적 로드)
interface ChartData {
  __chart__: boolean;
  chartConfig?: {
    type: string;
    data: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string | string[];
        borderColor: string | string[];
        borderWidth: number;
        fill?: boolean;
        tension?: number;
      }>;
    };
    options: Record<string, unknown>;
  };
  summary?: {
    total: number;
    average: number;
    max: number;
    min: number;
    count: number;
  };
  error?: string;
}

interface TableData {
  __table__: boolean;
  html?: string;
  title?: string;
  headers?: string[];
  rows?: string[][];
  rowCount?: number;
  error?: string;
}

interface FileSaveData {
  __filesave__: boolean;
  filename: string;
  content: string;
  mimeType: string;
  downloadUrl: string;
}

function OutputNode({ id, data, selected }: NodeProps<OutputNodeData>) {
  const { setSelectedNode } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  // 스크롤 시 캔버스 줌 방지
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    const hasScroll = el.scrollHeight > el.clientHeight;
    if (hasScroll) {
      e.stopPropagation();
    }
  }, []);

  // 데이터 파싱
  const parseResult = useCallback(() => {
    if (!data.result) return null;
    try {
      const parsed = JSON.parse(data.result);
      if (parsed.__filesave__) return { type: 'filesave', data: parsed as FileSaveData };
      if (parsed.__chart__) return { type: 'chart', data: parsed as ChartData };
      if (parsed.__table__) return { type: 'table', data: parsed as TableData };
      return { type: 'json', data: parsed };
    } catch {
      return { type: 'text', data: data.result };
    }
  }, [data.result]);

  const parsedResult = parseResult();

  // Chart.js 렌더링
  useEffect(() => {
    if (parsedResult?.type !== 'chart' || !chartRef.current) return;

    const chartData = parsedResult.data as ChartData;
    if (!chartData.chartConfig || chartData.error) return;

    // Chart.js 동적 로드
    const loadChart = async () => {
      try {
        const Chart = (await import('chart.js/auto')).default;

        // 기존 차트 제거
        if (chartInstanceRef.current) {
          // @ts-expect-error - Chart instance
          chartInstanceRef.current.destroy();
        }

        // 새 차트 생성
        chartInstanceRef.current = new Chart(chartRef.current!, {
          type: chartData.chartConfig!.type as 'bar' | 'line' | 'pie' | 'doughnut',
          data: chartData.chartConfig!.data,
          options: chartData.chartConfig!.options as Record<string, unknown>,
        });
      } catch (error) {
        console.error('Chart.js 로드 실패:', error);
      }
    };

    loadChart();

    return () => {
      if (chartInstanceRef.current) {
        // @ts-expect-error - Chart instance
        chartInstanceRef.current.destroy();
      }
    };
  }, [parsedResult]);

  const handleCopy = async () => {
    if (data.result) {
      const content = parsedResult?.type === 'filesave'
        ? (parsedResult.data as FileSaveData).content
        : data.result;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (parsedResult?.type !== 'filesave') return;
    const fsData = parsedResult.data as FileSaveData;

    const blob = new Blob([fsData.content], { type: fsData.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fsData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 결과 유형에 따른 아이콘
  const getResultIcon = () => {
    switch (parsedResult?.type) {
      case 'chart': return <BarChart3 size={12} className="text-purple-600" />;
      case 'table': return <Table size={12} className="text-purple-600" />;
      case 'filesave': return <Download size={12} className="text-purple-600" />;
      default: return null;
    }
  };

  // 결과 렌더링
  const renderResult = () => {
    // 1. 결과가 아예 없는 경우
    if (!data.result) {
      return (
        <div className="text-xs text-gray-400 italic">
          워크플로우를 실행하면 결과가 표시됩니다...
        </div>
      );
    }

    // 2. 파싱된 결과가 있는 경우
    if (parsedResult) {
      switch (parsedResult.type) {
        case 'filesave': {
          const fsData = parsedResult.data as FileSaveData;
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>📄</span>
                <span className="font-mono">{fsData.filename}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-md transition-colors"
              >
                <Download size={14} />
                다운로드
              </button>
              <pre className="text-xs text-gray-500 whitespace-pre-wrap break-words font-mono max-h-[60px] overflow-hidden">
                {fsData.content.slice(0, 200)}{fsData.content.length > 200 ? '...' : ''}
              </pre>
            </div>
          );
        }

        case 'chart': {
          const chartData = parsedResult.data as ChartData;
          if (chartData.error) {
            return <div className="text-xs text-red-500">{chartData.error}</div>;
          }
          return (
            <div className="space-y-2">
              <canvas ref={chartRef} className="w-full" style={{ maxHeight: expanded ? '300px' : '120px' }} />
              {chartData.summary && (
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 border-t pt-2">
                  <div>합계: {chartData.summary.total.toLocaleString()}</div>
                  <div>평균: {chartData.summary.average.toFixed(1)}</div>
                  <div>최대: {chartData.summary.max.toLocaleString()}</div>
                  <div>최소: {chartData.summary.min.toLocaleString()}</div>
                </div>
              )}
            </div>
          );
        }

        case 'table': {
          const tableData = parsedResult.data as TableData;
          if (tableData.error) {
            return <div className="text-xs text-red-500">{tableData.error}</div>;
          }
          if (tableData.html) {
            return (
              <div
                className="text-xs overflow-auto"
                dangerouslySetInnerHTML={{ __html: tableData.html }}
              />
            );
          }
          return <pre className="text-xs text-gray-700 whitespace-pre-wrap">{data.result}</pre>;
        }

        case 'json':
          return (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
              {JSON.stringify(parsedResult.data, null, 2)}
            </pre>
          );
      }
    }

    // 3. 파싱 실패했거나 일반 텍스트인 경우 (Fallback)
    return (
      <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
        {data.result}
      </pre>
    );
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg border-2 min-w-[200px] max-w-[350px]
        bg-gradient-to-br from-purple-50 to-violet-100
        ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-300'}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500 text-white">
            <FileOutput size={14} />
          </div>
          <span className="font-semibold text-purple-800 text-sm">
            {data.label}
          </span>
        </div>
        {data.result && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1 rounded hover:bg-purple-200 transition-colors"
            title="결과 복사"
          >
            {copied ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <Copy size={14} className="text-purple-600" />
            )}
          </button>
        )}
      </div>

      {/* 출력 타입 배지 + 확대 버튼 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-200 text-purple-700 rounded">
            {data.outputType === 'text' ? '텍스트' : data.outputType === 'json' ? 'JSON' : '마크다운'}
          </span>
          {getResultIcon()}
        </div>
        {data.result && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1 rounded hover:bg-purple-200 transition-colors"
            title={expanded ? "축소" : "확대"}
          >
            <Maximize2 size={12} className="text-purple-600" />
          </button>
        )}
      </div>

      {/* 결과 영역 */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className={`bg-white rounded-md border border-purple-200 p-2 min-h-[60px] overflow-auto transition-all duration-200 ${expanded ? 'max-h-[500px]' : 'max-h-[180px]'
          }`}
      >
        {renderResult()}
      </div>
    </div>
  );
}

export default memo(OutputNode);
