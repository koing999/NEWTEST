/**
 * 소설 작성 전용 상태 관리
 * 
 * 캐릭터 프로필, 프롬프트 템플릿, 작품 설정 등을 관리합니다.
 * 
 * @author AI 워크플로우 빌더 팀
 * @license MIT
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// 타입 정의
// ============================================

export interface Character {
  id: string;
  name: string;
  age: number | string;
  role: string;
  mbti: string;
  speechStyle: '존댓말' | '반말' | '혼합';
  personality: string;
  habits: string[];
  appearance: string;
  background: string;
  relationships: string;
}

export interface NovelSettings {
  title: string;
  genre: string[];
  era: string;
  setting: string;
  theme: string;
  tone: string;
  targetLength: number;  // 목표 글자수
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  category: 'scene' | 'dialogue' | 'description' | 'rewrite' | 'custom';
  variables: string[];
  createdAt: string;
}

export interface WritingRules {
  bannedWords: string[];
  bannedPatterns: string[];
  styleGuide: string;
  lengthMultiplier: number;  // 1.0 = 기본, 1.3 = 30% 증량
}

interface NovelState {
  // 캐릭터 관리
  characters: Character[];
  addCharacter: (char: Character) => void;
  updateCharacter: (id: string, char: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  
  // 작품 설정
  novelSettings: NovelSettings;
  setNovelSettings: (settings: Partial<NovelSettings>) => void;
  
  // 프롬프트 템플릿
  templates: PromptTemplate[];
  addTemplate: (template: PromptTemplate) => void;
  updateTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // 작성 규칙
  writingRules: WritingRules;
  setWritingRules: (rules: Partial<WritingRules>) => void;
  
  // 현재 씬 상태
  currentScene: string;
  setCurrentScene: (scene: string) => void;
  
  // 전체 내보내기/가져오기
  exportAll: () => string;
  importAll: (json: string) => void;
  
  // 시스템 프롬프트 생성
  generateSystemPrompt: () => string;
}

// ============================================
// 기본 템플릿들
// ============================================

const defaultTemplates: PromptTemplate[] = [
  {
    id: 'scene-basic',
    name: '기본 씬 작성',
    description: '새로운 씬을 처음부터 작성합니다',
    category: 'scene',
    systemPrompt: '',  // generateSystemPrompt()로 자동 생성
    userPromptTemplate: `## 작성할 씬
{{scene_description}}

## 이전 내용 요약
{{previous_summary}}

위 내용을 바탕으로 씬을 작성해주세요.`,
    variables: ['scene_description', 'previous_summary'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scene-rewrite',
    name: '씬 리라이트 (증량)',
    description: '기존 씬을 30~40% 증량하여 리라이트합니다',
    category: 'rewrite',
    systemPrompt: '',
    userPromptTemplate: `## 리라이트할 원본 씬
{{original_scene}}

## 리라이트 지침
- 원본 내용 100% 유지
- 분량 30~40% 증량 (최소 5,500자 목표)
- AI 티 나는 표현 제거
- 캐릭터 일관성 유지

위 원본을 리라이트해주세요.`,
    variables: ['original_scene'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dialogue-only',
    name: '대화 씬 작성',
    description: '대화 위주의 씬을 작성합니다',
    category: 'dialogue',
    systemPrompt: '',
    userPromptTemplate: `## 대화 씬 정보
참여 캐릭터: {{characters}}
상황: {{situation}}
갈등/목표: {{conflict}}

## 대화 작성 지침
- 각 캐릭터의 말투와 성격 반영
- 서브텍스트 활용 (말하지 않는 것으로 전달)
- 적절한 지문과 행동 묘사 포함

위 정보를 바탕으로 대화 씬을 작성해주세요.`,
    variables: ['characters', 'situation', 'conflict'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'description-expand',
    name: '묘사 확장',
    description: '간단한 묘사를 상세하게 확장합니다',
    category: 'description',
    systemPrompt: '',
    userPromptTemplate: `## 확장할 묘사
{{brief_description}}

## 확장 지침
- 오감(시각, 청각, 촉각, 후각, 미각) 활용
- 비유와 은유 적절히 사용
- 분위기와 감정 전달
- 과하지 않게 자연스럽게

위 묘사를 상세하게 확장해주세요.`,
    variables: ['brief_description'],
    createdAt: new Date().toISOString(),
  },
];

// ============================================
// 기본 캐릭터 (인사팀장 버전 기준)
// ============================================

const defaultCharacters: Character[] = [
  {
    id: 'char-minjun',
    name: '강민준',
    age: 39,
    role: '前 S그룹 인사팀장',
    mbti: 'INTJ',
    speechStyle: '존댓말',
    personality: '냉철하고 분석적이나 내면에 깊은 갈등을 품고 있음. 효율을 추구하지만 인간적 고뇌가 있음.',
    habits: ['몽블랑 펜 손가락으로 돌리기', '테이블 검지 탭', '생각할 때 턱 만지기'],
    appearance: '단정한 정장, 날카로운 인상이지만 피로가 묻어나는 눈',
    background: '15년간 247명 정리해고 담당. 퇴직금 1억 2700만원. 인사팀 해체로 본인도 해고됨.',
    relationships: '이소윤(대리) - 복잡한 감정, 김영우(과장) - 해고 대상이었던 인연',
  },
  {
    id: 'char-soyoon',
    name: '이소윤',
    age: '30대 초반',
    role: '인사팀 대리',
    mbti: 'ESTJ',
    speechStyle: '존댓말',
    personality: '원칙주의자, 직설적, 효율 중시. 겉으로는 차가워 보이나 나름의 기준이 있음.',
    habits: ['서류 정리할 때 한숨', '펜 똑딱이기', '안경 밀어올리기'],
    appearance: '깔끔한 정장, 항상 바른 자세, 날카로운 눈매',
    background: '인사팀 실무 담당. 강민준의 방식에 의문을 품으면서도 배움.',
    relationships: '강민준(팀장) - 존경과 반감이 공존',
  },
  {
    id: 'char-youngwoo',
    name: '김영우',
    age: 53,
    role: '영업팀 과장',
    mbti: 'ISFJ',
    speechStyle: '존댓말',
    personality: '순박하고 성실하나 변화에 약함. 가족에 대한 헌신. 자존심과 현실 사이 갈등.',
    habits: ['손 비비기', '헛기침', '눈 피하기'],
    appearance: '약간 구겨진 양복, 흰머리, 지친 표정이지만 선한 눈',
    background: '다운증후군 아들. 고연봉 저성과자로 구조조정 1순위였음.',
    relationships: '강민준(팀장) - 해고당할 뻔한 트라우마, 고마움과 원망',
  },
];

// ============================================
// 기본 설정
// ============================================

const defaultNovelSettings: NovelSettings = {
  title: '숫자 뒤의 사람들',
  genre: ['현대판타지', '직장물', '인간드라마'],
  era: '현대 한국',
  setting: 'S그룹 인사팀',
  theme: '숫자 뒤의 사람들 - 구조조정 담당자의 인간적 고뇌',
  tone: '담담하면서도 깊은 여운',
  targetLength: 5500,
};

const defaultWritingRules: WritingRules = {
  bannedWords: [
    '그러나', '하지만', '그리고', '또한', '게다가',  // 금지 접속사
    '마치', '마냥', '듯이',  // AI 티 나는 표현
    '순간', '찰나',  // 과용 주의
  ],
  bannedPatterns: [
    '~했다. ~했다. ~했다.',  // 단조로운 문장 반복
    '마치 ~ 같은',  // 뻔한 비유
    '그의 마음속에는',  // 직접적 내면 묘사
  ],
  styleGuide: `
## 문체 규칙
1. 문장 길이 변주 (짧은 문장과 긴 문장 교차)
2. 감정은 행동과 신체 반응으로 표현
3. 캐릭터별 말투 일관성 유지
4. 서술자 시점 일관성 (3인칭 제한적 전지)

## 금지 사항
- AI 티 나는 뻔한 표현
- 과도한 설명적 묘사
- 감정 직접 언급 (슬펐다, 기뻤다 등)
- 단조로운 문장 구조 반복
`,
  lengthMultiplier: 1.35,  // 35% 증량
};

// ============================================
// 스토어 구현
// ============================================

export const useNovelStore = create<NovelState>()(
  persist(
    (set, get) => ({
      characters: defaultCharacters,
      novelSettings: defaultNovelSettings,
      templates: defaultTemplates,
      writingRules: defaultWritingRules,
      currentScene: '',

      addCharacter: (char) => {
        set({ characters: [...get().characters, char] });
      },

      updateCharacter: (id, updates) => {
        set({
          characters: get().characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      deleteCharacter: (id) => {
        set({ characters: get().characters.filter((c) => c.id !== id) });
      },

      setNovelSettings: (settings) => {
        set({ novelSettings: { ...get().novelSettings, ...settings } });
      },

      addTemplate: (template) => {
        set({ templates: [...get().templates, template] });
      },

      updateTemplate: (id, updates) => {
        set({
          templates: get().templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },

      deleteTemplate: (id) => {
        set({ templates: get().templates.filter((t) => t.id !== id) });
      },

      setWritingRules: (rules) => {
        set({ writingRules: { ...get().writingRules, ...rules } });
      },

      setCurrentScene: (scene) => {
        set({ currentScene: scene });
      },

      exportAll: () => {
        const { characters, novelSettings, templates, writingRules } = get();
        return JSON.stringify({
          characters,
          novelSettings,
          templates,
          writingRules,
          exportedAt: new Date().toISOString(),
        }, null, 2);
      },

      importAll: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            characters: data.characters || defaultCharacters,
            novelSettings: data.novelSettings || defaultNovelSettings,
            templates: data.templates || defaultTemplates,
            writingRules: data.writingRules || defaultWritingRules,
          });
        } catch (e) {
          console.error('가져오기 실패:', e);
        }
      },

      generateSystemPrompt: () => {
        const { characters, novelSettings, writingRules } = get();
        
        const characterProfiles = characters.map((c) => `
### ${c.name} (${c.age}세, ${c.role})
- **MBTI**: ${c.mbti}
- **성격**: ${c.personality}
- **말투**: ${c.speechStyle}
- **습관**: ${c.habits.join(', ')}
- **외모**: ${c.appearance}
- **배경**: ${c.background}
- **관계**: ${c.relationships}
`).join('\n');

        return `# 소설 작성 AI 프롬프트

당신은 15년 경력의 베테랑 웹소설 작가입니다.
전문 분야: ${novelSettings.genre.join(', ')}

## 작품 정보
- **제목**: ${novelSettings.title}
- **배경**: ${novelSettings.era}, ${novelSettings.setting}
- **주제**: ${novelSettings.theme}
- **톤**: ${novelSettings.tone}
- **목표 분량**: ${novelSettings.targetLength}자 이상

## 등장인물
${characterProfiles}

## 작성 규칙
${writingRules.styleGuide}

### 금지 단어/표현
${writingRules.bannedWords.map(w => `- "${w}"`).join('\n')}

### 금지 패턴
${writingRules.bannedPatterns.map(p => `- ${p}`).join('\n')}

### 분량 목표
- 원본 대비 ${Math.round((writingRules.lengthMultiplier - 1) * 100)}% 증량
- 최소 ${novelSettings.targetLength}자

## 중요 지침
1. 캐릭터의 MBTI와 습관을 행동에 자연스럽게 반영
2. 감정은 신체 반응과 행동으로 표현 (직접 언급 금지)
3. 존칭 체계 엄격 준수
4. AI 티 나는 표현 절대 금지
5. 문장 길이와 구조에 변화를 주어 리듬감 있게
`;
      },
    }),
    {
      name: 'novel-settings-storage',
    }
  )
);
