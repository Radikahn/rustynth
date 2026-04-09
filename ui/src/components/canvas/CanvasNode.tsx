import type { MouseEvent } from "react";
import type { Camera, CanvasNode as CanvasNodeType, NodeCallbacks } from "./types";

export default function CanvasNode({
  node,
  camera,
  callbacks,
  onDragStart,
}: {
  node: CanvasNodeType;
  camera: Camera;
  callbacks: NodeCallbacks;
  onDragStart: (e: MouseEvent, node: CanvasNodeType) => void;
}) {
  return (
    <div
      className="absolute cursor-move"
      style={{
        transform: `translate(${node.x + camera.x}px, ${node.y + camera.y}px)`,
        width: node.width,
        height: node.height,
      }}
      onMouseDown={(e) => onDragStart(e, node)}
    >
      {node.render(node.id, callbacks)}
    </div>
  );
}
