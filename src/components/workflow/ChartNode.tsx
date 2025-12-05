'use client';

import { memo, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BarChart3, Download } from 'lucide-react';
import { ChartNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

function ChartNode({ id, data, selected }: NodeProps<ChartNodeData>) {
  const { setSelectedNode } = useWorkflowStore();
  const chartRef = useRef<HTMLDivElement>(null);

  // 스크롤 시 캔버스 줌 방지
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = chartRef.current;
    if (!el) return;
    e.stopPropagation();
  }, []);

  // 차트 데이터 파싱
  const parseChartData = useCallback(() => {
    if (!data.result) return null;
    try {
      const parsed = JSON.parse(data.result);
      if (parsed.__chart__) {
        return parsed;
      }
      // 배열 데이터를 차트용으로 변환
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          type: data.chartType || 'bar',
          labels: parsed.map((item: Record<string, unknown>, idx: number) => item.name || item.label || `항목${idx + 1}`),
          datasets: [{
            label: '값',
            data: parsed.map((item: Record<string, unknown>) => item.value || item.amount || 0),
          }],
        };
      }
    } catch {
      // JSON이 아니면 null
    }
    return null;
  }, [data.result, data.chartType]);

  const chartData = parseChartData();

  // 간단한 바 차트 렌더링 (SVG)
  const renderBarChart = () => {
    if (!chartData) return null;
    
    const maxValue = Math.max(...chartData.datasets[0].data as number[]);
    const labels = chartData.labels as string[];
    const values = chartData.datasets[0].data as number[];
    const barWidth = 100 / labels.length;
    
    return (
      <svg viewBox="0 0 300 150" className="w-full h-full">
        {/* Y축 그리드 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="40"
            y1={130 - ratio * 100}
            x2="290"
            y2={130 - ratio * 100}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* 바 차트 */}
        {values.map((value, idx) => {
          const height = (value / maxValue) * 100;
          const x = 50 + idx * (240 / labels.length);
          const color = getBarColor(idx);
          
          return (
            <g key={idx}>
              <rect
                x={x}
                y={130 - height}
                width={barWidth * 2}
                height={height}
                fill={color}
                rx="2"
              />
              {/* 라벨 */}
              <text
                x={x + barWidth}
                y="145"
                textAnchor="middle"
                fontSize="8"
                fill="#6b7280"
              >
                {String(labels[idx]).slice(0, 6)}
              </text>
              {/* 값 */}
              <text
                x={x + barWidth}
                y={125 - height}
                textAnchor="middle"
                fontSize="7"
                fill="#374151"
              >
                {formatChartValue(value)}
              </text>
            </g>
          );
        })}
        
        {/* Y축 라벨 */}
        <text x="5" y="130" fontSize="7" fill="#6b7280">0</text>
        <text x="5" y="30" fontSize="7" fill="#6b7280">{formatChartValue(maxValue)}</text>
      </svg>
    );
  };

  // 라인 차트 렌더링
  const renderLineChart = () => {
    if (!chartData) return null;
    
    const maxValue = Math.max(...chartData.datasets[0].data as number[]);
    const values = chartData.datasets[0].data as number[];
    const labels = chartData.labels as string[];
    
    const points = values.map((value, idx) => {
      const x = 50 + idx * (240 / (values.length - 1 || 1));
      const y = 130 - (value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg viewBox="0 0 300 150" className="w-full h-full">
        {/* 그리드 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="40"
            y1={130 - ratio * 100}
            x2="290"
            y2={130 - ratio * 100}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* 라인 */}
        <polyline
          points={points}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        
        {/* 점 */}
        {values.map((value, idx) => {
          const x = 50 + idx * (240 / (values.length - 1 || 1));
          const y = 130 - (value / maxValue) * 100;
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="4" fill="#8b5cf6" />
              <text x={x} y="145" textAnchor="middle" fontSize="7" fill="#6b7280">
                {String(labels[idx]).slice(0, 4)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // 파이 차트 렌더링
  const renderPieChart = () => {
    if (!chartData) return null;
    
    const values = chartData.datasets[0].data as number[];
    const labels = chartData.labels as string[];
    const total = values.reduce((a, b) => a + b, 0);
    
    let currentAngle = -90;
    
    return (
      <svg viewBox="0 0 300 150" className="w-full h-full">
        <g transform="translate(100, 75)">
          {values.map((value, idx) => {
            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const x1 = 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 * Math.cos(((startAngle + angle) * Math.PI) / 180);
            const y2 = 50 * Math.sin(((startAngle + angle) * Math.PI) / 180);
            
            const largeArc = angle > 180 ? 1 : 0;
            const pathD = `M 0 0 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            return (
              <path
                key={idx}
                d={pathD}
                fill={getBarColor(idx)}
              />
            );
          })}
        </g>
        
        {/* 범례 */}
        <g transform="translate(180, 20)">
          {labels.slice(0, 5).map((label, idx) => (
            <g key={idx} transform={`translate(0, ${idx * 20})`}>
              <rect width="10" height="10" fill={getBarColor(idx)} rx="2" />
              <text x="15" y="9" fontSize="8" fill="#374151">
                {String(label).slice(0, 8)} ({((values[idx] / total) * 100).toFixed(0)}%)
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[320px] max-w-[400px]
        bg-gradient-to-br from-violet-50 to-purple-100
        ${selected ? 'ring-2 ring-violet-400 border-violet-500' : 'border-violet-300'}
        transition-all duration-200 hover:shadow-xl
      `}
      onClick={() => setSelectedNode(id)}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white">
            <BarChart3 size={16} />
          </div>
          <span className="font-bold text-gray-800">
            {data.label || '차트'}
          </span>
        </div>
        {chartData && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: 차트 이미지 다운로드
            }}
            className="p-1 rounded hover:bg-violet-200 transition-colors"
            title="이미지로 저장"
          >
            <Download size={14} className="text-violet-600" />
          </button>
        )}
      </div>

      {/* 차트 타입 배지 */}
      <div className="flex gap-1 mb-2">
        {['bar', 'line', 'pie'].map((type) => (
          <span
            key={type}
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              data.chartType === type
                ? 'bg-violet-500 text-white'
                : 'bg-violet-100 text-violet-600'
            }`}
          >
            {type === 'bar' ? '📊 바' : type === 'line' ? '📈 라인' : '🥧 파이'}
          </span>
        ))}
      </div>

      {/* 차트 영역 */}
      <div 
        ref={chartRef}
        onWheel={handleWheel}
        className="bg-white rounded-lg border border-violet-200 p-2 h-40"
      >
        {chartData ? (
          data.chartType === 'line' ? renderLineChart() :
          data.chartType === 'pie' ? renderPieChart() :
          renderBarChart()
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            워크플로우를 실행하면 차트가 표시됩니다...
          </div>
        )}
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white"
      />
    </div>
  );
}

// 바 색상
function getBarColor(index: number): string {
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  return colors[index % colors.length];
}

// 차트 값 포맷팅
function formatChartValue(value: number): string {
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(1)}조`;
  if (Math.abs(value) >= 1e8) return `${(value / 1e8).toFixed(0)}억`;
  if (Math.abs(value) >= 1e4) return `${(value / 1e4).toFixed(0)}만`;
  return value.toLocaleString();
}

export default memo(ChartNode);
