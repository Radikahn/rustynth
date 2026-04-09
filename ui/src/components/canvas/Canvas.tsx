import type { CanvasNode as CanvasNodeType } from "./types";
import { useCanvas } from "./useCanvas";
import CanvasNode from "./CanvasNode";

const GRID_SIZE = 20;

export default function Canvas({
  nodes,
  onNodeMove,
}: {
  nodes: CanvasNodeType[];
  onNodeMove: (id: string, x: number, y: number) => void;
}) {
  const {
    camera,
    containerRef,
    handlePanStart,
    handleNodeDragStart,
    handleMouseMove,
    handleMouseUp,
  } = useCanvas(onNodeMove);

  const bgX = camera.x % GRID_SIZE;
  const bgY = camera.y % GRID_SIZE;

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
          onDragStart={handleNodeDragStart}
        />
      ))}
    </div>
  );
}
