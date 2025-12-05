'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Copy,
} from 'lucide-react';
import { useNovelStore, Character, PromptTemplate } from '@/lib/stores/novel-store';
import { useWorkflowStore } from '@/lib/stores/workflow-store';

type TabType = 'characters' | 'templates' | 'settings' | 'rules';

export default function NovelSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(null);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  
  const { 
    characters, 
    templates, 
    novelSettings, 
    writingRules,
    generateSystemPrompt,
    exportAll,
    importAll,
    deleteCharacter,
    deleteTemplate,
  } = useNovelStore();
  
  const { nodes, updateNodeData } = useWorkflowStore();

  // 템플릿 적용 함수
  const applyTemplate = (template: PromptTemplate) => {
    const systemPrompt = generateSystemPrompt();
    
    // LLM 노드 찾기
    const llmNode = nodes.find(n => n.data.type === 'llm');
    if (llmNode) {
      updateNodeData(llmNode.id, {
        systemPrompt: systemPrompt,
        userPrompt: template.userPromptTemplate,
        temperature: 0.8,  // 소설 작성에는 약간 높은 창의성
        maxTokens: 4000,   // 긴 출력
      });
      alert(`✅ "${template.name}" 템플릿이 적용되었습니다!`);
    } else {
      alert('⚠️ AI 모델 노드를 먼저 추가해주세요.');
    }
  };

  // 시스템 프롬프트만 복사
  const copySystemPrompt = () => {
    const prompt = generateSystemPrompt();
    navigator.clipboard.writeText(prompt);
    alert('📋 시스템 프롬프트가 클립보드에 복사되었습니다!');
  };

  // 내보내기/가져오기
  const handleExport = () => {
    const json = exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novel-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        importAll(text);
        alert('✅ 설정을 불러왔습니다!');
      }
    };
    input.click();
  };

  const tabs = [
    { id: 'templates' as TabType, label: '템플릿', icon: Sparkles },
    { id: 'characters' as TabType, label: '캐릭터', icon: Users },
    { id: 'settings' as TabType, label: '작품설정', icon: BookOpen },
    { id: 'rules' as TabType, label: '규칙', icon: Settings },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-indigo-50 to-white border-r border-indigo-100 flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-indigo-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-indigo-900">소설 작성 도구</h2>
        </div>
        
        {/* 빠른 액션 버튼들 */}
        <div className="flex gap-2">
          <button
            onClick={copySystemPrompt}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Copy size={14} />
            프롬프트 복사
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="설정 내보내기"
          >
            <Download size={16} className="text-gray-600" />
          </button>
          <button
            onClick={handleImport}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="설정 가져오기"
          >
            <Upload size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-indigo-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* 템플릿 탭 */}
        {activeTab === 'templates' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">
              클릭하면 AI 노드에 자동 적용됩니다
            </p>
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-800">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.description}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    template.category === 'scene' ? 'bg-blue-100 text-blue-700' :
                    template.category === 'rewrite' ? 'bg-amber-100 text-amber-700' :
                    template.category === 'dialogue' ? 'bg-green-100 text-green-700' :
                    template.category === 'description' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {template.category === 'scene' ? '씬' :
                     template.category === 'rewrite' ? '리라이트' :
                     template.category === 'dialogue' ? '대화' :
                     template.category === 'description' ? '묘사' : '커스텀'}
                  </span>
                </div>
                {template.variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <span key={v} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 캐릭터 탭 */}
        {activeTab === 'characters' && (
          <div className="space-y-2">
            {characters.map((char) => (
              <div
                key={char.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedCharacter(
                    expandedCharacter === char.id ? null : char.id
                  )}
                >
                  <div className="flex items-center gap-2">
                    {expandedCharacter === char.id ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                    <span className="font-medium text-sm">{char.name}</span>
                    <span className="text-xs text-gray-500">
                      {char.mbti}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`"${char.name}" 캐릭터를 삭제할까요?`)) {
                        deleteCharacter(char.id);
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {expandedCharacter === char.id && (
                  <div className="px-3 pb-3 text-xs space-y-2 border-t border-gray-100 pt-2">
                    <div><span className="text-gray-500">나이:</span> {char.age}</div>
                    <div><span className="text-gray-500">역할:</span> {char.role}</div>
                    <div><span className="text-gray-500">말투:</span> {char.speechStyle}</div>
                    <div><span className="text-gray-500">성격:</span> {char.personality}</div>
                    <div><span className="text-gray-500">습관:</span> {char.habits.join(', ')}</div>
                    <div><span className="text-gray-500">관계:</span> {char.relationships}</div>
                  </div>
                )}
              </div>
            ))}
            
            <button
              onClick={() => alert('캐릭터 추가 모달 (구현 예정)')}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">캐릭터 추가</span>
            </button>
          </div>
        )}

        {/* 작품 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-1">작품 제목</label>
              <div className="font-medium text-sm">{novelSettings.title}</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-1">장르</label>
              <div className="flex flex-wrap gap-1">
                {novelSettings.genre.map((g) => (
                  <span key={g} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-1">배경</label>
              <div className="text-sm">{novelSettings.era}, {novelSettings.setting}</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-1">주제</label>
              <div className="text-sm">{novelSettings.theme}</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-1">목표 분량</label>
              <div className="text-sm font-medium text-indigo-600">
                {novelSettings.targetLength.toLocaleString()}자 이상
              </div>
            </div>
          </div>
        )}

        {/* 규칙 탭 */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-2">금지 단어</label>
              <div className="flex flex-wrap gap-1">
                {writingRules.bannedWords.map((word) => (
                  <span key={word} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-2">분량 증량</label>
              <div className="text-sm font-medium text-indigo-600">
                +{Math.round((writingRules.lengthMultiplier - 1) * 100)}%
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="block text-xs text-gray-500 mb-2">스타일 가이드</label>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {writingRules.styleGuide.slice(0, 300)}...
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="p-3 border-t border-indigo-100 bg-indigo-50">
        <div className="text-xs text-indigo-600">
          <div className="flex justify-between mb-1">
            <span>등록 캐릭터</span>
            <span className="font-medium">{characters.length}명</span>
          </div>
          <div className="flex justify-between">
            <span>프롬프트 템플릿</span>
            <span className="font-medium">{templates.length}개</span>
          </div>
        </div>
      </div>
    </div>
  );
}
