import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Header from "../components/Header";
import { Canvas, type CanvasNode } from "../components/canvas";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n)),
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 shrink-0">
        <Header />
      </div>
      <div className="flex-1">
        <Canvas nodes={nodes} onNodeMove={handleNodeMove} />
      </div>
    </div>
  );
}
