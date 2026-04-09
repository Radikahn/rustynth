import { useState, useCallback, useRef, type MouseEvent } from "react";
import type { Camera, CanvasNode, DragState } from "./types";

export function useCanvas(
  onNodeMove: (id: string, x: number, y: number) => void,
) {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const dragRef = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePanStart = useCallback(
    (e: MouseEvent) => {
      if (
        e.button === 1 ||
        (e.button === 0 && e.target === containerRef.current)
      ) {
        dragRef.current = {
          type: "pan",
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startX: camera.x,
          startY: camera.y,
        };
        e.preventDefault();
      }
    },
    [camera],
  );

  const handleNodeDragStart = useCallback(
    (e: MouseEvent, node: CanvasNode) => {
      if (e.button !== 0) return;
      dragRef.current = {
        type: "node",
        nodeId: node.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startX: node.x,
        startY: node.y,
      };
      e.stopPropagation();
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = e.clientX - drag.startMouseX;
      const dy = e.clientY - drag.startMouseY;

      if (drag.type === "pan") {
        setCamera({ x: drag.startX + dx, y: drag.startY + dy });
      } else if (drag.type === "node" && drag.nodeId) {
        onNodeMove(drag.nodeId, drag.startX + dx, drag.startY + dy);
      }
    },
    [onNodeMove],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return {
    camera,
    containerRef,
    handlePanStart,
    handleNodeDragStart,
    handleMouseMove,
    handleMouseUp,
  };
}
