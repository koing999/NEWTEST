'use client';

/**
 * 입출력 노드 카테고리 콘텐츠 렌더러
 * 
 * 대상 노드: input, output, filesave, note
 * 
 * @author AI 워크플로우 빌더 팀
 */

import { memo } from 'react';
import { 
  FileInput, FileOutput, Save, StickyNote,
  Type, File, Code, Download, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeType } from '@/types/workflow';

// ============================================
// 타입 정의
// ============================================

interface IONodeContentProps {
  nodeType: NodeType;
  data: any;
  nodeResult?: {
    status: string;
    output?: any;
    error?: string;
    filename?: string;
  };
}

// ============================================
// 입력 타입 정보
// ============================================

const INPUT_TYPES: Record<string, { label: string; icon: React.ElementType }> = {
  text: { label: '텍스트', icon: Type },
  file: { label: '파일', icon: File },
  json: { label: 'JSON', icon: Code },
};

// ============================================
// 출력 타입 정보
// ============================================

const OUTPUT_TYPES: Record<string, { label: string; icon: string }> = {
  text: { label: '텍스트', icon: '📝' },
  json: { label: 'JSON', icon: '{}' },
  markdown: { label: '마크다운', icon: '📄' },
};

// ============================================
// 파일 타입 정보
// ============================================

const FILE_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  txt: { label: 'TXT', icon: '📄', color: 'text-gray-600' },
  json: { label: 'JSON', icon: '{}', color: 'text-amber-600' },
  csv: { label: 'CSV', icon: '📊', color: 'text-green-600' },
  md: { label: 'MD', icon: '📝', color: 'text-blue-600' },
};

// ============================================
// 메인 렌더러
// ============================================

function IONodeContent({ nodeType, data, nodeResult }: IONodeContentProps) {
  switch (nodeType) {
    case 'input':
      return <InputContent data={data} nodeResult={nodeResult} />;
    case 'output':
      return <OutputContent data={data} nodeResult={nodeResult} />;
    case 'filesave':
      return <FileSaveContent data={data} nodeResult={nodeResult} />;
    case 'note':
      return <NoteContent data={data} />;
    default:
      return <DefaultIOContent />;
  }
}

// ============================================
// Input 노드 콘텐츠
// ============================================

function InputContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const inputType = data.inputType || 'text';
  const typeInfo = INPUT_TYPES[inputType] || INPUT_TYPES.text;
  const TypeIcon = typeInfo.icon;
  const value = data.value || '';

  return (
    <div className="text-xs space-y-2">
      {/* 입력 타입 */}
      <div className="flex items-center gap-2">
        <FileInput size={12} className="text-blue-500" />
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
          <TypeIcon size={10} className="inline mr-0.5" />
          {typeInfo.label}
        </span>
      </div>

      {/* 입력 값 미리보기 */}
      {value ? (
        <div className="bg-white/70 rounded p-2 border border-blue-100">
          {inputType === 'json' ? (
            <pre className="text-[10px] font-mono text-gray-700 overflow-hidden truncate">
              {typeof value === 'string' 
                ? value.slice(0, 60) 
                : JSON.stringify(value, null, 2).slice(0, 60)}
              {value.length > 60 && '...'}
            </pre>
          ) : (
            <div className="text-gray-700 text-[10px] truncate">
              {value.slice(0, 60)}{value.length > 60 && '...'}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50/50 rounded p-2 text-center">
          <span className="text-gray-400 text-[10px]">
            {data.placeholder || '입력을 기다리는 중...'}
          </span>
        </div>
      )}

      {/* 실행 상태 */}
      {nodeResult?.status === 'success' && (
        <div className="flex items-center gap-1 text-green-600 text-[10px]">
          <CheckCircle size={10} />
          <span>입력 완료</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Output 노드 콘텐츠
// ============================================

function OutputContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const outputType = data.outputType || 'text';
  const typeInfo = OUTPUT_TYPES[outputType] || OUTPUT_TYPES.text;
  const result = data.result || nodeResult?.output || '';

  return (
    <div className="text-xs space-y-2">
      {/* 출력 타입 */}
      <div className="flex items-center gap-2">
        <FileOutput size={12} className="text-blue-500" />
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
          {typeInfo.icon} {typeInfo.label}
        </span>
      </div>

      {/* 결과 미리보기 */}
      {result ? (
        <div className={cn(
          'rounded p-2 border max-h-24 overflow-auto',
          'bg-green-50/80 border-green-200'
        )}>
          {outputType === 'json' ? (
            <pre className="text-[10px] font-mono text-gray-800 whitespace-pre-wrap">
              {typeof result === 'string' 
                ? result.slice(0, 200) 
                : JSON.stringify(result, null, 2).slice(0, 200)}
              {(typeof result === 'string' ? result : JSON.stringify(result)).length > 200 && '...'}
            </pre>
          ) : outputType === 'markdown' ? (
            <div className="text-[10px] text-gray-800 prose-sm">
              {result.slice(0, 150)}
              {result.length > 150 && '...'}
            </div>
          ) : (
            <div className="text-[10px] text-gray-800">
              {result.slice(0, 150)}{result.length > 150 && '...'}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded p-3 text-center">
          <span className="text-gray-400 text-[10px]">결과 대기 중...</span>
        </div>
      )}

      {/* 성공 상태 */}
      {nodeResult?.status === 'success' && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-green-600 flex items-center gap-1">
            <CheckCircle size={10} />
            출력 완료
          </span>
          <span className="text-[9px] text-gray-500">
            {typeof result === 'string' ? result.length : JSON.stringify(result).length} chars
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// FileSave 노드 콘텐츠
// ============================================

function FileSaveContent({ data, nodeResult }: { data: any; nodeResult?: any }) {
  const fileType = data.fileType || 'txt';
  const fileInfo = FILE_TYPES[fileType] || FILE_TYPES.txt;
  const filename = data.filename || 'output';

  return (
    <div className="text-xs space-y-2">
      {/* 파일 타입 */}
      <div className="flex items-center gap-2">
        <Save size={12} className="text-blue-500" />
        <span className={cn(
          'px-2 py-0.5 bg-blue-100 rounded text-[10px] font-medium',
          fileInfo.color
        )}>
          {fileInfo.icon} .{fileType}
        </span>
      </div>

      {/* 파일명 미리보기 */}
      <div className="bg-white/70 rounded p-2 border border-blue-100">
        <div className="flex items-center gap-1 text-gray-700">
          <File size={12} className="text-gray-400" />
          <span className="font-mono text-[10px] truncate">
            {filename}
            {data.appendDate && (
              <span className="text-gray-400">_YYYY-MM-DD</span>
            )}
            .{fileType}
          </span>
        </div>
      </div>

      {/* 날짜 추가 옵션 */}
      {data.appendDate && (
        <div className="text-[9px] text-gray-500 flex items-center gap-1">
          <span>📅 날짜 자동 추가</span>
        </div>
      )}

      {/* 저장 완료 */}
      {nodeResult?.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <div className="flex items-center justify-between">
            <span className="text-green-700 text-[10px] flex items-center gap-1">
              <Download size={10} />
              저장됨
            </span>
            {nodeResult.filename && (
              <span className="text-[9px] text-gray-500 truncate max-w-[100px]">
                {nodeResult.filename}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Note 노드 콘텐츠
// ============================================

function NoteContent({ data }: { data: any }) {
  const content = data.content || '';
  const backgroundColor = data.backgroundColor || '#fef3c7';

  return (
    <div className="text-xs">
      {/* 내용 */}
      {content ? (
        <div 
          className="rounded p-2 min-h-[40px]"
          style={{ backgroundColor: backgroundColor + '80' }}
        >
          <div className="text-gray-700 text-[11px] whitespace-pre-wrap">
            {content.slice(0, 100)}{content.length > 100 && '...'}
          </div>
        </div>
      ) : (
        <div 
          className="rounded p-2 text-center"
          style={{ backgroundColor: backgroundColor + '40' }}
        >
          <StickyNote size={16} className="mx-auto text-gray-400 mb-1" />
          <span className="text-gray-400 text-[10px]">메모를 입력하세요</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// 기본 콘텐츠
// ============================================

function DefaultIOContent() {
  return (
    <div className="text-xs text-gray-500">
      <FileInput size={12} className="inline mr-1" />
      입출력 설정 필요
    </div>
  );
}

export default memo(IONodeContent);
export { IONodeContent };
