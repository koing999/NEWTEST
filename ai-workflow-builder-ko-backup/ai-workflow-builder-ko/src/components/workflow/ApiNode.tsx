'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe, TrendingUp, FileText, Newspaper, Cloud, LucideIcon, Zap } from 'lucide-react';
import { ApiNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

const presetIcons: Record<string, LucideIcon> = {
  'custom': Globe,
  'dart': FileText,
  'stock-kr': TrendingUp,
  'stock-us': TrendingUp,
  'news': Newspaper,
  'weather': Cloud,
};

const presetLabels: Record<string, string> = {
  'custom': '커스텀 API',
  'dart': 'DART 공시',
  'stock-kr': '한국 주식',
  'stock-us': '미국 주식',
  'news': '뉴스',
  'weather': '날씨',
};

const presetColors: Record<string, string> = {
  'custom': 'from-slate-500 to-slate-600',
  'dart': 'from-blue-600 to-indigo-600',
  'stock-kr': 'from-red-500 to-rose-600',
  'stock-us': 'from-green-500 to-emerald-600',
  'news': 'from-purple-500 to-violet-600',
  'weather': 'from-sky-500 to-cyan-600',
};

function ApiNode({ id, data, selected }: NodeProps<ApiNodeData>) {
  const { nodeResults, setSelectedNode } = useWorkflowStore();
  const result = nodeResults[id];
  
  const isRunning = result?.status === 'running';
  const isSuccess = result?.status === 'success';
  const isError = result?.status === 'error';
  
  const preset = data.preset || 'custom';
  const PresetIcon = presetIcons[preset] || Globe;
  const presetColor = presetColors[preset] || presetColors['custom'];

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`
        min-w-[220px] rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-indigo-500 shadow-indigo-200' : 'border-gray-200'}
        ${isRunning ? 'border-yellow-400 animate-pulse' : ''}
        ${isSuccess ? 'border-green-400' : ''}
        ${isError ? 'border-red-400' : ''}
        bg-white
      `}
    >
      {/* 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-indigo-400 border-2 border-white"
      />

      {/* 헤더 */}
      <div className={`px-3 py-2 bg-gradient-to-r ${presetColor} rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <PresetIcon size={14} className="text-white" />
          <span className="text-white font-medium text-sm">{data.label}</span>
          {isRunning && <Zap size={12} className="text-yellow-300 animate-pulse" />}
        </div>
      </div>

      {/* 바디 */}
      <div className="p-3 space-y-2">
        {/* 프리셋 타입 */}
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-0.5 rounded text-xs font-medium text-white
            bg-gradient-to-r ${presetColor}
          `}>
            {presetLabels[preset]}
          </span>
          <span className="text-xs text-gray-500">{data.method}</span>
        </div>

        {/* URL 미리보기 (커스텀일 때) */}
        {preset === 'custom' && data.url && (
          <div className="text-xs text-gray-600 truncate bg-gray-100 px-2 py-1 rounded">
            {data.url}
          </div>
        )}

        {/* 프리셋별 정보 */}
        {preset === 'dart' && data.presetConfig?.corpCode && (
          <div className="text-xs">
            <span className="text-gray-500">기업코드:</span>
            <span className="ml-1 font-mono text-blue-600">{data.presetConfig.corpCode}</span>
          </div>
        )}

        {(preset === 'stock-kr' || preset === 'stock-us') && data.presetConfig?.stockCode && (
          <div className="text-xs">
            <span className="text-gray-500">종목:</span>
            <span className="ml-1 font-mono text-green-600 font-bold">{data.presetConfig.stockCode}</span>
          </div>
        )}

        {/* 실행 결과 미리보기 */}
        {isSuccess && data.result && (
          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
            <div className="flex items-center justify-between text-xs text-green-700 mb-1">
              <span>응답</span>
              {data.statusCode && (
                <span className="font-mono bg-green-200 px-1 rounded">{data.statusCode}</span>
              )}
            </div>
            <div className="text-xs text-gray-700 max-h-20 overflow-y-auto font-mono">
              {data.result.length > 100 ? data.result.slice(0, 100) + '...' : data.result}
            </div>
            {data.latency && (
              <div className="text-[10px] text-gray-500 mt-1">
                {data.latency}ms
              </div>
            )}
          </div>
        )}

        {/* 에러 표시 */}
        {isError && result?.error && (
          <div className="p-2 bg-red-50 rounded text-xs text-red-600 border border-red-200">
            {result.error}
          </div>
        )}
      </div>

      {/* 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-indigo-400 border-2 border-white"
      />
    </div>
  );
}

export default memo(ApiNode);
