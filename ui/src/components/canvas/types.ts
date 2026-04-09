export interface NodeCallbacks {
  onRemove: (id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
}

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  render: (id: string, callbacks: NodeCallbacks) => React.ReactNode;
}

export interface Camera {
  x: number;
  y: number;
}

export interface DragState {
  type: "pan" | "node" | "resize";
  nodeId?: string;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
  startWidth?: number;
  startHeight?: number;
}
