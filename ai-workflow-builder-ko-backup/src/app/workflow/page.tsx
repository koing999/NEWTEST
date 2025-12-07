// app/workflow/page.tsx
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import Canvas from '@/components/workflow/Canvas';

export default function WorkflowPage() {
  return (
    <div className="w-screen h-screen bg-gray-50">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}
