'use client';

import { memo, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { NodeExecutionResult } from '@/types/workflow';

interface NodeWrapperProps {
  id: string;
  selected: boolean;
  label: string;
  icon: ReactNode;
  color: string;  // 예: 'emerald', 'blue', 'amber'
  gradientFrom?: string;
  gradientTo?: string;
  result?: NodeExecutionResult;
  onClick: () => void;
  children: ReactNode;
  // 핸들 설정
  hasInput?: boolean;
  hasOutput?: boolean;
  outputHandles?: { id: string; position: string; color: string }[];
}

/**
 * 모든 노드의 공통 래퍼 컴포넌트
 * - 헤더 (아이콘 + 라벨 + 상태)
 * - 실행 상태 표시
 * - 핸들 (입력/출력)
 */
export function NodeWrapper({
  id,
  selected,
  label,
  icon,
  color,
  gradientFrom,
  gradientTo,
  result,
  onClick,
  children,
  hasInput = true,
  hasOutput = true,
  outputHandles,
}: NodeWrapperProps) {
  
  const bgGradient = gradientFrom && gradientTo 
    ? `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`
    : `bg-gradient-to-br from-${color}-500 to-${color}-600`;
  
  const borderColor = selected 
    ? 'border-white ring-2 ring-offset-2' 
    : `border-${color}-300/50`;

  return (
    <div
      onClick={onClick}
      className={`
        ${bgGradient} min-w-[200px] rounded-lg shadow-lg border-2 
        transition-all duration-200 cursor-pointer
        ${borderColor}
        ${selected ? `ring-${color}-500` : ''}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-t-lg">
        <div className="text-white">{icon}</div>
        <span className="text-xs font-semibold text-white flex-1 truncate">
          {label}
        </span>
        <StatusIcon result={result} />
      </div>

      {/* 내용 */}
      <div className="p-3 text-white">
        {children}
      </div>

      {/* 입력 핸들 */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className={`!w-3 !h-3 !bg-${color}-300 !border-2 !border-white`}
        />
      )}

      {/* 출력 핸들 */}
      {hasOutput && !outputHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className={`!w-3 !h-3 !bg-${color}-300 !border-2 !border-white`}
        />
      )}

      {/* 다중 출력 핸들 */}
      {outputHandles?.map((handle, index) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          style={{ top: `${30 + index * 20}%` }}
          className={`!w-3 !h-3 !bg-${handle.color}-400 !border-2 !border-white`}
        />
      ))}
    </div>
  );
}

/**
 * 실행 상태 아이콘
 */
export function StatusIcon({ result }: { result?: NodeExecutionResult }) {
  if (!result) return null;
  
  switch (result.status) {
    case 'running':
      return <Loader2 size={14} className="animate-spin text-blue-300" />;
    case 'success':
      return <CheckCircle2 size={14} className="text-green-300" />;
    case 'error':
      return <XCircle size={14} className="text-red-300" />;
    default:
      return null;
  }
}

/**
 * 결과 표시 컴포넌트
 */
export function NodeResult({ 
  result, 
  successText = '완료',
  maxLength = 50 
}: { 
  result?: NodeExecutionResult;
  successText?: string;
  maxLength?: number;
}) {
  if (!result?.output) return null;
  
  const displayText = result.output.length > maxLength 
    ? `${result.output.slice(0, maxLength)}...`
    : result.output;

  return (
    <div className="mt-2 p-2 bg-black/20 rounded text-xs truncate">
      ✅ {successText}: {displayText}
    </div>
  );
}

/**
 * 노드 내부 정보 표시
 */
export function NodeInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs bg-black/20 px-2 py-1 rounded flex justify-between">
      <span className="text-white/70">{label}</span>
      <span className="font-mono text-white">{value}</span>
    </div>
  );
}

/**
 * 노드 태그 (작은 뱃지)
 */
export function NodeTag({ children, color = 'white' }: { children: ReactNode; color?: string }) {
  return (
    <span className={`text-[10px] bg-${color}/20 px-1.5 py-0.5 rounded`}>
      {children}
    </span>
  );
}

export default memo(NodeWrapper);
