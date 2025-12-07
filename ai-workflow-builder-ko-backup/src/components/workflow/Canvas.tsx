// components/workflow/Canvas.tsx (최종 완성본)
'use client';
import ReactFlow, { Background, Controls, NodeTypes, useNodesState, useEdgesState, getRectOfNodes, getTransformForBounds, useReactFlow } from 'reactflow';
import { initialNodes } from '@/lib/workflow/types';
import { runWorkflow } from '@/lib/workflow/engine';
import UnifiedNode from './nodes/UnifiedNode';
import { toPng } from 'html-to-image';
import { useCallback } from 'react';

const nodeTypes: NodeTypes = { custom: UnifiedNode };

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, getNodes } = useReactFlow();

  const handleRun = () => runWorkflow(nodes, edges);

  // 저장
  const handleSave = () => {
    const workflow = { nodes, edges };
    const data = JSON.stringify(workflow, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    alert('워크플로우 저장 완료! 📥');
  };

  // 불러오기
  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const workflow = JSON.parse(ev.target?.result as string);
        setNodes(workflow.nodes || []);
        setEdges(workflow.edges || []);
        setTimeout(() => fitView(), 100);
        alert('워크플로우 불러오기 완료! 🎉');
      } catch (err) {
        alert('파일 오류');
      }
    };
    reader.readAsText(file);
  };

  // PNG 내보내기 (썸네일용)
  const handleExportPNG = useCallback(() => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, 1200, 630, 0.5, 2);
    toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
      backgroundColor: '#f0f0f0',
      width: 1200,
      height: 630,
      style: {
        width: '1200',
        height: '630',
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', `workflow-preview-${Date.now()}.png`);
      a.setAttribute('href', dataUrl);
      a.click();
    });
  }, [getNodes]);

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex gap-3 flex-wrap">
        <button onClick={handleRun} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xl rounded-xl shadow-2xl hover:scale-105 transition-all">
          ▶️ 실행하기
        </button>
        <button onClick={handleSave} className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-105">
          💾 저장
        </button>
        <label className="px-6 py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 cursor-pointer">
          📂 불러오기
          <input type="file" accept=".json" onChange={handleLoad} className="hidden" />
        </label>
        <button onClick={handleExportPNG} className="px-6 py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:scale-105">
          🖼️ PNG 내보내기
        </button>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => setEdges((eds) => [...eds, { ...params, id: `e${Date.now()}` }])}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </>
  );
}
