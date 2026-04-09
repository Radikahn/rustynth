import { createFileRoute } from "@tanstack/react-router";
import Header, { type MenuItem } from "../components/Header";
import { Canvas } from "../components/canvas";
import { useNodes } from "../hooks/useNodes";
import { createSynth } from "../synth/RadSynth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { nodes, addNode, moveNode, resizeNode, removeNode } = useNodes();

  const addSynth = () => createSynth(addNode, "bg-white");

  const menus: Record<string, MenuItem[]> = {
    file: [
      {
        label: "new",
        children: [{ label: "synth", action: addSynth }],
      },
    ],
    edit: [{ label: "undo" }, { label: "redo" }],
    view: [{ label: "zoom in" }, { label: "zoom out" }],
    settings: [{ label: "preferences" }],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 shrink-0">
        <Header menus={menus} />
      </div>
      <div className="flex-1">
        <Canvas
          nodes={nodes}
          onNodeMove={moveNode}
          onNodeResize={resizeNode}
          onNodeRemove={removeNode}
        />
      </div>
    </div>
  );
}
