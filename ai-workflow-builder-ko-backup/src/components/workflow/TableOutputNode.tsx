'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Table, Download, Copy, Check, Maximize2 } from 'lucide-react';
import { TableOutputNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function TableOutputNode({ id, data, selected }: NodeProps<TableOutputNodeData>) {
  const { setSelectedNode } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스크롤 시 캔버스 줌 방지
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    const hasScroll = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
    if (hasScroll) {
      e.stopPropagation();
    }
  }, []);

  // 결과 파싱
  const parseTableData = useCallback(() => {
    if (!data.result) return null;
    try {
      const parsed = JSON.parse(data.result);

      // 1. 명시적 테이블 데이터
      if (parsed.__table__) {
        return parsed;
      }

      // 2. 일반 배열인 경우
      if (Array.isArray(parsed) && parsed.length > 0) {
        const headers = Object.keys(parsed[0]);
        const rows = parsed.map((item: Record<string, unknown>) => headers.map(h => item[h]));
        return { headers, rows, title: '데이터 테이블' };
      }

      // 3. 객체 내부의 배열 탐색 (Smart Detection for DART, API responses)
      if (typeof parsed === 'object' && parsed !== null) {
        // DART는 'list', 일반 API는 'data', 'results', 'items' 등을 주로 사용
        const candidates = ['list', 'data', 'results', 'items', 'body'];

        for (const key of candidates) {
          const candidateData = (parsed as Record<string, unknown>)[key];
          if (Array.isArray(candidateData) && candidateData.length > 0) {
            const headers = Object.keys(candidateData[0]);
            const rows = candidateData.map((item: Record<string, unknown>) => headers.map(h => item[h]));
            return { headers, rows, title: key }; // 발견된 키를 타이틀로 사용
          }
        }
      }
    } catch {
      // JSON 파싱 실패 시, CSV 문자열인지 확인
      if (typeof data.result === 'string' && data.result.includes(',')) {
        const lines = data.result.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
          // CSV 파싱 (간단한 버전: 따옴표 처리 등은 복잡하지만 여기선 split으로 처리)
          // 주의: 실제 CSV는 따옴표 내의 콤마 등을 처리해야 하지만, 
          // 여기서는 TransformNode에서 생성한 표준 CSV라고 가정하고 처리

          // 첫 줄은 헤더
          const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '')); // 따옴표 제거

          // 나머지 줄은 데이터
          const rows = lines.slice(1).map(line => {
            // 정규식으로 CSV 파싱 (따옴표 내 콤마 무시)
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            // 매칭이 안되면 단순 split (fallback)
            const cells = matches.length > 0 ? matches : line.split(',');

            return cells.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
          });

          return { headers, rows, title: 'CSV 데이터' };
        }
      }
    }
    return null;
  }, [data.result]);

  const tableData = parseTableData();

  const handleCopy = async () => {
    if (tableData) {
      // CSV 형식으로 복사
      const csv = [
        tableData.headers.join('\t'),
        ...tableData.rows.map((row: unknown[]) => row.join('\t'))
      ].join('\n');
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (!tableData) return;

    let csvContent = '';

    // 입력이 이미 CSV 문자열이면 그대로 사용 (가장 정확함)
    if (typeof data.result === 'string' && data.result.includes(',') && !data.result.trim().startsWith('{')) {
      csvContent = data.result;
    } else {
      // 아니면 tableData에서 재생성
      csvContent = [
        tableData.headers.join(','),
        ...tableData.rows.map((row: unknown[]) =>
          row.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');
    }

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableData.title || 'table'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    if (!tableData) return;

    // 엑셀에서 한글 깨짐 방지를 위해 BOM(Byte Order Mark) 추가된 CSV로 다운로드
    // 실제 .xlsx 라이브러리 없이 가장 호환성 좋은 방법
    let csvContent = '';

    // 헤더
    csvContent += tableData.headers.join(',') + '\n';

    // 데이터
    csvContent += tableData.rows.map((row: unknown[]) =>
      row.map((cell: unknown) => {
        const str = String(cell);
        // 쉼표나 따옴표가 있으면 따옴표로 감싸고, 내부 따옴표는 이스케이프
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 엑셀에서 바로 열리도록 확장자를 .csv로 하되, 명시적으로 엑셀용임을 알림
    a.download = `${tableData.title || 'data'}_excel_compatible_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[300px]
        bg-gradient-to-br from-emerald-50 to-teal-100
        ${selected ? 'ring-2 ring-emerald-400 border-emerald-500' : 'border-emerald-300'}
        transition-all duration-200 hover:shadow-xl
        ${expanded ? 'max-w-[600px]' : 'max-w-[400px]'}
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <Table size={16} />
          </div>
          <span className="font-bold text-gray-800">
            {data.label || '표 출력'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {tableData && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="p-1 rounded hover:bg-emerald-200 transition-colors"
                title="복사"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-emerald-600" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="p-1 rounded hover:bg-emerald-200 transition-colors"
                title={expanded ? "축소" : "확대"}
              >
                <Maximize2 size={14} className="text-emerald-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 다운로드 버튼들 - 데이터가 있으면 무조건 표시 */}
      {data.result && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadCSV();
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg transition-colors"
          >
            <Download size={12} />
            CSV
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadExcel();
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors"
          >
            <Download size={12} />
            Excel
          </button>
        </div>
      )}

      {/* 테이블 미리보기 */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className={`bg-white rounded-lg border border-emerald-200 overflow-auto transition-all duration-200 ${expanded ? 'max-h-[400px]' : 'max-h-[200px]'
          }`}
      >
        {tableData ? (
          <table className="w-full text-xs">
            <thead className="bg-emerald-100 sticky top-0">
              <tr>
                {tableData.headers.map((header: string, idx: number) => (
                  <th key={idx} className="px-2 py-1.5 text-left text-emerald-800 font-semibold border-b border-emerald-200 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.slice(0, expanded ? 50 : 5).map((row: unknown[], rowIdx: number) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50'}>
                  {row.map((cell: unknown, cellIdx: number) => (
                    <td key={cellIdx} className="px-2 py-1 border-b border-emerald-100 whitespace-nowrap">
                      {formatCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center text-gray-400 text-xs">
            워크플로우를 실행하면 표가 표시됩니다...
          </div>
        )}
      </div>

      {/* 행 수 정보 */}
      {tableData && (
        <div className="mt-2 text-[10px] text-emerald-600 text-center">
          총 {tableData.rows.length}개 행 {!expanded && tableData.rows.length > 5 && `(5개만 표시)`}
        </div>
      )}

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
      />
    </div>
  );
}

// 셀 값 포맷팅
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    // 큰 숫자는 억/조 단위로 표시
    if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(1)}조`;
    if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(1)}억`;
    if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(1)}만`;
    // 소수점이 있으면 2자리까지
    if (value % 1 !== 0) return value.toFixed(2);
    return value.toLocaleString();
  }
  return String(value);
}

export default memo(TableOutputNode);
