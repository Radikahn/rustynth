import type { MouseEvent } from "react";
import type { Camera, CanvasNode as CanvasNodeType } from "./types";

export default function CanvasNode({
  node,
  camera,
  onDragStart,
}: {
  node: CanvasNodeType;
  camera: Camera;
  onDragStart: (e: MouseEvent, node: CanvasNodeType) => void;
}) {
  return (
    <div
      className="absolute cursor-move"
      style={{
        transform: `translate(${node.x + camera.x}px, ${node.y + camera.y}px)`,
      }}
      onMouseDown={(e) => onDragStart(e, node)}
    >
      {node.content}
    </div>
  );
}
