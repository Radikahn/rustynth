import { useState, useEffect } from "react";
import type { NodeCallbacks } from "../components/canvas/types";
import { invoke } from "@tauri-apps/api/core";

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
  addNode(192, 128, (id, callbacks) => (
    <SynthNode id={id} style={style} callbacks={callbacks} />
  ));
}

function SynthNode({
  id,
  style,
  callbacks,
}: {
  id: string;
  style: string;
  callbacks: NodeCallbacks;
}) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    invoke("create_synth", { id }).then(() => setReady(true));
    return () => {
      invoke("destroy_synth", { id });
    };
  }, [id]);

  const toggle = async () => {
    const nowPlaying = await invoke<boolean>("toggle_synth", { id });
    setPlaying(nowPlaying);
  };

  return (
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
              onClick={() => callbacks.onRemove(id)}
            />
          </span>
        </div>
      </header>
      <div className="w-full h-full flex flex-1 justify-items-center">
        <span>
          <button
            onClick={toggle}
            disabled={!ready}
            className="px-4 py-2 bg-neutral-200 text-neutral-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </span>
      </div>
      <div className="flex justify-end p-1">
        <div
          className="w-3 h-3 cursor-nwse-resize"
          onMouseDown={(e) => callbacks.onResizeStart(e, id)}
        >
          <svg viewBox="0 0 12 12" className="w-full h-full text-neutral-400">
            <path
              d="M11 1v10H1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 5v6H5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 9v2H9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
