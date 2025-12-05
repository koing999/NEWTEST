'use client';

import { HtmlCleanNodeData } from '@/types/workflow';

interface HtmlCleanConfigProps {
  data: HtmlCleanNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<HtmlCleanNodeData>) => void;
}

export function HtmlCleanConfig({ data, nodeId, updateNodeData }: HtmlCleanConfigProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">제거 옵션</label>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="removeScripts"
            checked={data.removeScripts !== false}
            onChange={(e) => updateNodeData(nodeId, { removeScripts: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="removeScripts" className="text-sm text-gray-600">
            <span className="font-mono text-xs bg-red-100 px-1 rounded">&lt;script&gt;</span> 제거
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="removeStyles"
            checked={data.removeStyles !== false}
            onChange={(e) => updateNodeData(nodeId, { removeStyles: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="removeStyles" className="text-sm text-gray-600">
            <span className="font-mono text-xs bg-red-100 px-1 rounded">&lt;style&gt;</span> 제거
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="removeComments"
            checked={data.removeComments !== false}
            onChange={(e) => updateNodeData(nodeId, { removeComments: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="removeComments" className="text-sm text-gray-600">
            HTML 주석 제거
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">유지 옵션</label>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="keepLinks"
            checked={data.keepLinks || false}
            onChange={(e) => updateNodeData(nodeId, { keepLinks: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="keepLinks" className="text-sm text-gray-600">
            링크 정보 유지 (URL 텍스트로 변환)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="keepImages"
            checked={data.keepImages || false}
            onChange={(e) => updateNodeData(nodeId, { keepImages: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="keepImages" className="text-sm text-gray-600">
            이미지 alt 텍스트 유지
          </label>
        </div>
      </div>

      <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1">
        <p className="text-xs text-red-700 font-medium">💰 토큰 절약 효과</p>
        <p className="text-xs text-red-700">
          HTML 태그 제거 시 평균 <strong>30~50%</strong> 토큰 절약!
        </p>
        <p className="text-[10px] text-red-600">
          DART 공시, 뉴스 API 등 HTML 응답을 AI에 넣기 전 필수
        </p>
      </div>
    </div>
  );
}
