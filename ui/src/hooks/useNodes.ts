import { useState, useCallback } from "react";
import type { CanvasNode } from "../components/canvas";

function findOpenPosition(
  existing: CanvasNode[],
  width: number,
  height: number,
) {
  const GAP = 20;
  let x = 200;
  let y = 200;

  const collides = (cx: number, cy: number) =>
    existing.some(
      (n) =>
        cx < n.x + n.width + GAP &&
        cx + width + GAP > n.x &&
        cy < n.y + n.height + GAP &&
        cy + height + GAP > n.y,
    );

  while (collides(x, y)) {
    x += width + GAP;
  }

  return { x, y };
}

export function useNodes() {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);

  const addNode = useCallback(
    (
      width: number,
      height: number,
      render: (id: string, callbacks: import("../components/canvas/types").NodeCallbacks) => React.ReactNode,
    ) => {
      setNodes((prev) => {
        const { x, y } = findOpenPosition(prev, width, height);
        return [...prev, { id: crypto.randomUUID(), x, y, width, height, render }];
      });
    },
    [],
  );

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => {
      const moving = prev.find((n) => n.id === id);
      if (!moving) return prev;

      const collides = prev.some(
        (other) =>
          other.id !== id &&
          x < other.x + other.width &&
          x + moving.width > other.x &&
          y < other.y + other.height &&
          y + moving.height > other.y,
      );

      if (collides) return prev;
      return prev.map((n) => (n.id === id ? { ...n, x, y } : n));
    });
  }, []);

  const resizeNode = useCallback((id: string, width: number, height: number) => {
    setNodes((prev) => {
      const node = prev.find((n) => n.id === id);
      if (!node) return prev;

      const collides = prev.some(
        (other) =>
          other.id !== id &&
          node.x < other.x + other.width &&
          node.x + width > other.x &&
          node.y < other.y + other.height &&
          node.y + height > other.y,
      );

      if (collides) return prev;
      return prev.map((n) => (n.id === id ? { ...n, width, height } : n));
    });
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { nodes, addNode, moveNode, resizeNode, removeNode };
}
