import { useState, useCallback, useRef, type MouseEvent } from "react";
import type { Camera, CanvasNode, DragState } from "./types";

export function useCanvas(
  onNodeMove: (id: string, x: number, y: number) => void,
  onNodeResize: (id: string, width: number, height: number) => void,
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

  const handleResizeStart = useCallback(
    (e: MouseEvent, id: string, width: number, height: number) => {
      dragRef.current = {
        type: "resize",
        nodeId: id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startX: 0,
        startY: 0,
        startWidth: width,
        startHeight: height,
      };
      e.stopPropagation();
      e.preventDefault();
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
      } else if (
        drag.type === "resize" &&
        drag.nodeId &&
        drag.startWidth !== undefined &&
        drag.startHeight !== undefined
      ) {
        const newWidth = Math.max(96, drag.startWidth + dx);
        const newHeight = Math.max(64, drag.startHeight + dy);
        onNodeResize(drag.nodeId, newWidth, newHeight);
      }
    },
    [onNodeMove, onNodeResize],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return {
    camera,
    containerRef,
    handlePanStart,
    handleNodeDragStart,
    handleResizeStart,
    handleMouseMove,
    handleMouseUp,
  };
}
