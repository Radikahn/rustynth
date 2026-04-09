export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  content: React.ReactNode;
}

export interface Camera {
  x: number;
  y: number;
}

export interface DragState {
  type: "pan" | "node";
  nodeId?: string;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
}
