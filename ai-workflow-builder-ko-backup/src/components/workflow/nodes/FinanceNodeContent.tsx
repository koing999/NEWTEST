'use client';

/**
 * 금융 특화 노드 카테고리 콘텐츠 렌더러
 * 
 * 대상 노드: stockalert, compareinput, tableoutput, chart
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart2, Table, ArrowLeftRight,
  AlertTriangle, Bell, LineChart, PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

interface FinanceNodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: any;
    error?: string;
    alertCount?: number;
    tableRows?: number;
  };
}

// ============================================
// 차트 타입 정보
// ============================================

const CHART_TYPES: Record<string, { label: string; icon: React.ElementType }> = {
  bar: { label: '막대', icon: BarChart2 },
  line: { label: '선', icon: LineChart },
  pie: { label: '파이', icon: PieChart },
  doughnut: { label: '도넛', icon: PieChart },
  radar: { label: '레이더', icon: BarChart2 },
};

// ============================================
// 메인 렌더러
// ============================================

function FinanceNodeContent({ nodeType, data, nodeResult }: FinanceNodeContentProps) {
  switch (nodeType) {
    case 'stockalert':
      return <StockAlertContent data={data} nodeResult={nodeResult} />;
    case 'compareinput':
      return <CompareInputContent data={data} nodeResult={nodeResult} />;
    case 'tableoutput':
      return <TableOutputContent data={data} nodeResult={nodeResult} />;
    case 'chart':
      return <ChartContent data={data} nodeResult={nodeResult} />;
    default:
      return <DefaultFinanceContent />;
  }
}

// ============================================
// Stock Alert 노드 콘텐츠
// ============================================

function StockAlertContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const minHighRise = data.minHighRise || 5;
  const maxDropFromHigh = data.maxDropFromHigh || -3;
  const minCurrentRise = data.minCurrentRise || 2;

  return (
    <div className="text-xs space-y-2">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Bell size={12} className="text-emerald-500" />
        <span className="text-gray-700 font-medium">주식 알림</span>
      </div>

      {/* 조건 표시 */}
      <div className="space-y-1 bg-white/60 rounded p-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">고점 상승률:</span>
          <span className="font-mono text-emerald-600">≥{minHighRise}%</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">고점 대비:</span>
          <span className="font-mono text-red-600">≤{maxDropFromHigh}%</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">현재 상승률:</span>
          <span className="font-mono text-emerald-600">≥{minCurrentRise}%</span>
        </div>
      </div>

      {/* 결과 */}
      {nodeResult?.status === 'success' && (
        <div className={cn(
          'p-2 rounded text-center',
          nodeResult.alertCount > 0
            ? 'bg-emerald-100 border border-emerald-300'
            : 'bg-gray-100 border border-gray-300'
        )}>
          {nodeResult.alertCount > 0 ? (
            <div className="flex items-center justify-center gap-1 text-emerald-700">
              <TrendingUp size={12} />
              <span className="font-bold">{nodeResult.alertCount}개 종목 감지</span>
            </div>
          ) : (
            <div className="text-gray-500 text-[10px]">
              조건에 맞는 종목 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Compare Input 노드 콘텐츠
// ============================================

function CompareInputContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const compareTypes: Record<string, { label: string; icon: string }> = {
    financial: { label: '재무제표', icon: '📊' },
    stock: { label: '주가', icon: '📈' },
    all: { label: '전체', icon: '📋' },
  };

  const typeInfo = compareTypes[data.compareType] || compareTypes.all;

  return (
    <div className="text-xs space-y-2">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <ArrowLeftRight size={12} className="text-emerald-500" />
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">
          {typeInfo.icon} {typeInfo.label}
        </span>
      </div>

      {/* 비교 대상 미리보기 */}
      {data.companies && data.companies.length > 0 && (
        <div className="text-[10px] text-gray-600 bg-white/60 rounded p-1.5">
          <span className="text-gray-500">비교 대상:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.companies.slice(0, 3).map((company: string, i: number) => (
              <span key={i} className="px-1 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                {company}
              </span>
            ))}
            {data.companies.length > 3 && (
              <span className="text-gray-500">+{data.companies.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* 결과 */}
      {nodeResult?.status === 'success' && (
        <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[10px]">
          ✓ 비교 데이터 준비 완료
        </div>
      )}
    </div>
  );
}

// ============================================
// Table Output 노드 콘텐츠
// ============================================

function TableOutputContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const styleLabels: Record<string, string> = {
    default: '기본',
    compact: '컴팩트',
    striped: '줄무늬',
  };

  const formatLabels: Record<string, string> = {
    raw: '원본',
    korean: '한국식',
    comma: '콤마',
  };

  return (
    <div className="text-xs space-y-2">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Table size={12} className="text-emerald-500" />
        <span className="text-gray-700">테이블 출력</span>
      </div>

      {/* 설정 표시 */}
      <div className="flex gap-1">
        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px]">
          {styleLabels[data.tableStyle] || '기본'}
        </span>
        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px]">
          {formatLabels[data.numberFormat] || '원본'}
        </span>
      </div>

      {/* 테이블 미리보기 */}
      {nodeResult?.status === 'success' && (
        <div className="bg-white rounded border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700 font-medium border-b border-emerald-100">
            📊 {nodeResult.tableRows || '?'}개 행
          </div>
          {/* 간단한 테이블 미리보기 */}
          <div className="p-1 text-[9px] text-gray-600">
            <div className="grid grid-cols-3 gap-1">
              <div className="bg-gray-50 px-1 py-0.5 rounded truncate">항목</div>
              <div className="bg-gray-50 px-1 py-0.5 rounded truncate">값1</div>
              <div className="bg-gray-50 px-1 py-0.5 rounded truncate">값2</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Chart 노드 콘텐츠
// ============================================

function ChartContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const chartType = data.chartType || 'bar';
  const chartInfo = CHART_TYPES[chartType] || CHART_TYPES.bar;
  const ChartIcon = chartInfo.icon;

  return (
    <div className="text-xs space-y-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartIcon size={12} className="text-emerald-500" />
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">
            {chartInfo.label} 차트
          </span>
        </div>
        {data.showLegend && (
          <span className="text-[9px] text-gray-500">범례 표시</span>
        )}
      </div>

      {/* 차트 제목 */}
      {data.chartTitle && (
        <div className="text-[10px] text-gray-600 bg-white/60 rounded p-1.5 text-center font-medium">
          "{data.chartTitle}"
        </div>
      )}

      {/* 차트 미리보기 영역 */}
      {nodeResult?.status === 'success' && (
        <div className="bg-white rounded border border-emerald-200 p-2">
          {/* 간단한 차트 시각화 */}
          <div className="flex items-end justify-center gap-1 h-12">
            {chartType === 'bar' && (
              <>
                <div className="w-4 bg-emerald-400 rounded-t" style={{ height: '60%' }} />
                <div className="w-4 bg-emerald-500 rounded-t" style={{ height: '100%' }} />
                <div className="w-4 bg-emerald-400 rounded-t" style={{ height: '40%' }} />
                <div className="w-4 bg-emerald-500 rounded-t" style={{ height: '80%' }} />
                <div className="w-4 bg-emerald-400 rounded-t" style={{ height: '50%' }} />
              </>
            )}
            {chartType === 'line' && (
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <polyline
                  points="0,40 25,20 50,30 75,10 100,25"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </svg>
            )}
            {(chartType === 'pie' || chartType === 'doughnut') && (
              <div className={cn(
                'w-12 h-12 rounded-full border-4 border-emerald-400',
                chartType === 'doughnut' && 'bg-white'
              )}
              style={{
                background: chartType === 'pie' 
                  ? 'conic-gradient(#10b981 0% 35%, #34d399 35% 65%, #6ee7b7 65% 100%)'
                  : 'conic-gradient(#10b981 0% 35%, #34d399 35% 65%, #6ee7b7 65% 100%)',
              }}
              />
            )}
          </div>
        </div>
      )}

      {/* 대기 상태 */}
      {!nodeResult && (
        <div className="text-[10px] text-gray-400 text-center bg-gray-50 rounded p-2">
          데이터를 연결하세요
        </div>
      )}
    </div>
  );
}

// ============================================
// 기본 콘텐츠
// ============================================

function DefaultFinanceContent() {
  return (
    <div className="text-xs text-gray-500">
      <TrendingUp size={12} className="inline mr-1" />
      금융 노드 설정 필요
    </div>
  );
}

export default memo(FinanceNodeContent);
export { FinanceNodeContent };
