'use client';

import { 
  Type, Bot, Wand2, FileOutput, GitBranch, Repeat, Globe, Timer, Bell, 
  Shuffle, Scissors, Calendar, Download, ListTodo, Database, Route, 
  UserCheck, StickyNote, Code2, GitMerge, FileText, Eraser, Calculator,
  FunctionSquare, Filter, TrendingUp, Users, GitCompare, Table, BarChart3,
  Brain, Sparkles
} from 'lucide-react';
import { NodeType } from '@/types/workflow';

// 노드 타입별 아이콘
const nodeIcons: Record<NodeType, React.ComponentType<{ size?: number }>> = {
  input: Type,
  llm: Bot,
  transform: Wand2,
  output: FileOutput,
  condition: GitBranch,
  loop: Repeat,
  api: Globe,
  delay: Timer,
  webhook: Bell,
  random: Shuffle,
  slice: Scissors,
  datetime: Calendar,
  filesave: Download,
  taskbreakdown: ListTodo,
  state: Database,
  airouter: Route,
  approval: UserCheck,
  note: StickyNote,
  code: Code2,
  parallel: GitMerge,
  template: FileText,
  htmlclean: Eraser,
  math: Calculator,
  formula: FunctionSquare,
  multifilter: Filter,
  stockalert: TrendingUp,
  multiagent: Users,
  compareinput: GitCompare,
  tableoutput: Table,
  chart: BarChart3,
  intentparser: Brain,
  smartanalysis: Sparkles,
};

// 노드 타입별 색상
const nodeColors: Record<NodeType, string> = {
  input: 'bg-emerald-500',
  llm: 'bg-blue-500',
  transform: 'bg-amber-500',
  output: 'bg-purple-500',
  condition: 'bg-orange-500',
  loop: 'bg-cyan-500',
  api: 'bg-indigo-500',
  delay: 'bg-yellow-500',
  webhook: 'bg-pink-500',
  random: 'bg-teal-500',
  slice: 'bg-rose-500',
  datetime: 'bg-violet-500',
  filesave: 'bg-lime-500',
  taskbreakdown: 'bg-indigo-500',
  state: 'bg-teal-500',
  airouter: 'bg-violet-500',
  approval: 'bg-amber-500',
  note: 'bg-amber-400',
  code: 'bg-green-500',
  parallel: 'bg-fuchsia-500',
  template: 'bg-sky-500',
  htmlclean: 'bg-red-500',
  math: 'bg-emerald-500',
  formula: 'bg-violet-500',
  multifilter: 'bg-cyan-500',
  stockalert: 'bg-amber-500',
  multiagent: 'bg-purple-500',
  compareinput: 'bg-cyan-500',
  tableoutput: 'bg-emerald-500',
  chart: 'bg-violet-500',
  intentparser: 'bg-purple-600',
  smartanalysis: 'bg-gradient-to-r from-violet-500 to-pink-500',
};

export function getNodeIcon(type: NodeType, size: number = 16) {
  const Icon = nodeIcons[type];
  return Icon ? <Icon size={size} /> : null;
}

export function getNodeColor(type: NodeType): string {
  return nodeColors[type] || 'bg-gray-500';
}
