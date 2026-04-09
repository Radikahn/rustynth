import { useState, useRef, useEffect } from "react";

export interface MenuItem {
  label: string;
  action?: () => void;
  children?: MenuItem[];
}

export default function Header({ menus }: { menus: Record<string, MenuItem[]> }) {
  const [open, setOpen] = useState<string | null>(null);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(null);
        setSubmenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
      setOpen(null);
      setSubmenu(null);
    }
  };

  return (
    <header className="w-full h-full overscroll-none">
      <div className="border-b border-black pl-2 py-1">
        <div ref={menuRef} className="flex items-center divide-x divide-black">
          {Object.keys(menus).map((key) => (
            <div key={key} className="relative px-1">
              <span
                className="cursor-pointer px-1 hover:bg-neutral-300 select-none"
                onClick={() => {
                  setOpen(open === key ? null : key);
                  setSubmenu(null);
                }}
              >
                {key}
              </span>
              {open === key && (
                <div className="absolute left-0 top-full mt-1 min-w-32 bg-white border border-black shadow-md z-50">
                  {menus[key].map((item) => (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() =>
                        item.children ? setSubmenu(item.label) : setSubmenu(null)
                      }
                    >
                      <div
                        className="px-3 py-1 cursor-pointer hover:bg-neutral-200 text-sm flex justify-between"
                        onClick={() => handleItemClick(item)}
                      >
                        {item.label}
                        {item.children && <span className="ml-4">&#9656;</span>}
                      </div>
                      {item.children && submenu === item.label && (
                        <div className="absolute left-full top-0 min-w-32 bg-white border border-black shadow-md z-50">
                          {item.children.map((child) => (
                            <div
                              key={child.label}
                              className="px-3 py-1 cursor-pointer hover:bg-neutral-200 text-sm"
                              onClick={() => handleItemClick(child)}
                            >
                              {child.label}
                            </div>
                          ))}
                        </div>
                      )}
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
