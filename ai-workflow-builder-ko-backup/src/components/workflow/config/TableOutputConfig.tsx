'use client';

import { TableOutputNodeData } from '@/types/workflow';

interface TableOutputConfigProps {
  data: TableOutputNodeData;
  nodeId: string;
  updateNodeData: (nodeId: string, data: Partial<TableOutputNodeData>) => void;
}

export function TableOutputConfig({ data, nodeId, updateNodeData }: TableOutputConfigProps) {
  return (
    <div className="space-y-4">
      {/* 테이블 스타일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">테이블 스타일</label>
        <select
          value={data.tableStyle || 'default'}
          onChange={(e) => updateNodeData(nodeId, { tableStyle: e.target.value as 'default' | 'compact' | 'striped' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        >
          <option value="default">기본</option>
          <option value="compact">컴팩트</option>
          <option value="striped">줄무늬</option>
        </select>
      </div>

      {/* 숫자 포맷 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">숫자 표시 형식</label>
        <select
          value={data.numberFormat || 'korean'}
          onChange={(e) => updateNodeData(nodeId, { numberFormat: e.target.value as 'raw' | 'korean' | 'comma' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        >
          <option value="korean">한국식 (억/조)</option>
          <option value="comma">천 단위 쉼표</option>
          <option value="raw">원본 그대로</option>
        </select>
      </div>

      {/* 열 정렬 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">숫자 열 정렬</label>
        <select
          value={data.numberAlign || 'right'}
          onChange={(e) => updateNodeData(nodeId, { numberAlign: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
        >
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
          <option value="right">오른쪽</option>
        </select>
      </div>

      {/* 증감 표시 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showChange"
          checked={data.showChangeIndicator !== false}
          onChange={(e) => updateNodeData(nodeId, { showChangeIndicator: e.target.checked })}
          className="rounded border-gray-300 text-emerald-600"
        />
        <label htmlFor="showChange" className="text-sm text-gray-600">
          증감 표시 (🔺🔻)
        </label>
      </div>

      {/* 비율 표시 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showPercent"
          checked={data.showPercent !== false}
          onChange={(e) => updateNodeData(nodeId, { showPercent: e.target.checked })}
          className="rounded border-gray-300 text-emerald-600"
        />
        <label htmlFor="showPercent" className="text-sm text-gray-600">
          비율 열 자동 % 표시
        </label>
      </div>

      {/* 미리보기 */}
      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="text-xs text-emerald-700 font-medium mb-2">📊 테이블 미리보기</div>
        <div className="bg-white rounded border border-emerald-100 overflow-hidden">
          <table className="w-full text-[10px]">
            <thead className="bg-emerald-100">
              <tr>
                <th className="px-2 py-1 text-left">항목</th>
                <th className="px-2 py-1 text-right">2024</th>
                <th className="px-2 py-1 text-right">2023</th>
                <th className="px-2 py-1 text-right">증감</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-2 py-1">매출액</td>
                <td className="px-2 py-1 text-right">
                  {data.numberFormat === 'korean' ? '300조' : '300,000,000,000,000'}
                </td>
                <td className="px-2 py-1 text-right">
                  {data.numberFormat === 'korean' ? '280조' : '280,000,000,000,000'}
                </td>
                <td className="px-2 py-1 text-right text-green-600">
                  {data.showChangeIndicator !== false && '🔺'} +7.1%
                </td>
              </tr>
              <tr className="bg-emerald-50/50">
                <td className="px-2 py-1">영업이익</td>
                <td className="px-2 py-1 text-right">45조</td>
                <td className="px-2 py-1 text-right">40조</td>
                <td className="px-2 py-1 text-right text-green-600">
                  {data.showChangeIndicator !== false && '🔺'} +12.5%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 다운로드 안내 */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-700 font-medium">📥 다운로드 형식</div>
        <ul className="text-[10px] text-blue-600 mt-1 space-y-0.5">
          <li>• <strong>CSV</strong>: 엑셀/구글시트 호환</li>
          <li>• <strong>Excel</strong>: 서식 포함 (.xls)</li>
        </ul>
      </div>
    </div>
  );
}
