import { useCallback, type MouseEvent } from "react";
import type { CanvasNode as CanvasNodeType, NodeCallbacks } from "./types";
import { useCanvas } from "./useCanvas";
import CanvasNode from "./CanvasNode";

const GRID_SIZE = 20;

export default function Canvas({
  nodes,
  onNodeMove,
  onNodeResize,
  onNodeRemove,
}: {
  nodes: CanvasNodeType[];
  onNodeMove: (id: string, x: number, y: number) => void;
  onNodeResize: (id: string, width: number, height: number) => void;
  onNodeRemove: (id: string) => void;
}) {
  const {
    camera,
    containerRef,
    handlePanStart,
    handleNodeDragStart,
    handleResizeStart,
    handleMouseMove,
    handleMouseUp,
  } = useCanvas(onNodeMove, onNodeResize);

  const bgX = camera.x % GRID_SIZE;
  const bgY = camera.y % GRID_SIZE;

  const callbacks: NodeCallbacks = {
    onRemove: onNodeRemove,
    onResizeStart: useCallback(
      (e: MouseEvent, id: string) => {
        const node = nodes.find((n) => n.id === id);
        if (node) handleResizeStart(e, id, node.width, node.height);
      },
      [nodes, handleResizeStart],
    ),
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
      }}
      onMouseDown={handlePanStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {nodes.map((node) => (
        <CanvasNode
          key={node.id}
          node={node}
          camera={camera}
          callbacks={callbacks}
          onDragStart={handleNodeDragStart}
        />
      ))}
    </div>
  );
}
