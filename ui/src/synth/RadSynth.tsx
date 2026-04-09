import type { NodeCallbacks } from "../components/canvas/types";

/**
 * Adds a synth node to the canvas.
 *
 * @param addNode - the addNode function from useNodes
 * @param style - optional additional tailwind classes
 */
export function createSynth(
  addNode: (
    width: number,
    height: number,
    render: (id: string, callbacks: NodeCallbacks) => React.ReactNode,
  ) => void,
  style = "",
) {
  addNode(192, 128, (id, { onRemove, onResizeStart }) => (
    <div
      className={"border border-black rounded flex flex-col " + style}
      style={{ width: "100%", height: "100%" }}
    >
      <header>
        <div className="flex flex-row px-1 pt-0.5 w-full h-6 bg-neutral-50 border-b border-neutral-700 justify-between items-center">
          <span>
            <button
              className="w-4 h-4 rounded-4xl bg-red-300 hover:bg-red-500 transition-all duration-300 cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onRemove(id)}
            />
          </span>
        </div>
      </header>
      <div className="flex-1">
        <span></span>
      </div>
      <div className="flex justify-end p-1">
        <div
          className="w-3 h-3 cursor-nwse-resize"
          onMouseDown={(e) => onResizeStart(e, id)}
        >
          <svg viewBox="0 0 12 12" className="w-full h-full text-neutral-400">
            <path d="M11 1v10H1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 5v6H5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 9v2H9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  ));
}
