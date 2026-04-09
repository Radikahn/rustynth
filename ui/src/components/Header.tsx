import { useState, useRef, useEffect } from "react";

const menuItems: Record<string, string[]> = {
  file: ["New", "Open", "Save", "Export"],
  edit: ["Undo", "Redo", "Cut", "Copy", "Paste"],
  view: ["Zoom In", "Zoom Out", "Reset Zoom"],
  settings: ["Preferences", "Key Bindings"],
};

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-full overscroll-none">
      <div className="border-b border-black pl-2 py-1">
        <div ref={menuRef} className="flex items-center divide-x divide-black">
          {Object.keys(menuItems).map((item) => (
            <div key={item} className="relative px-1">
              <span
                className="cursor-pointer px-1 hover:bg-neutral-300 select-none"
                onClick={() => setOpen(open === item ? null : item)}
              >
                {item}
              </span>
              {open === item && (
                <div className="absolute left-0 top-full mt-1 min-w-32 bg-white border border-black shadow-md z-50">
                  {menuItems[item].map((action) => (
                    <div
                      key={action}
                      className="px-3 py-1 cursor-pointer hover:bg-neutral-200 text-sm"
                      onClick={() => setOpen(null)}
                    >
                      {action}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
